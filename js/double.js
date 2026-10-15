/* Double Wordle rules. All letters and evaluations use the existing Wordle core. */
(function(root){
'use strict';
const V=root.WordRegistry||(typeof require==='function'?require('../data/word-registry.js'):null);
const E=root.Engine||(typeof require==='function'?require('./engine.js'):null);
const G=root.Sessions||(typeof require==='function'?require('./sessions.js'):null);
function limit(n){if(![4,5,6,7].includes(n))throw Error('Ungültige Doppel-Wortlänge.');return n+3;}
function chooseLength(choice,rng=Math.random){if(choice!=='random'){limit(choice);return choice;}const value=rng();if(!Number.isFinite(value)||value<0||value>=1)throw Error('Ungültiger Zufallswert.');return 4+Math.floor(value*4);}
function views(s){return s.rounds.map(r=>G.roundView(s,r.id));}
function validate(s,words){words=V.resolve(s.wordVersion,words);
 G.validate(s,words);
 const n=s.rounds[0].length,budget=limit(n);
 if(s.mode!=='double'||s.rounds.length!==2||s.attemptBudget!==budget||s.rounds.some(r=>r.length!==n||r.attemptLimit!==budget||r.hard)||s.rounds[0].target===s.rounds[1].target)throw Error('Doppel benötigt zwei verschiedene Wörter gleicher Länge und das passende gemeinsame Budget.');
 if(s.doubleLengthChoice!==undefined&&s.doubleLengthChoice!=='random'&&s.doubleLengthChoice!==n)throw Error('Ungültige Doppel-Längenauswahl.');
 const solved=new Set(),seen=new Set();
 for(const a of s.attempts){
  const active=s.rounds.filter(r=>!solved.has(r.id)).map(r=>r.id);
  if(seen.has(a.word)||a.roundIds.length!==active.length||active.some(id=>!a.roundIds.includes(id)))throw Error('Widersprüchlicher gemeinsamer Doppel-Versuch.');
  seen.add(a.word);s.rounds.forEach(r=>{if(a.word===r.target)solved.add(r.id);});
 }
 if(s.status==='playing'&&(solved.size===2||s.attempts.length===s.attemptBudget))throw Error('Doppel-Session muss abgeschlossen sein.');
 if(s.status==='abandoned'&&solved.size===2)throw Error('Gelöste Session kann nicht abgebrochen sein.');
 if(s.status==='completed'||(s.status==='lost'&&s.attempts.length!==s.attemptBudget))throw Error('Ungültiger Doppel-Abschluss.');
 if(s.input!==undefined&&(typeof s.input!=='string'||E.normalize(s.input)!==s.input||!/^[A-ZÄÖÜẞ]*$/u.test(s.input)||E.letters(s.input).length>n||(s.status!=='playing'&&s.input!=='')))throw Error('Ungültige Doppel-Eingabe.');
 if(s.activeRoundId!==undefined&&!s.rounds.some(r=>r.id===s.activeRoundId))throw Error('Ungültiges ausgewähltes Raster.');
 return s;
}
function create({id,targets,started,choice},words){
 if(!Array.isArray(targets)||targets.length!==2)throw Error('Zwei Lösungen erforderlich.');
 const n=E.letters(targets[0]).length,budget=limit(n);
 const s=G.createSession({id,mode:'double',started,attemptBudget:budget,rounds:targets.map((target,i)=>G.createRound({id:i?'b':'a',length:n,target,attemptLimit:budget,hard:false},words))},words);
 if(choice!==undefined)s.doubleLengthChoice=choice;
 s.input='';s.activeRoundId='a';return validate(s,words);
}
function error(s,word,words){words=V.resolve(s.wordVersion,words);
 const w=E.normalize(word);
 const n=s.rounds[0].length;
 if(E.letters(w).length!==n)return n+' Buchstaben bitte.';
 if(!words.accepted[n].includes(w))return 'Dieses Wort steht nicht in der Wortliste.';
 if(s.attempts.some(a=>a.word===w))return 'Dieses Wort hast du schon versucht.';
 return null;
}
function submit(s,word,ended,words){
 validate(s,words);if(s.status!=='playing')throw Error('Session bereits abgeschlossen.');
 const err=error(s,word,words);if(err)throw Error(err);
 const ids=views(s).filter(r=>r.status==='playing').map(r=>r.id);
 let next=G.appendAttempt(s,word,ids,words);next.input='';
 const remaining=views(next).filter(r=>r.status!=='won');
 if(!remaining.length)next=G.finish(next,'won',ended,words);
 else if(next.attempts.length===next.attemptBudget)next=G.finish(next,'lost',ended,words);
 if(remaining.length===1)next.activeRoundId=remaining[0].id;
 return validate(next,words);
}
function abandon(s,ended,words){validate(s,words);const next=G.finish(s,'abandoned',ended,words);next.input='';return validate(next,words);}
function validateEvent(event,words){
 G.validateEvent(event,words);const n=event.length===undefined?5:event.length,budget=limit(n);
 if(event.mode!=='double'||event.rounds!==2||event.solved>event.attempts||event.attempts>budget||event.status==='completed'||event.status==='won'&&event.attempts<2||event.status==='lost'&&event.attempts!==budget||event.status==='abandoned'&&event.solved===2)throw Error('Ungültige Doppel-Statistik.');
 return event;
}
function result(s,date){const event=G.result(s,date);if(s.doubleLengthChoice!==undefined||s.rounds[0].length!==5)event.length=s.rounds[0].length;return event;}
function colors(s,id){const r=G.roundView(s,id),out={};r.guesses.forEach((w,j)=>E.letters(w).forEach((c,i)=>out[c]=Math.max(out[c]??0,r.evaluations[j][i])));return out;}
function summary(events,length='all'){
 const rows=events.filter(e=>e.mode==='double'&&(length==='all'||(e.length??5)===Number(length))),wins=rows.filter(e=>e.status==='won'),dist=Array(length==='all'?10:limit(Number(length))).fill(0);let current=0,best=0;
 rows.forEach(e=>{current=e.status==='won'?current+1:0;best=Math.max(best,current);if(e.status==='won')dist[e.attempts-1]++;});
 return {played:rows.length,wins:wins.length,losses:rows.length-wins.length,rate:rows.length?Math.round(wins.length/rows.length*100):0,avg:wins.length?wins.reduce((n,e)=>n+e.attempts,0)/wins.length:null,record:wins.length?wins.reduce((min,e)=>Math.min(min,e.attempts),10):null,current,best,dist,solved:rows.reduce((n,e)=>n+e.solved,0),attempts:rows.reduce((n,e)=>n+e.attempts,0),abandoned:rows.filter(e=>e.status==='abandoned').length};
}
function share(s){
 const grids=views(s).map(r=>r.evaluations.map(row=>row.map(n=>['⬛','🟨','🟩'][n]).join(''))),count=Math.max(...grids.map(g=>g.length));
 return `WORDLE DE – DOPPEL\n${s.rounds[0].length} Buchstaben · ${s.status==='won'?s.attempts.length:'X'}/${s.attemptBudget} Versuche${s.status==='won'?'':` · ${s.attempts.length} genutzt`}\n\nRaster A | Raster B\n`+Array.from({length:count},(_,i)=>`${grids[0][i]||'—'} | ${grids[1][i]||'—'}`).join('\n');
}
const api={limit,chooseLength,result,create,validate,validateEvent,views,error,submit,abandon,colors,summary,share};root.DoubleWordle=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
