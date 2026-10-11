const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs');
const makeDB=require('./helpers/d1-sqlite.cjs');
(async()=>{
 const {default:worker,digest,winner,cleanup,TTL,randomInt}=await import('../online/worker.mjs');
 const E=require('../js/engine.js'),W=globalThis.WORDS_DE_22,DB=makeDB(),env={DB,ALLOWED_ORIGINS:'https://test.example'},secret=()=>crypto.randomBytes(32).toString('hex');let ip=0,count=0;
 async function call(path,token,data,extra={}){
  const request=new Request('https://api.example'+path,{method:data===undefined?'GET':'POST',headers:{Origin:'https://test.example','CF-Connecting-IP':'192.0.2.'+(++ip),...(token?{Authorization:'Bearer '+token}:{}),...(data===undefined?{}:{'Content-Type':'application/json'}),...extra},body:data===undefined?undefined:JSON.stringify(data)});
  const response=await worker.fetch(request,env);return {status:response.status,body:await response.json(),headers:response.headers};
 }
 async function group(name,fn){await fn();count++;console.log('✓ '+name);}
 async function room(n=5){const host=secret(),r=await call('/api/rooms',host,{length:n});assert.equal(r.status,200);return {code:r.body.code,host};}
 async function pair(n=5){const r=await room(n);r.guest=secret();assert.equal((await call('/api/rooms/'+r.code+'/join',r.guest,{})).status,200);return r;}
 const path=r=>'/api/rooms/'+r.code;
 await group('Six numeric digits, crypto selection, pinned dictionary and secret target',async()=>{
  for(const n of [4,5,6,7]){const r=await room(n),stored=DB.sqlite.prepare('SELECT * FROM rooms WHERE code=?').get(r.code),view=(await call(path(r),r.host)).body;
   assert.match(r.code,/^\d{6}$/);assert(W.solutions[n].includes(stored.target));assert.equal(stored.word_version,'de-2.2');assert.equal(stored.expires-stored.created,TTL);assert.equal(stored.host_hash,await digest(r.host));assert(!JSON.stringify(stored).includes(r.host));assert(!('solution' in view));assert(!('target' in view));}
  for(let i=0;i<100;i++)assert(randomInt(9)>=0&&randomInt(9)<9);
 });
 await group('Creation retries recover exactly the same room and reject changed length',async()=>{const token=secret();const [a,b]=await Promise.all([call('/api/rooms',token,{length:5}),call('/api/rooms',token,{length:5})]);assert.equal(a.body.code,b.body.code);assert.equal((await call('/api/rooms',token,{length:4})).status,409);});
 await group('Atomic competing joins: only one guest; same token retries recover',async()=>{
  const r=await room(),tokens=[secret(),secret()],joins=await Promise.all(tokens.map(t=>call(path(r)+'/join',t,{})));assert.deepEqual(joins.map(x=>x.status).sort(),[200,409]);const t=tokens[joins.findIndex(x=>x.status===200)];assert.equal((await call(path(r)+'/join',t,{})).status,200);assert.equal((await call(path(r)+'/join',r.host,{})).body.role,'host');
 });
 await group('No result access with room code alone, wrong token or malformed token',async()=>{const r=await pair();for(const token of [undefined,'bad',secret()]){const a=await call(path(r),token);assert([401,403].includes(a.status));assert(!JSON.stringify(a.body).includes('guesses'));}assert.equal((await call(path(r)+'/guesses',secret(),{word:'LEGAT',revision:0})).status,403);});
 await group('Strict methods, body types, bounded streamed bytes and exact fields',async()=>{
  for(const b of [{length:3},{length:'5'},{length:5,target:'LEGAT'},[],null])assert.equal((await call('/api/rooms',secret(),b)).status,400);
  assert.equal((await call('/api/rooms',secret(),{length:5},{'Content-Type':'text/plain'})).status,415);
  assert.equal((await call('/api/rooms',secret(),{length:5,padding:'a'.repeat(600)})).status,413);
  const req=new Request('https://api.example/api/rooms',{method:'POST',headers:{Origin:'https://test.example',Authorization:'Bearer '+secret(),'Content-Type':'application/json'},body:'{'});assert.equal((await worker.fetch(req,env)).status,400);
  assert.equal((await call('/api/rooms',secret())).status,405);
 });
 await group('CORS allowlist, no-store and bearer preflight',async()=>{
  assert.equal((await call('/api/rooms',secret(),{length:5},{Origin:'https://evil.example'})).status,403);
  const r=await room(),res=await call(path(r),r.host);assert.equal(res.headers.get('Cache-Control'),'no-store');assert.equal(res.headers.get('Access-Control-Allow-Origin'),'https://test.example');
  const pre=await worker.fetch(new Request('https://api.example/api/rooms',{method:'OPTIONS',headers:{Origin:'https://test.example'}}),env);assert.equal(pre.status,204);assert(pre.headers.get('Access-Control-Allow-Headers').includes('Authorization'));
 });
 await group('Must have two players before submitting; arbitrary colors/results rejected',async()=>{const r=await room();assert.equal((await call(path(r)+'/guesses',r.host,{word:'LEGAT',revision:0})).body.error,'waiting_for_opponent');await call(path(r)+'/join',secret(),{});assert.equal((await call(path(r)+'/guesses',r.host,{word:'LEGAT',revision:0,colors:[2,2,2,2,2]})).status,400);});
 await group('Dictionary rejects unknown words; umlauts, NFC and independent sharp S',async()=>{
  for(const target of ['KÄSE','STRAẞE','LEGAT']){const r=await pair(E.letters(target).length);DB.sqlite.prepare('UPDATE rooms SET target=? WHERE code=?').run(target,r.code);const res=await call(path(r)+'/guesses',r.host,{word:target==='KÄSE'?'ka\u0308se':target==='STRAẞE'?'straße':'legat',revision:0});assert.equal(res.status,200);assert.equal(res.body.you.rows[0].word,target);assert.deepEqual(res.body.you.rows[0].colors,Array.from(target,()=>2));}
  const r=await pair();assert.equal((await call(path(r)+'/guesses',r.host,{word:'XXXXX',revision:0})).status,422);
 });
 await group('Server uses authentic guesses and two-pass repeated-letter colors',async()=>{const r=await pair(5);DB.sqlite.prepare('UPDATE rooms SET target=? WHERE code=?').run('LEGAT',r.code);const guess=W.accepted[5].find(w=>new Set(w).size<w.length&&w!=='LEGAT');const res=await call(path(r)+'/guesses',r.host,{word:guess,revision:0});assert.deepEqual(res.body.you.rows[0],{word:guess,colors:E.evaluate(guess,'LEGAT')});});
 await group('Identical retries count once; stale changed guesses cannot overwrite',async()=>{const r=await pair();DB.sqlite.prepare('UPDATE rooms SET target=? WHERE code=?').run('LEGAT',r.code);const guess=W.solutions[5].find(w=>w!=='LEGAT');const responses=await Promise.all([call(path(r)+'/guesses',r.host,{word:guess,revision:0}),call(path(r)+'/guesses',r.host,{word:guess,revision:0})]);assert(responses.every(x=>x.status===200));assert(responses.every(x=>x.body.you.revision===1));assert.equal((await call(path(r)+'/guesses',r.host,{word:'LEGAT',revision:0})).status,409);assert.equal((await call(path(r)+'/guesses',r.host,{word:guess,revision:1})).status,422);});
 await group('Different concurrent guesses at same revision yield one accepted attempt',async()=>{const r=await pair();const guesses=W.solutions[5].slice(0,2);const res=await Promise.all(guesses.map(word=>call(path(r)+'/guesses',r.host,{word,revision:0})));assert.deepEqual(res.map(x=>x.status).sort(),[200,409]);assert.equal((await call(path(r),r.host)).body.you.revision,1);});
 await group('Opponent words and solution hidden until both finish, then both boards released',async()=>{const r=await pair();DB.sqlite.prepare('UPDATE rooms SET target=? WHERE code=?').run('LEGAT',r.code);const a=await call(path(r)+'/guesses',r.host,{word:'LEGAT',revision:0});assert(!('solution' in a.body));assert(!('rows' in a.body.opponent));assert.equal((await call(path(r),r.guest)).body.opponent.status,'won');const b=await call(path(r)+'/guesses',r.guest,{word:'LEGAT',revision:0});assert.equal(b.body.complete,true);assert.equal(b.body.solution,'LEGAT');assert.equal(b.body.winner,'draw');const c=await call(path(r),r.host);assert.deepEqual(c.body.opponent.rows,b.body.you.rows);assert.equal((await call(path(r)+'/guesses',r.host,{word:'LEGAT',revision:0})).status,200);assert.equal((await call(path(r)+'/guesses',r.host,{word:'LEGAT',revision:1})).body.error,'finished');});
 await group('Six/seven attempt limits and loss do not reveal target prematurely',async()=>{for(const n of [4,6]){const r=await pair(n),target=DB.sqlite.prepare('SELECT target FROM rooms WHERE code=?').get(r.code).target,guesses=W.solutions[n].filter(w=>w!==target).slice(0,n<6?6:7);let result;for(const [revision,word] of guesses.entries()){result=await call(path(r)+'/guesses',r.host,{word,revision});assert.equal(result.status,200);}assert.equal(result.body.you.status,'lost');assert(!('solution' in result.body));assert.equal((await call(path(r)+'/guesses',r.host,{word:target,revision:guesses.length})).body.error,'finished');}});
 await group('Winner rules: solved wins, fewer attempts wins, successful tie, both lost none',async()=>{const p=(status,n)=>({status,guesses:Array(n).fill('WORD')});assert.equal(winner(p('won',2),p('lost',6)),'host');assert.equal(winner(p('lost',6),p('won',5)),'guest');assert.equal(winner(p('won',2),p('won',3)),'host');assert.equal(winner(p('won',3),p('won',2)),'guest');assert.equal(winner(p('won',2),p('won',2)),'draw');assert.equal(winner(p('lost',6),p('lost',6)),'none');assert.equal(winner(p('won',2),p('playing',0)),null);});
 await group('Reload reads canonical progress; 30-day expiry and scheduled cleanup',async()=>{const r=await pair();await call(path(r)+'/guesses',r.host,{word:'LEGAT',revision:0});assert.equal((await call(path(r),r.host)).body.you.rows[0].word,'LEGAT');DB.sqlite.prepare('UPDATE rooms SET expires=? WHERE code=?').run(Date.now()-1,r.code);assert.equal((await call(path(r),r.host)).status,410);await cleanup(env);assert.equal(DB.sqlite.prepare('SELECT count(*) AS n FROM rooms WHERE code=?').get(r.code).n,0);});
 await group('IP and creation rate limits plus global free-budget circuit breaker',async()=>{
  const headers={'CF-Connecting-IP':'limit-test'},token=secret();for(let i=0;i<5;i++)assert.equal((await call('/api/rooms',token,{length:5},headers)).status,200);assert.equal((await call('/api/rooms',token,{length:5},headers)).status,429);
  const key='global:'+Math.floor(Date.now()/86400000);DB.sqlite.prepare('UPDATE rate_limits SET count=8000 WHERE key=?').run(key);const limited=await call('/api/rooms',secret(),{length:5});assert.equal(limited.status,429);assert.equal(limited.headers.get('Retry-After'),'60');
 });
 console.log(count+' online API/SQLite groups passed; Cloudflare runtime is checked separately.');
})().catch(e=>{console.error(e);process.exitCode=1;});
