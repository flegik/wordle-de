/* Session foundation only: no arcade UI or mode-specific scoring yet. */
(function(root){
'use strict';
const V=root.WordRegistry||(typeof require==='function'?require('../data/word-registry.js'):null);
const E=root.Engine||(typeof require==='function'?require('./engine.js'):null);
const MODES=Object.freeze(['double','tower','speedrun','theme','duel']);
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const id=v=>typeof v==='string'&&v.length>0&&v.length<=128;
const integer=(v,min,max)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
const clone=v=>JSON.parse(JSON.stringify(v));
function fail(message){throw Error(message);}
function dictionary(words,version){return V.resolve(version,words);}

// Round configuration is stored once. Guesses, colors and status are projections
// of the session's canonical attempts; double-board inputs are never duplicated.
function createRound({id:roundId,length,target,hard=false,attemptLimit=length<6?6:7},words){
 const round={id:roundId,length,target:E.normalize(target),hard,attemptLimit};
 validateRound(round,words);return round;
}
function validateRound(round,words){
 if(!object(round)||!id(round.id)||![4,5,6,7].includes(round.length)||
    typeof round.target!=='string'||!words.accepted[round.length]?.includes(round.target)||
    E.letters(round.target).length!==round.length||typeof round.hard!=='boolean'||
    !integer(round.attemptLimit,1,1000))fail('Ungültige Session-Runde.');
 // Accepted targets allow future user-defined duels. Normal modes use solutions.
 return round;
}
function roundView(session,roundId){
 const config=session.rounds.find(r=>r.id===roundId);
 if(!config)fail('Runde nicht gefunden.');
 const guesses=session.attempts.filter(a=>a.roundIds.includes(roundId)).map(a=>a.word);
 const solved=guesses.includes(config.target);
 const status=solved?'won':guesses.length>=config.attemptLimit||session.status!=='playing'?'lost':'playing';
 return {...config,guesses,evaluations:guesses.map(w=>E.evaluate(w,config.target)),status};
}
function createSession({id:sessionId,mode,rounds,started,attemptBudget},words){
 const session={id:sessionId,mode,wordVersion:words.version,rounds:clone(rounds),attempts:[],status:'playing',started};
 if(attemptBudget!==undefined)session.attemptBudget=attemptBudget;
 validate(session,words);return session;
}
function validate(session,words){
 if(!object(session)||!id(session.id)||!MODES.includes(session.mode)||
    !Number.isFinite(session.started)||session.started<0||
    !['playing','won','lost','completed','abandoned'].includes(session.status)||
    !Array.isArray(session.rounds)||!integer(session.rounds.length,1,1000)||
    !Array.isArray(session.attempts)||session.attempts.length>1000)fail('Ungültige Session.');
 words=dictionary(words,session.wordVersion);
 if(session.attemptBudget!==undefined&&!integer(session.attemptBudget,1,1000))fail('Ungültiges Versuchsbudget.');
 if(session.attemptBudget!==undefined&&session.attempts.length>session.attemptBudget)fail('Versuchsbudget überschritten.');
 const rounds=new Map(),histories=new Map();
 for(const r of session.rounds){validateRound(r,words);if(rounds.has(r.id))fail('Doppelte Session-Runden-ID.');
  if(session.mode!=='duel'&&!words.solutions[r.length]?.includes(r.target))fail('Zielwort nicht im Lösungspool.');
  rounds.set(r.id,r);histories.set(r.id,[]);
 }
 for(const a of session.attempts){
  if(!object(a)||typeof a.word!=='string'||a.word!==E.normalize(a.word)||
     !Array.isArray(a.roundIds)||!a.roundIds.length||new Set(a.roundIds).size!==a.roundIds.length)fail('Ungültiger Session-Versuch.');
  for(const roundId of a.roundIds){
   const r=rounds.get(roundId),history=histories.get(roundId);
   if(!r||!words.accepted[r.length]?.includes(a.word)||history.length>=r.attemptLimit||
      history.includes(r.target)||history.includes(a.word))fail('Widersprüchlicher Session-Versuch.');
   if(r.hard&&E.hardError(a.word,history,r.target))fail('Session verletzt Hard Mode.');
   history.push(a.word);
  }
 }
 const allSolved=session.rounds.every(r=>histories.get(r.id).includes(r.target));
 if(session.status==='won'&&!allSolved||session.status==='lost'&&allSolved||
    session.status==='completed'&&session.mode!=='speedrun')fail('Widersprüchlicher Session-Abschluss.');
 if(session.status==='playing'&&session.ended!==undefined||session.status!=='playing'&&
    (!Number.isFinite(session.ended)||session.ended<session.started))fail('Ungültige Session-Zeit.');
 if(session.score!==undefined&&(!Number.isFinite(session.score)||session.score<0))fail('Ungültige Session-Punkte.');
 return session;
}
function appendAttempt(session,word,roundIds,words){
 validate(session,words);
 if(session.status!=='playing')fail('Session bereits abgeschlossen.');
 const next=clone(session);next.attempts.push({word:E.normalize(word),roundIds:clone(roundIds)});
 validate(next,words);return next;
}
function finish(session,status,ended,words,score){
 if(session.status!=='playing')fail('Session bereits abgeschlossen.');
 if(status==='playing')fail('Abschlussstatus erforderlich.');
 const next={...clone(session),status,ended};if(score!==undefined)next.score=score;
 validate(next,words);return next;
}
function result(session,date){
 if(session.status==='playing')fail('Laufende Session kann nicht gewertet werden.');
 const event={id:session.id,mode:session.mode,wordVersion:session.wordVersion,status:session.status,
  date,attempts:session.attempts.length,solved:session.rounds.filter(r=>roundView(session,r.id).status==='won').length,
  rounds:session.rounds.length,durationMs:session.ended-session.started};
 if(session.score!==undefined)event.score=session.score;
 return event;
}
function validateEvent(event,words){
 words=dictionary(words,event?.wordVersion);
 if(!object(event)||!id(event.id)||!MODES.includes(event.mode)||event.wordVersion!==words.version||
    !['won','lost','completed','abandoned'].includes(event.status)||
    event.status==='completed'&&event.mode!=='speedrun'||
    typeof event.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(event.date)||
    !integer(event.attempts,0,1000)||!integer(event.rounds,1,1000)||!integer(event.solved,0,event.rounds)||
    event.status==='won'&&event.solved!==event.rounds||event.status==='lost'&&event.solved===event.rounds||
    !Number.isFinite(event.durationMs)||event.durationMs<0||
    event.score!==undefined&&(!Number.isFinite(event.score)||event.score<0))fail('Ungültige Session-Statistik.');
 return event;
}
function summary(events,mode){
 const selected=events.filter(e=>!mode||e.mode===mode),scores=selected.filter(e=>e.score!==undefined).map(e=>e.score);
 return {played:selected.length,wins:selected.filter(e=>e.status==='won').length,
  solved:selected.reduce((n,e)=>n+e.solved,0),attempts:selected.reduce((n,e)=>n+e.attempts,0),
  bestScore:scores.length?scores.reduce((a,b)=>Math.max(a,b),0):null,bestSolved:selected.reduce((n,e)=>Math.max(n,e.solved),0)};
}
const api={MODES,createRound,createSession,roundView,validate,appendAttempt,finish,result,validateEvent,summary};
root.Sessions=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
