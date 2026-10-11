/* Sequential Tower rules on the existing canonical GameSession history. */
(function(root){
'use strict';
const E=root.Engine||(typeof require==='function'?require('./engine.js'):null);
const G=root.Sessions||(typeof require==='function'?require('./sessions.js'):null);
const clone=value=>JSON.parse(JSON.stringify(value));
const BUDGET=20;
function views(s){return s.rounds.map(r=>G.roundView(s,r.id));}
function progress(s){
 const rounds=views(s),solved=rounds.filter(r=>r.status==='won').length;
 // The pending screen is a UI acknowledgement, not another attempt or floor counter.
 const index=s.pendingTransition?solved-1:Math.min(solved,3);
 let reached=index+1;
 if(s.status==='won')reached=4;
 else if(s.status==='lost')reached=s.attempts.length?Math.max(...s.attempts.map(a=>s.rounds.findIndex(r=>r.id===a.roundIds[0])))+1:1;
 return {rounds,solved,index,active:rounds[index],used:s.attempts.length,remaining:BUDGET-s.attempts.length,reached};
}
function validate(s,words){
 G.validate(s,words);
 if(s.mode!=='tower'||s.rounds.length!==4||s.attemptBudget!==BUDGET||s.rounds.some((r,i)=>r.length!==i+4||r.attemptLimit!==BUDGET||r.hard))throw Error('Tower benötigt vier Etagen (4–7), ohne Hard Mode und mit 20 gemeinsamen Versuchen.');
 let floor=0;
 for(const a of s.attempts){
  if(floor>=4||a.roundIds.length!==1||a.roundIds[0]!==s.rounds[floor].id)throw Error('Tower-Eingabe gehört nicht zur aktuellen Etage.');
  if(a.word===s.rounds[floor].target)floor++;
 }
 if(s.status==='completed'||s.status==='playing'&&(floor===4||s.attempts.length===BUDGET)||s.status==='won'&&floor!==4||s.status==='lost'&&(s.attempts.length!==BUDGET||floor===4)||s.status==='abandoned'&&(floor===4||s.attempts.length===BUDGET))throw Error('Widersprüchlicher Tower-Abschluss.');
 if(s.pendingTransition!==undefined&&s.pendingTransition!==null){
  const previous=s.rounds[floor-1],last=s.attempts.at(-1);
  if(!previous||floor===4||s.attempts.length===BUDGET||s.pendingTransition!==previous.id||last?.word!==previous.target)throw Error('Ungültiger Tower-Übergang.');
 }
 const limit=floor<4?s.rounds[floor].length:0;
 if(s.input!==undefined&&(typeof s.input!=='string'||E.normalize(s.input)!==s.input||!/^[A-ZÄÖÜẞ]*$/u.test(s.input)||E.letters(s.input).length>limit||((s.pendingTransition||s.status!=='playing')&&s.input!=='')))throw Error('Ungültige Tower-Eingabe.');
 return s;
}
function create({id,targets,started},words){
 if(!Array.isArray(targets)||targets.length!==4)throw Error('Vier Lösungen erforderlich.');
 const s=G.createSession({id,mode:'tower',started,attemptBudget:BUDGET,rounds:targets.map((target,i)=>G.createRound({id:'floor-'+(i+1),length:i+4,target,attemptLimit:BUDGET,hard:false},words))},words);
 s.input='';s.pendingTransition=null;return validate(s,words);
}
function error(s,word,words){
 const r=progress(s).active,w=E.normalize(word);
 if(E.letters(w).length!==r.length)return `${r.length} Buchstaben bitte.`;
 if(!words.accepted[r.length].includes(w))return 'Dieses Wort steht nicht in der Wortliste.';
 if(r.guesses.includes(w))return 'Dieses Wort hast du auf dieser Etage schon versucht.';
 return null;
}
function submit(s,word,ended,words){
 validate(s,words);
 if(s.status!=='playing'||s.pendingTransition)throw Error('Tower ist abgeschlossen oder wartet auf den Etagenwechsel.');
 const err=error(s,word,words);if(err)throw Error(err);
 const r=progress(s).active;
 let next=G.appendAttempt(s,word,[r.id],words);next.input='';
 const solved=views(next).filter(r=>r.status==='won').length;
 // Winning the fourth word on attempt 20 takes precedence over exhausting the budget.
 if(solved===4)next=G.finish(next,'won',ended,words);
 else if(next.attempts.length===BUDGET)next=G.finish(next,'lost',ended,words);
 else if(E.normalize(word)===r.target)next.pendingTransition=r.id;
 return validate(next,words);
}
function advance(s,words){
 validate(s,words);if(s.status!=='playing'||!s.pendingTransition)throw Error('Kein freigegebener Etagenwechsel.');
 const next=clone(s);next.pendingTransition=null;return validate(next,words);
}
function abandon(s,ended,words){
 validate(s,words);const next=G.finish(s,'abandoned',ended,words);next.input='';return validate(next,words);
}
function result(s,date){return {...G.result(s,date),reachedFloor:progress(s).reached};}
function validateEvent(e,words){
 G.validateEvent(e,words);
 if(e.mode!=='tower'||e.rounds!==4||e.solved>e.attempts||e.attempts>BUDGET||!Number.isInteger(e.reachedFloor)||e.reachedFloor<1||e.reachedFloor>4||e.reachedFloor<e.solved||e.reachedFloor>e.solved+1||e.status==='completed'||e.status==='won'&&(e.attempts<4||e.reachedFloor!==4)||e.status==='lost'&&e.attempts!==BUDGET||e.status==='abandoned'&&(e.solved===4||e.attempts===BUDGET))throw Error('Ungültige Tower-Statistik.');
 return e;
}
function colors(s){const r=progress(s).active,out={};r.guesses.forEach((w,j)=>E.letters(w).forEach((c,i)=>out[c]=Math.max(out[c]??0,r.evaluations[j][i])));return out;}
function summary(events){
 const rows=events.filter(e=>e.mode==='tower'),wins=rows.filter(e=>e.status==='won');let current=0,best=0;
 rows.forEach(e=>{current=e.status==='won'?current+1:0;best=Math.max(best,current);});
 const avg=wins.length?wins.reduce((sum,e)=>sum+e.attempts,0)/wins.length:null;
 return {played:rows.length,wins:wins.length,losses:rows.length-wins.length,abandoned:rows.filter(e=>e.status==='abandoned').length,rate:rows.length?Math.round(wins.length/rows.length*100):0,avgUsed:avg,avgRemaining:avg===null?null:BUDGET-avg,record:wins.length?wins.reduce((best,e)=>Math.max(best,BUDGET-e.attempts),0):null,highest:rows.reduce((n,e)=>Math.max(n,e.reachedFloor),0),avgSolved:rows.length?rows.reduce((n,e)=>n+e.solved,0)/rows.length:null,current,best,failed:rows.filter(e=>e.status!=='won').reduce((dist,e)=>{dist[e.reachedFloor-1]++;return dist;},[0,0,0,0])};
}
function share(s){
 const p=progress(s),won=s.status==='won';
 return `WORDLE DE – TOWER 🏰\n${won?'🏆':'🌿'} ${p.solved}/4 Etagen geschafft\n`+p.rounds.map((r,i)=>`Etage ${i+1}: ${r.status==='won'?r.guesses.length+' Versuche ✓':r.guesses.length?r.guesses.length+' Versuche · nicht gelöst':'nicht gelöst'}`).join('\n')+`\n${p.used}/20 Versuche verwendet\n${won?'⭐ ':''}${p.remaining} Versuche übrig${s.status==='abandoned'?'\nAbgebrochen':''}`;
}
const api={BUDGET,create,validate,views,progress,error,submit,advance,abandon,result,validateEvent,colors,summary,share};
root.WordleTower=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
