/* Deterministic schema migration and non-destructive local persistence. */
(function(root){
'use strict';
const E=root.Engine||(typeof require==='function'?require('./engine.js'):null);
const G=root.Sessions||(typeof require==='function'?require('./sessions.js'):null);
const D=root.DoubleWordle||(typeof require==='function'?require('./double.js'):null);
const KEY='wordle-de:v2',LEGACY_KEY='wordle-de:v1',SCHEMA=2;
const clone=v=>JSON.parse(JSON.stringify(v));
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
function fresh(){return {...E.fresh(),schema:SCHEMA,sessions:{},sessionEvents:[]};}
function validate(state,words){
 if(!object(state)||state.schema!==SCHEMA)throw Error('Unbekannte Speicherversion.');
 // Reuse the proven schema-1 validation unchanged, including daily and streak.
 E.validate({...state,schema:1},words);
 if(!object(state.sessions)||!Array.isArray(state.sessionEvents)||state.sessionEvents.length>100000)
  throw Error('Ungültige Session-Datensammlungen.');
 const ids=new Set(state.events.map(e=>e.id));
 for(const event of state.sessionEvents){G.validateEvent(event,words);if(event.mode==='double')D.validateEvent(event,words);if(ids.has(event.id))throw Error('Doppelte Wertung.');ids.add(event.id);}
 for(const [key,session] of Object.entries(state.sessions)){
  if(key!==session?.id)throw Error('Ungültiger Session-Schlüssel.');G.validate(session,words);if(session.mode==='double')D.validate(session,words);
  if(state.events.some(e=>e.id===session.id)||Object.values(state.games).some(g=>g.id===session.id))throw Error('Session-ID kollidiert mit Wortrunde.');
  const event=state.sessionEvents.find(e=>e.id===session.id);
  if(session.status==='playing'&&event)throw Error('Laufende Session bereits gewertet.');
  if(session.status!=='playing'){
   if(!event)throw Error('Session-Ergebnis fehlt.');
   const expected=G.result(session,event.date);
   if(Object.keys(expected).some(k=>expected[k]!==event[k])||Object.keys(event).some(k=>!(k in expected)))
    throw Error('Widersprüchliches Session-Ergebnis.');
  }
 }
 return state;
}
function migrate(input,words){
 const state=clone(input);
 if(state?.schema===1){
  E.validate(state,words);
  // Reserved collections must never overwrite unexpected old backup content.
  if('sessions' in state||'sessionEvents' in state)throw Error('Schema-1-Daten enthalten reservierte Session-Felder.');
  state.schema=SCHEMA;state.sessions={};state.sessionEvents=[];
 }
 validate(state,words);return state;
}
function load(storage,words){
 let raw=null,source=KEY;
 try{
  raw=storage.getItem(KEY);
  if(raw===null){source=LEGACY_KEY;raw=storage.getItem(LEGACY_KEY);}
  return {state:raw===null?fresh():migrate(JSON.parse(raw),words),readOnly:false,source,raw,error:null};
 }catch(error){return {state:fresh(),readOnly:true,source,raw,error:error.message};}
}
function save(storage,state,words,{readOnly=false}={}){
 if(readOnly)throw Error('Speicher ist zum Schutz der vorhandenen Daten gesperrt.');
 validate(state,words);const serialized=JSON.stringify(state);
 // Write only the new key. The original schema-1 data remains a rollback copy.
 storage.setItem(KEY,serialized);return serialized;
}
function importBackup(text,words){return migrate(JSON.parse(text),words);}
function exportBackup(state,words){validate(state,words);return JSON.stringify(state,null,2);}
function recordSession(state,session,date,words){
 validate(state,words);G.validate(session,words);
 const event=G.result(session,date),previous=state.sessionEvents.find(e=>e.id===session.id);
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
