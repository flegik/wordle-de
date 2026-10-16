/* Deterministic schema migration and non-destructive local persistence. */
(function(root){
'use strict';
const V=root.WordRegistry||(typeof require==='function'?require('../data/word-registry.js'):null),F=root.WordSelection||(typeof require==='function'?require('./selection.js'):null);
const E=root.Engine||(typeof require==='function'?require('./engine.js'):null);
const G=root.Sessions||(typeof require==='function'?require('./sessions.js'):null);
const D=root.DoubleWordle||(typeof require==='function'?require('./double.js'):null);
const T=root.WordleTower||(typeof require==='function'?require('./tower.js'):null);
const R=root.WordleSpeedrun||(typeof require==='function'?require('./speedrun.js'):null);
const H=root.WordleTheme||(typeof require==='function'?require('./theme.js'):null);
const J=root.WordleDuel||(typeof require==='function'?require('./duel.js'):null);
const SV=root.WordleSurvivor||(typeof require==='function'?require('./survivor.js'):null);
const sessionResult=(session,date)=>session.mode==='survivor'?SV.result(session,date):session.mode==='double'?D.result(session,date):session.mode==='duel'&&J.hasContract(session)?J.result(session,date):session.mode==='theme'&&H.hasContract(session)?H.result(session,date):session.mode==='tower'?T.result(session,date):session.mode==='speedrun'&&R.hasContract(session)?R.result(session,date):G.result(session,date);
const P=root.WordReports||(typeof require==='function'?require('./reports.js'):null);
const Y=root.WordleSync||(typeof require==='function'?require('./sync.js'):null);
const KEY='wordle-de:v2',LEGACY_KEY='wordle-de:v1',SCHEMA=2;
const clone=v=>JSON.parse(JSON.stringify(v));
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
function fresh(){return {...E.fresh(),schema:SCHEMA,sessions:{},sessionEvents:[]};}
function validate(state,words){
 if(state?.doubleLengthChoice!==undefined&&state.doubleLengthChoice!=='random'&&![4,5,6,7].includes(state.doubleLengthChoice))throw Error('Ungültige Doppel-Längenauswahl.');
 if(!object(state)||state.schema!==SCHEMA)throw Error('Unbekannte Speicherversion.');
 // Reuse the proven schema-1 validation unchanged, including daily and streak.
 const legacy=V.resolve(state.wordVersion,words);
 const games=Object.fromEntries(Object.entries(state.games||{}).filter(([,g])=>(g.wordVersion||state.wordVersion)===legacy.version));
 E.validate({...state,schema:1,games},legacy);
 const gameIds=new Set();for(const [key,g] of Object.entries(state.games)){if(gameIds.has(g.id))throw Error('Doppelte Runden-ID.');gameIds.add(g.id);const dict=V.resolve(g.wordVersion||state.wordVersion,words);if(dict.version!==legacy.version)E.validate({...state,schema:1,wordVersion:dict.version,games:{[key]:g},bags:{},last:{}},dict);}
 for(const e of state.events)if(e.wordVersion!==undefined)V.resolve(e.wordVersion,words);
 if(state.roundResults!==undefined){if(!object(state.roundResults)||Object.keys(state.roundResults).length>100000)throw Error('Ungültige Ergebnishistorie.');const events=new Map(state.events.map(e=>[e.id,e]));for(const [id,g] of Object.entries(state.roundResults)){const e=events.get(id);if(g?.id!==id||g.status==='playing'||!e)throw Error('Ungültiges archiviertes Ergebnis.');const dict=V.resolve(g.wordVersion||state.wordVersion,words),key=g.mode==='daily'?'daily:'+g.date:g.mode;E.validate({...E.fresh(),schema:1,wordVersion:dict.version,settings:state.settings,games:{[key]:g},events:[e],streak:(()=>{const t=E.summary(e.mode==='streak'?[e]:[]);return {current:t.current,best:t.best};})(),daily:g.mode==='daily'?{[g.date]:id}:{}},dict);}}
 Y.validate(state);P.validate(state.wordReports);F.validate(state.selection);H.validateBags(state,V.daily());
 if(!object(state.sessions)||!Array.isArray(state.sessionEvents)||state.sessionEvents.length>100000)
  throw Error('Ungültige Session-Datensammlungen.');
 J.validatePending(state,words);
 if(Object.values(state.sessions).filter(s=>s.mode==='survivor'&&s.status==='playing').length>1)throw Error('Mehrere aktive Survivor-Runs.');
 if(state.survivorSelection!==undefined){F.validate(state.survivorSelection);for(const b of Object.values(state.survivorSelection.lengths))if(b.initial.C!==0||b.remaining.C.length)throw Error('Survivor nutzt nur A/B-Wörter.');}
 const ids=new Set(state.events.map(e=>e.id));
 for(const event of state.sessionEvents){G.validateEvent(event,words);if(event.mode==='survivor')SV.validateEvent(event,words);if(event.mode==='duel'&&J.hasContract(event))J.validateEvent(event,words);if(event.mode==='theme'&&H.hasContract(event))H.validateEvent(event,words);if(event.mode==='double')D.validateEvent(event,words);if(event.mode==='tower')T.validateEvent(event,words);if(event.mode==='speedrun'&&R.hasContract(event))R.validateEvent(event,words);if(ids.has(event.id))throw Error('Doppelte Wertung.');ids.add(event.id);}
 const resultById=new Map(state.sessionEvents.map(e=>[e.id,e])),legacyIds=new Set(state.events.map(e=>e.id));
 for(const [key,session] of Object.entries(state.sessions)){
  if(key!==session?.id)throw Error('Ungültiger Session-Schlüssel.');G.validate(session,words);if(session.mode==='survivor')SV.validate(session,words);if(session.mode==='duel'&&J.hasContract(session))J.validate(session,words);if(session.mode==='theme'&&H.hasContract(session))H.validate(session,words);if(session.mode==='double')D.validate(session,words);if(session.mode==='tower')T.validate(session,words);if(session.mode==='speedrun'&&R.hasContract(session))R.validate(session,words);
  if(legacyIds.has(session.id)||gameIds.has(session.id))throw Error('Session-ID kollidiert mit Wortrunde.');
  const event=resultById.get(session.id);
  if(session.status==='playing'&&event)throw Error('Laufende Session bereits gewertet.');
  if(session.status!=='playing'){
   if(!event)throw Error('Session-Ergebnis fehlt.');
   const expected=sessionResult(session,event.date);
   if(Object.keys(expected).some(k=>expected[k]!==event[k])||Object.keys(event).some(k=>!(k in expected)))
    throw Error('Widersprüchliches Session-Ergebnis.');
  }
 }
 return state;
}
function migrate(input,words){
 const state=clone(input);
 if(state?.schema===1){
  E.validate(state,V.resolve(state.wordVersion,words));
  // Reserved collections must never overwrite unexpected old backup content.
  if('sessions' in state||'sessionEvents' in state)throw Error('Schema-1-Daten enthalten reservierte Session-Felder.');
  state.schema=SCHEMA;state.sessions={};state.sessionEvents=[];
 }
 validate(state,words);if(words.version===V.current){state.selection=F.prepare(state);if(state.survivorSelection){state.survivorSelection=F.prepare({selection:state.survivorSelection});for(const b of Object.values(state.survivorSelection.lengths)){b.initial.C=0;b.remaining.C=[];}}}validate(state,words);return state;
}
function load(storage,words){
 let raw=null,source=KEY,state;
 try{
  const modern=storage.getItem(KEY),legacyRaw=storage.getItem(LEGACY_KEY);raw=modern;
  if(modern===null){source=LEGACY_KEY;raw=legacyRaw;state=raw===null?fresh():migrate(JSON.parse(raw),words);}
  else state=migrate(JSON.parse(modern),words);
  if(words.version===V.current){
   if(state.legacySource===undefined){if(modern!==null&&legacyRaw!==null){source=LEGACY_KEY;raw=legacyRaw;const old=JSON.parse(legacyRaw);E.validate(old,V.daily());if(!Y.covered(state,old))return {state,readOnly:true,source:LEGACY_KEY,raw:legacyRaw,error:'Alte PWA und neuer Speicher unterscheiden sich; beide Backups sichern.'};}state=Y.checkpoint(state,legacyRaw);}
   else if(state.legacySource!==legacyRaw)return {state,readOnly:true,source:LEGACY_KEY,raw:legacyRaw,error:'Ältere PWA hat den ursprünglichen Speicher verändert; Konflikt geschützt.'};
  }
  return {state,readOnly:false,source,raw,error:null};
 }catch(error){return {state:state||fresh(),readOnly:true,source,raw,error:error.message};}
}
function save(storage,state,words,{readOnly=false,expectedRaw}={}){
 if(readOnly)throw Error('Speicher ist zum Schutz der vorhandenen Daten gesperrt.');
 validate(state,words);Y.guardWrite(storage.getItem(KEY),expectedRaw);Y.guardLegacy(state,storage.getItem(LEGACY_KEY));const serialized=JSON.stringify(state);
 // Write only the new key. The original schema-1 data remains a rollback copy.
 storage.setItem(KEY,serialized);return serialized;
}
function importBackup(text,words){return migrate(JSON.parse(text),words);}
function exportBackup(state,words){validate(state,words);return JSON.stringify(state,null,2);}
function recordSession(state,session,date,words){
 validate(state,words);G.validate(session,words);
 const event=sessionResult(session,date),previous=state.sessionEvents.find(e=>e.id===session.id);
 if(previous){
  if(JSON.stringify(previous)!==JSON.stringify(event))throw Error('Session bereits mit anderem Ergebnis gewertet.');
  return clone(state);
 }
 const next=clone(state);next.sessions[session.id]=clone(session);next.sessionEvents.push(event);
 validate(next,words);return next;
}
const api={KEY,LEGACY_KEY,SCHEMA,fresh,validate,migrate,load,save,importBackup,exportBackup,recordSession};
root.WordleStorage=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
