/* Separate storage contract: never writes wordle-de:v1/v2 or statistics. */
(function(root){
'use strict';
const KEY='wordle-de:online:1',E=root.Engine||(typeof require==='function'?require('./engine.js'):null);
const messages={client_update_required:'Bitte aktualisiere die App für diesen neuen Wortvertrag.',unsupported_word_version:'Dieser Service unterstützt die angefragte Wortversion noch nicht.',token_required:'Teilnehmer-Zugang fehlt.',unauthorized:'Dieser Zugang gehört nicht zu diesem Raum.',expired:'Raum abgelaufen oder nicht mehr vorhanden.',room_full:'Dieser Raum ist bereits belegt.',invalid_word:'Dieses Wort steht nicht in der Wortliste.',duplicate_word:'Dieses Wort hast du schon versucht.',revision_conflict:'Der Spielstand wurde geändert. Bitte synchronisieren.',waiting_for_opponent:'Warte auf den zweiten Spieler.',finished:'Deine Runde ist abgeschlossen.',rate_limited:'Zu viele Anfragen. Bitte eine Minute warten.',origin_denied:'Diese Testversion ist für den Service noch nicht freigegeben.',service_unavailable:'Service vorübergehend nicht erreichbar.',request_conflict:'Diese Anfrage passt nicht zum gespeicherten Raum.'};
const validCode=c=>typeof c==='string'&&/^\d{6}$/.test(c);
const token=()=>Array.from(root.crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
function validateSnapshot(s,code){
 if(!s||s.contract!==1||s.code!==code||!['host','guest'].includes(s.role)||![4,5,6,7].includes(s.length)||!['de-2.2','de-2.3'].includes(s.wordVersion)||s.attemptLimit!==(s.length<6?6:7)||!Number.isSafeInteger(s.expires)||typeof s.joined!=='boolean'||typeof s.complete!=='boolean')throw Error('Ungültiger Online-Spielstand. Originaldaten bleiben erhalten.');
 function player(p){if(!p||!Number.isSafeInteger(p.revision)||p.revision<0||p.revision>s.attemptLimit||!['playing','won','lost'].includes(p.status)||!Array.isArray(p.guesses)||!Array.isArray(p.rows)||p.rows.length!==p.revision||p.guesses.length!==p.revision||p.rows.some((r,i)=>typeof r.word!=='string'||r.word!==p.guesses[i]||!/^[A-ZÄÖÜẞ]{4,7}$/.test(r.word)||E.letters(r.word).length!==s.length||!Array.isArray(r.colors)||r.colors.length!==s.length||r.colors.some(c=>![0,1,2].includes(c))))throw Error('Ungültige Online-Ratewörter. Originaldaten bleiben erhalten.');}
 player(s.you);if(s.complete){player(s.opponent);if(s.you.status==='playing'||s.opponent.status==='playing'||typeof s.solution!=='string'||!/^[A-ZÄÖÜẞ]{4,7}$/.test(s.solution)||E.letters(s.solution).length!==s.length||!['host','guest','draw','none'].includes(s.winner))throw Error('Ungültiger Online-Abschluss.');}
 else if(!s.opponent||!['waiting','playing','won','lost'].includes(s.opponent.status)||s.opponent.rows!==undefined||s.opponent.guesses!==undefined||s.solution!==undefined)throw Error('Ungültige Online-Freigabe.');return s;
}
function validate(s){
 if(!s||s.contract!==1||!Array.isArray(s.rooms)||s.rooms.length>1000)throw Error('Online-Speicher beschädigt. Originaldaten bleiben erhalten.');
 const codes=new Set();for(const r of s.rooms){if(!r||!validCode(r.code)||codes.has(r.code)||!/^[a-f0-9]{64}$/.test(r.token)||typeof r.draft!=='string'||r.draft.length>7||!/^[A-ZÄÖÜẞ]*$/.test(r.draft)||r.pending&&(!Number.isSafeInteger(r.pending.revision)||r.pending.revision<0||r.pending.revision>6||typeof r.pending.word!=='string'||!/^[A-ZÄÖÜẞ]{4,7}$/.test(r.pending.word)))throw Error('Online-Speicher beschädigt. Originaldaten bleiben erhalten.');if(r.snapshot)validateSnapshot(r.snapshot,r.code);codes.add(r.code);}
 if(s.pending?.wordVersion!==undefined&&(!['de-2.2','de-2.3'].includes(s.pending.wordVersion)))throw Error('Unbekannter Online-Wortvertrag.');
 if(s.pending&&(!['create','join'].includes(s.pending.action)||!/^[a-f0-9]{64}$/.test(s.pending.token)||s.pending.action==='join'&&!validCode(s.pending.code)||s.pending.action==='create'&&![4,5,6,7].includes(s.pending.length)))throw Error('Online-Anfrage beschädigt. Originaldaten bleiben erhalten.');return s;
}
function store(storage){
 let raw=storage.getItem(KEY),s=raw===null?{contract:1,rooms:[]}:validate(JSON.parse(raw));
 return {get state(){return s;},write(next){validate(next);if(storage.getItem(KEY)!==raw)throw Error('Anderer Tab hat Online-Daten geändert. Bitte neu laden.');const value=JSON.stringify(next);storage.setItem(KEY,value);raw=value;s=next;}};
}
async function versionedRequest(request,p,path,data){try{return await request(path,p.token,{...data,...(p.wordVersion?{wordVersion:p.wordVersion}:{})});}catch(e){if(e.code!=='invalid_request'||!p.wordVersion)throw e;return request(path,p.token,data);}}
const createRoom=(request,p)=>versionedRequest(request,p,'/api/rooms',{length:p.length}),joinRoom=(request,p)=>versionedRequest(request,p,'/api/rooms/'+p.code+'/join',{});
function api(base,fetcher=root.fetch){
 if(!base)throw Error('Online-Testservice ist noch nicht eingerichtet.');const u=new URL(base);if(u.protocol!=='https:'&&!(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)))throw Error('Sichere API-Adresse erforderlich.');
 return async(path,secret,data)=>{const c=new AbortController(),timer=setTimeout(()=>c.abort(),12000);try{
  const r=await fetcher(u.origin+path,{method:data===undefined?'GET':'POST',headers:{Authorization:'Bearer '+secret,...(data===undefined?{}:{'Content-Type':'application/json'})},body:data===undefined?undefined:JSON.stringify(data),cache:'no-store',credentials:'omit',signal:c.signal});
  const result=await r.json();if(!r.ok){const error=Error(messages[result.error]||'Anfrage konnte nicht ausgeführt werden.');error.code=result.error;throw error;}return result;
 }catch(error){if(error.code)throw error;throw Error(root.navigator?.onLine===false?'Offline. Dein Fortschritt bleibt gespeichert.':'Verbindung unterbrochen. Gespeicherte Anfrage erneut synchronisieren.');}finally{clearTimeout(timer);}};
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function board(rows,n,limit,draft=''){return `<div class="board" style="--n:${n}" role="group" aria-label="Wortraster">${Array.from({length:limit},(_,j)=>{const chars=E.letters(rows[j]?.word||(j===rows.length?draft:''));return '<div class="row">'+Array.from({length:n},(_,i)=>`<span class="tile ${rows[j]?['absent','present','correct'][rows[j].colors[i]]:chars[i]?'filled':''}" aria-label="${esc(chars[i]||'Leer')}${rows[j]?', '+['nicht nutzbar','andere Position','richtige Position'][rows[j].colors[i]]:''}">${esc(chars[i]||'')}</span>`).join('')+'</div>';}).join('')}</div>`;}
function mount(container,{home,apiURL=root.WORDLE_ONLINE_API,code=null}={}){
 let persistence,request,blocked='',error='',active=code,snapshot=null,busy=false,timer,delay=15000,stopped=false,terminal=false;
 try{persistence=store(root.localStorage);}catch(e){blocked=e.message||'Online-Zugänge können nicht gespeichert werden.';}
 try{request=api(apiURL);}catch(e){error=e.message;}
 const own=()=>persistence?.state.rooms.find(r=>r.code===active);
 const route=c=>{const u=new URL(root.location.href);u.hash=c?'online='+c:'';root.history.replaceState(null,'',u.href);};
 const write=s=>{try{persistence.write(s);return true;}catch(e){blocked=e.message;render();return false;}};
 function changeRoom(patch){const r=own();return write({...persistence.state,rooms:persistence.state.rooms.map(x=>x.code===r.code?{...x,...patch}:x)});}
 function render(){
  if(stopped)return;
  const back='<button class="icon-btn" data-online="home" aria-label="Hauptmenü">‹</button>',notice=`<p class="mini" role="status">${esc(blocked||error||(root.navigator.onLine===false?'Offline. Dein Fortschritt bleibt gespeichert.':busy?'Synchronisieren …':snapshot&&!snapshot.joined?'Warte auf den zweiten Spieler.':'Online · Fortschritt automatisch gespeichert'))}</p>`;
  const r=own(),s=snapshot;
  container.classList.toggle('theme-fit',!!r&&!!s);
  if(r&&s){
   const colors={};s.you.rows.forEach(row=>E.letters(row.word).forEach((c,i)=>colors[c]=Math.max(colors[c]??0,row.colors[i])));
   container.innerHTML=`<section class="game theme-game online-game"><header>${back}<div class="game-top"><strong>⚔ Online-Duell · ${s.code}</strong><small>${s.length} Buchstaben · ${s.you.status==='won'?'Gelöst':s.you.status==='lost'?'Nicht gelöst':s.you.revision+'/'+s.attemptLimit+' Versuche'}</small></div><button class="icon-btn" data-online="hub" aria-label="Duellliste">☰</button></header><div class="theme-history ${s.you.status!=='playing'?'online-results':''}">${s.you.status!=='playing'?'<h3>Deine Ratewörter</h3>':''}${board(s.you.rows,s.length,s.attemptLimit,r.draft)}${s.complete?`<h2>${esc({draw:'Unentschieden!',none:'Beide nicht gelöst · kein Sieger.',[s.role]:'Du gewinnst!',[s.role==='host'?'guest':'host']:'Dein Gegner gewinnt.'}[s.winner])}</h2><p>Lösung: <strong class="solution">${esc(s.solution)}</strong></p><h3>Dein Gegner</h3>${board(s.opponent.rows,s.length,s.attemptLimit)}`:s.you.status!=='playing'?'<p>Dein Ergebnis ist gespeichert. Alle Wörter erscheinen, sobald beide fertig sind.</p>':''}</div>${notice}${s.you.status==='playing'?root.DoubleUI.keyboard(colors):''}<button class="secondary" data-online="sync" ${busy?'disabled':''}>Jetzt synchronisieren</button><button class="secondary" data-online="invite">Einladungslink anzeigen</button></section>`;
  }else{
   container.innerHTML=`<header>${back}<strong>⚔ Online-Duelle · 2.1 Test</strong></header><section class="hero theme-intro"><h1>Ein Wort. <span>Zwei Spieler.</span></h1><p>Ohne Konto · sechsstelliger Raumcode</p></section>${notice}<div class="panel"><label for="online-length">Wortlänge</label><select id="online-length">${[4,5,6,7].map(n=>`<option ${n===5?'selected':''}>${n}</option>`).join('')}</select><button class="primary wide" data-online="create" ${busy||blocked||!request?'disabled':''}>Duell erstellen</button><label for="online-code">Raumcode</label><input id="online-code" class="duel-field" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="off" value="${validCode(active)?active:''}"><button class="secondary" data-online="join" ${busy||blocked||!request?'disabled':''}>Beitreten</button>${persistence?.state.pending?'<button class="secondary" data-online="retry">Gespeicherte Anfrage wiederholen</button>':''}</div><p class="mini">Ein iPhone-Link kann Safari öffnen. Gib den Raumcode direkt in deiner installierten App ein. Zugänge gelten nur in diesem Browser und werden nicht in Statistik-Backups exportiert.</p><h2>DEINE DUELLE</h2>${(persistence?.state.rooms||[]).slice().reverse().map(r=>`<button class="mode-card" data-online="open" data-code="${r.code}"><span><strong>${r.code} · ${r.snapshot?.length||'?'} Buchstaben</strong><small>${r.snapshot?.complete?'Abgeschlossen':r.snapshot?.you.status==='playing'?'Fortsetzen':r.snapshot?'Auf Gegner warten':'Synchronisieren'}</small></span><span>›</span></button>`).join('')}`;
  }
 }
 async function run(action){if(busy||blocked||!request||stopped)return;busy=true;error='';terminal=false;clearTimeout(timer);render();try{await action();delay=15000;}catch(e){error=e.message;terminal=['expired','unauthorized','token_required'].includes(e.code);if(persistence.state.pending&&['room_full','expired'].includes(e.code))write({...persistence.state,pending:null});delay=Math.min(delay*2,120000);}finally{busy=false;render();schedule();}}
 async function pendingAction(){
  const p=persistence.state.pending;if(!p)return;const s=p.action==='create'?await createRoom(request,p):await joinRoom(request,p);
  const existing=persistence.state.rooms.find(r=>r.code===s.code);if(existing&&existing.token!==p.token)throw Error('Für diesen Raum ist bereits ein eigener Zugang gespeichert.');
  if(!write({...persistence.state,pending:null,rooms:[...persistence.state.rooms.filter(r=>r.code!==s.code),{code:s.code,token:p.token,draft:existing?.draft||'',snapshot:s}]}))return;
  if(!stopped){active=s.code;snapshot=s;route(active);}
 }
 async function sync(){const r=own();if(!r)return;let s;
  try{s=await request('/api/rooms/'+r.code+(r.pending?'/guesses':''),r.token,r.pending||undefined);}
  catch(e){if(r.pending&&['invalid_word','duplicate_word','finished','revision_conflict','waiting_for_opponent'].includes(e.code)){
    write({...persistence.state,rooms:persistence.state.rooms.map(x=>x.code===r.code?{...x,pending:null}:x)});
    if(e.code==='revision_conflict'||e.code==='finished'){s=await request('/api/rooms/'+r.code,r.token);if(active===r.code)snapshot=s;}
   }throw e;}
  if(active===r.code)snapshot=s;
  write({...persistence.state,rooms:persistence.state.rooms.map(x=>x.code===r.code?{...x,snapshot:s,...(r.pending?{pending:null,draft:''}:{})}:x)});}
 function schedule(){clearTimeout(timer);if(!stopped&&!terminal&&own()&&snapshot&&!snapshot.complete&&root.document.visibilityState==='visible'&&root.navigator.onLine!==false)timer=setTimeout(()=>run(sync),delay);}
 function key(k){if(busy||blocked||terminal||!snapshot||snapshot.you.status!=='playing')return;const r=own();if(!r)return;if(k==='Enter'){
   if(r.pending)return run(sync);const word=r.draft;if(E.letters(word).length!==snapshot.length){error=snapshot.length+' Buchstaben bitte.';render();return;}
   if(changeRoom({pending:{revision:snapshot.you.revision,word}}))run(sync);return;
  }if(r.pending)return;if(k==='Backspace')changeRoom({draft:E.letters(r.draft).slice(0,-1).join('')});else{const c=E.normalize(k);if(!/^[A-ZÄÖÜẞ]$/.test(c)||E.letters(r.draft).length>=snapshot.length)return;changeRoom({draft:r.draft+c});}render();}
 function click(e){const b=e.target.closest('button');if(!b)return;if(b.dataset.key)return key(b.dataset.key);const a=b.dataset.online;
  if(a==='home'){route(null);dispose();home();}else if(a==='hub'){active=null;snapshot=null;route(null);clearTimeout(timer);render();}else if(a==='open'){active=b.dataset.code;route(active);snapshot=own()?.snapshot||null;render();run(sync);}else if(a==='sync'||a==='retry')run(a==='retry'?pendingAction:sync);
  else if(a==='create'||a==='join'){
   if(persistence.state.pending){error='Bitte zuerst die gespeicherte Anfrage wiederholen.';render();return;}
   if(persistence.state.rooms.length>=1000){error='Online-Speicher voll. Bitte eigene Duelle sichern.';render();return;}
   const c=container.querySelector('#online-code').value;if(a==='join'&&!validCode(c)){error='Bitte genau sechs Ziffern eingeben.';render();return;}
   if(a==='join'&&persistence.state.rooms.some(r=>r.code===c)){active=c;route(active);snapshot=own().snapshot||null;render();run(sync);return;}
   const p={action:a,token:token(),...(a==='create'?{length:+container.querySelector('#online-length').value,wordVersion:'de-2.3'}:{code:c,wordVersion:'de-2.3'})};if(write({...persistence.state,pending:p}))run(pendingAction);
  }else if(a==='invite'){
   const u=new URL(root.location.href);u.search='';u.hash='online='+active;error='Raumcode '+active+' · '+u.href;render();
  }
 }
 function physical(e){if(e.ctrlKey||e.metaKey||e.altKey||e.isComposing||e.repeat||e.target.closest('input,textarea,select'))return;if(['Enter','Backspace'].includes(e.key)||/^[a-zA-ZäöüÄÖÜßẞ]$/.test(e.key)){e.preventDefault();key(e.key);}}
 function visibility(){clearTimeout(timer);render();if(root.document.visibilityState==='visible')schedule();}
 function online(){schedule();}
 function dispose(){stopped=true;clearTimeout(timer);container.removeEventListener('click',click);root.document.removeEventListener('keydown',physical);root.document.removeEventListener('visibilitychange',visibility);root.removeEventListener('online',online);root.removeEventListener('offline',visibility);}
 container.addEventListener('click',click);root.document.addEventListener('keydown',physical);root.document.addEventListener('visibilitychange',visibility);root.addEventListener('online',online);root.addEventListener('offline',visibility);
 if(own()){snapshot=own().snapshot||null;render();run(sync);}else render();return {dispose};
}
const apiObject={KEY,validCode,token,validateSnapshot,validate,store,api,createRoom,joinRoom,board,mount};root.WordleOnline=apiObject;if(typeof module!=='undefined')module.exports=apiObject;
})(globalThis);
