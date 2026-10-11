// The existing engine and frozen dictionary run on the server as well as offline.
import '../js/engine.js';
import '../data/words-de-2.2.js';
const E=globalThis.Engine,W=globalThis.WORDS_DE_22;
const accepted=Object.fromEntries(Object.entries(W.accepted).map(([n,a])=>[n,new Set(a)]));
export const TTL=30*86400000;
const EMPTY={revision:0,guesses:[],status:'playing'};
class Fault extends Error { constructor(status,code){super(code);this.status=status;this.code=code;} }
const fail=(s,c)=>{throw new Fault(s,c);};
const exact=(o,keys)=>{if(!o||Array.isArray(o)||typeof o!=='object'||Object.keys(o).sort().join()!==keys.sort().join())fail(400,'invalid_request');};
export async function digest(s){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),n=>n.toString(16).padStart(2,'0')).join('');}
export function randomInt(max){const a=new Uint32Array(1),bound=Math.floor(4294967296/max)*max;do{crypto.getRandomValues(a);}while(a[0]>=bound);return a[0]%max;}
export function winner(a,b){if(a.status==='playing'||b.status==='playing')return null;const x=a.status==='won',y=b.status==='won';return x&&y?(a.guesses.length===b.guesses.length?'draw':a.guesses.length<b.guesses.length?'host':'guest'):x?'host':y?'guest':'none';}
export function projection(room,role){
 const host=JSON.parse(room.host_state),guest=JSON.parse(room.guest_state),both=!!room.guest_hash&&host.status!=='playing'&&guest.status!=='playing';
 const own=role==='host'?host:guest,peer=role==='host'?guest:host;
 const board=p=>({...p,rows:p.guesses.map(word=>({word,colors:E.evaluate(word,room.target)}))});
 return {contract:1,code:room.code,role,length:room.length,wordVersion:room.word_version,attemptLimit:room.length<6?6:7,expires:room.expires,
  joined:!!room.guest_hash,complete:both,you:board(own),opponent:{status:room.guest_hash?peer.status:'waiting',...(both?board(peer):{})},
  ...(both?{solution:room.target,winner:winner(host,guest)}:{})};
}
async function body(request){
 if(!/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type')||''))fail(415,'json_required');
 if(Number(request.headers.get('Content-Length'))>512)fail(413,'request_too_large');
 const reader=request.body?.getReader();if(!reader)fail(400,'invalid_request');const chunks=[];let size=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>512){await reader.cancel();fail(413,'request_too_large');}chunks.push(value);}}finally{reader.releaseLock();}
 const b=new Uint8Array(size);let at=0;for(const c of chunks){b.set(c,at);at+=c.length;}
 try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(b));}catch{fail(400,'invalid_request');}
}
async function limit(db,key,max,expires){
 const r=await db.prepare('INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count < ? RETURNING count').bind(key,expires,max).first();
 if(!r)fail(429,'rate_limited');
}
async function rate(request,db,now,create){
 const minute=Math.floor(now/60000),day=Math.floor(now/86400000),ip=await digest((request.headers.get('CF-Connecting-IP')||'local')+':'+day);
 // Cap application work below Free daily quotas, including indexed limiter writes.
 await limit(db,'global:'+day,8000,(day+2)*86400000);
 await limit(db,'ip:'+ip+':'+minute,60,(minute+2)*60000);
 if(create)await limit(db,'create:'+ip+':'+Math.floor(now/3600000),5,now+7200000);
}
async function read(db,code){return db.prepare('SELECT * FROM rooms WHERE code=?').bind(code).first();}
async function operate(request,env,now){
 const url=new URL(request.url),m=url.pathname.match(/^\/api\/rooms(?:\/(\d{6})(?:\/(join|guesses))?)?$/);
 if(!m)fail(404,'not_found');
 const [,code,action]=m,method=request.method;
 if(!((!code&&method==='POST')||(code&&!action&&method==='GET')||(code&&action&&method==='POST')))fail(405,'method_not_allowed');
 const raw=request.headers.get('Authorization')||'';
 if(!/^Bearer [a-f0-9]{64}$/.test(raw))fail(401,'token_required');
 const hash=await digest(raw.slice(7));
 await rate(request,env.DB,now,!code);
 if(!code){
  const b=await body(request);exact(b,['length']);if(![4,5,6,7].includes(b.length))fail(400,'invalid_length');
  let old=await env.DB.prepare('SELECT * FROM rooms WHERE host_hash=?').bind(hash).first();
  if(old){if(old.expires<=now)fail(410,'expired');if(old.length!==b.length)fail(409,'request_conflict');return projection(old,'host');}
  for(let i=0;i<12;i++){
   const roomCode=String(randomInt(1000000)).padStart(6,'0'),pool=W.solutions[b.length],target=pool[randomInt(pool.length)];
   const result=await env.DB.prepare('INSERT OR IGNORE INTO rooms(code,created,expires,word_version,target,length,host_hash) VALUES(?,?,?,?,?,?,?)').bind(roomCode,now,now+TTL,W.version,target,b.length,hash).run();
   if(result.meta.changes)return projection(await read(env.DB,roomCode),'host');
   old=await env.DB.prepare('SELECT * FROM rooms WHERE host_hash=?').bind(hash).first();if(old){if(old.length!==b.length)fail(409,'request_conflict');return projection(old,'host');}
  }fail(503,'try_later');
 }
 let room=await read(env.DB,code);
 if(action==='join'){
  const b=await body(request);exact(b,[]);
  if(!room||room.expires<=now)fail(410,'expired');
  if(room.host_hash===hash)return projection(room,'host');
  await env.DB.prepare('UPDATE rooms SET guest_hash=? WHERE code=? AND expires>? AND (guest_hash IS NULL OR guest_hash=?)').bind(hash,code,now,hash).run();
  room=await read(env.DB,code);if(room.guest_hash!==hash)fail(409,'room_full');return projection(room,'guest');
 }
 if(!room)fail(410,'expired');
 if(![room.host_hash,room.guest_hash].includes(hash))fail(403,'unauthorized');
 if(room.expires<=now)fail(410,'expired');
 const role=hash===room.host_hash?'host':'guest';
 if(!action)return projection(room,role);
 const b=await body(request);exact(b,['revision','word']);
 if(!Number.isSafeInteger(b.revision)||b.revision<0||b.revision>7||typeof b.word!=='string'||b.word.length>16)fail(400,'invalid_request');
 const word=E.normalize(b.word);if(!accepted[room.length].has(word))fail(422,'invalid_word');
 const column=role==='host'?'host_state':'guest_state',p=JSON.parse(room[column]);
 // A replay of an already accepted revision is acknowledged, even after finish.
 if(b.revision<p.revision){if(p.guesses[b.revision]!==word)fail(409,'revision_conflict');return projection(room,role);}
 if(b.revision!==p.revision)fail(409,'revision_conflict');
 if(p.status!=='playing')fail(409,'finished');
 if(!room.guest_hash)fail(409,'waiting_for_opponent');
 if(p.guesses.includes(word))fail(422,'duplicate_word');
 const guesses=[...p.guesses,word],next={revision:p.revision+1,guesses,status:word===room.target?'won':guesses.length===(room.length<6?6:7)?'lost':'playing'};
 // One compare-and-swap statement prevents concurrent guesses overwriting each other.
 const result=await env.DB.prepare(`UPDATE rooms SET ${column}=? WHERE code=? AND ${column}=? AND expires>?`).bind(JSON.stringify(next),code,room[column],now).run();
 room=await read(env.DB,code);
 if(!result.meta.changes&&JSON.parse(room[column]).guesses[b.revision]!==word)fail(409,'revision_conflict');
 return projection(room,role);
}
export async function cleanup(env,now=Date.now()){
 await env.DB.batch([env.DB.prepare('DELETE FROM rooms WHERE expires<=?').bind(now),env.DB.prepare('DELETE FROM rate_limits WHERE expires<=?').bind(now)]);
}
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin'),allowed=(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
  const headers={'Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','Vary':'Origin','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
  if(origin&&!allowed.includes(origin))return new Response('{"error":"origin_denied"}',{status:403,headers});
  if(origin)headers['Access-Control-Allow-Origin']=origin;
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Max-Age':'600'}});
  try{return new Response(JSON.stringify(await operate(request,env,Date.now())),{headers});}
  catch(error){const status=error instanceof Fault?error.status:503;return new Response(JSON.stringify({error:error instanceof Fault?error.code:'service_unavailable'}),{status,headers:{...headers,...(status===429?{'Retry-After':'60'}:{})}});}
 },
 async scheduled(event,env,ctx){ctx.waitUntil(cleanup(env));}
};
