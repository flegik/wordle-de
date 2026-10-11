/* Speedrun v1: canonical attempts + explicit round endings. No wall-clock timer. */
(function(root){
'use strict';
const E=root.Engine||(typeof require==='function'?require('./engine.js'):null);
const G=root.Sessions||(typeof require==='function'?require('./sessions.js'):null);
const BUDGET=180000,SKIP=10000,POINTS=Object.freeze({4:100,5:150,6:200,7:250});
const hasContract=s=>['speedrunVersion','activeMs','roundEnds','resumeRequired','winningAttempts','solved4'].some(k=>k in s);
const clone=v=>JSON.parse(JSON.stringify(v)),finite=v=>Number.isFinite(v)&&v>=0;
function fail(){throw Error('Ungültiger Speedrun-Spielstand.');}
function remaining(s,activeMs=s.activeMs){return Math.max(0,BUDGET-activeMs-s.roundEnds.filter(e=>e.reason==='skipped').length*SKIP);}
function views(s){return s.rounds.map(r=>{const v=G.roundView(s,r.id),end=s.roundEnds.find(e=>e.roundId===r.id);return {...v,status:end?end.reason:s.status==='playing'?'playing':'unfinished'};});}
function metrics(s){
 const rounds=views(s),won=rounds.filter(r=>r.status==='won');
 return {rounds,started:rounds.length,solved:won.length,lost:rounds.filter(r=>r.status==='lost').length,skipped:rounds.filter(r=>r.status==='skipped').length,attempts:s.attempts.length,winningAttempts:won.reduce((n,r)=>n+r.guesses.length,0),score:won.reduce((n,r)=>n+POINTS[r.length],0),...Object.fromEntries([4,5,6,7].map(n=>['solved'+n,won.filter(r=>r.length===n).length]))};
}
function active(s){return G.roundView(s,s.rounds.at(-1).id);}
function chooseLength(random=Math.random){const value=random();if(!finite(value)||value>=1)throw Error('Ungültige Zufallsquelle.');return 4+Math.floor(value*4);}
function round(config,index,words){return G.createRound({id:'word-'+index,length:config.length,target:config.target,hard:false},words);}
function create({id,started,length,target},words){
 const s=G.createSession({id,mode:'speedrun',started,rounds:[round({length,target},1,words)]},words);
 Object.assign(s,{speedrunVersion:1,activeMs:0,resumeRequired:true,roundEnds:[],input:''});return validate(s,words);
}
function validate(s,words){
 G.validate(s,words);
 if(s.mode!=='speedrun'||s.speedrunVersion!==1||s.resumeRequired!==true||!finite(s.activeMs)||s.activeMs>BUDGET||s.attemptBudget!==undefined||!Array.isArray(s.roundEnds)||!['playing','completed','abandoned'].includes(s.status))fail();
 if(s.rounds.some((r,i)=>r.id!=='word-'+(i+1)||r.hard||r.attemptLimit!==(r.length<6?6:7)))fail();
 let pos=0,time=0,skips=0;
 // Replay each boundary and its attempts. This rejects inputs after a skip or
 // solve, backwards timestamps, missing/duplicate endings and forged scores.
 for(let i=0;i<s.rounds.length;i++){
  const r=s.rounds[i],end=s.roundEnds[i],guesses=[];
  while(pos<s.attempts.length&&s.attempts[pos].roundIds[0]===r.id){
   const a=s.attempts[pos];
   if(a.roundIds.length!==1||!finite(a.atMs)||a.atMs<time||a.atMs>s.activeMs||a.atMs+skips*SKIP>=BUDGET)fail();
   time=a.atMs;guesses.push(a.word);pos++;
  }
  if(end){
   if(end.roundId!==r.id||!['won','lost','skipped'].includes(end.reason)||end.attemptIndex!==pos||!finite(end.atMs)||end.atMs<time||end.atMs>s.activeMs||end.atMs+skips*SKIP>=BUDGET)fail();
   const solved=guesses.at(-1)===r.target,exhausted=guesses.length===r.attemptLimit;
   if(end.reason==='won'?!solved:end.reason==='lost'?solved||!exhausted:solved||exhausted)fail();
   if(end.reason!=='skipped'&&(!guesses.length||end.atMs!==s.attempts[pos-1].atMs))fail();
   time=end.atMs;if(end.reason==='skipped')skips++;
   if(i<s.rounds.length-1&&time+skips*SKIP>=BUDGET)fail();
  }else if(i!==s.rounds.length-1||guesses.includes(r.target)||guesses.length>=r.attemptLimit)fail();
 }
 if(pos!==s.attempts.length||s.roundEnds.length>s.rounds.length||s.roundEnds.length<s.rounds.length-1)fail();
 const left=remaining(s),closed=s.roundEnds.length===s.rounds.length;
 if(closed&&(s.roundEnds.at(-1).reason!=='skipped'||s.roundEnds.at(-1).atMs!==s.activeMs||s.activeMs+skips*SKIP<BUDGET))fail();
 if(s.status==='playing'&&(left===0||closed||s.score!==undefined)||s.status==='completed'&&left!==0||s.status==='abandoned'&&(left===0||closed))fail();
 if(s.status!=='playing'&&s.score!==metrics(s).score)fail();
 if(typeof s.input!=='string'||E.normalize(s.input)!==s.input||!/^[A-ZÄÖÜẞ]*$/u.test(s.input)||E.letters(s.input).length>active(s).length||s.status!=='playing'&&s.input!=='')fail();
 return s;
}
function error(s,word,words){const r=active(s),w=E.normalize(word);return E.letters(w).length!==r.length?`${r.length} Buchstaben bitte.`:!words.accepted[r.length].includes(w)?'Dieses Wort steht nicht in der Wortliste.':r.guesses.includes(w)?'Dieses Wort hast du schon versucht.':null;}
function at(s,ms,words){validate(s,words);if(s.status!=='playing'||!finite(ms)||ms<s.activeMs||remaining(s,ms)===0)throw Error('Zeit abgelaufen oder Run pausiert.');const next=clone(s);next.activeMs=ms;return next;}
function closeRound(s,reason,ms,ended,words,choose){
 s.roundEnds.push({roundId:s.rounds.at(-1).id,reason,attemptIndex:s.attempts.length,atMs:ms});s.input='';
 if(remaining(s)===0)return finish(s,'completed',ended,words);
 if(typeof choose!=='function')throw Error('Nächstes Wort erforderlich.');
 s.rounds.push(round(choose(),s.rounds.length+1,words));return validate(s,words);
}
function submit(s,word,ms,ended,words,choose){
 let next=at(s,ms,words);const err=error(next,word,words);if(err)throw Error(err);
 const r=active(next);next=G.appendAttempt(next,word,[r.id],words);next.attempts.at(-1).atMs=ms;next.input='';
 const v=active(next);return v.status==='playing'?validate(next,words):closeRound(next,v.status,ms,ended,words,choose);
}
function skip(s,ms,ended,words,choose){return closeRound(at(s,ms,words),'skipped',ms,ended,words,choose);}
function finish(s,status,ended,words){const next=G.finish(s,status,Math.max(ended,s.started),words,metrics(s).score);next.input='';return validate(next,words);}
function expire(s,ms,ended,words){
 validate(s,words);if(s.status!=='playing'||!finite(ms)||remaining(s,ms)!==0)throw Error('Run ist noch nicht abgelaufen.');
 const next=clone(s);next.activeMs=Math.max(s.activeMs,Math.min(ms,BUDGET-next.roundEnds.filter(e=>e.reason==='skipped').length*SKIP));return finish(next,'completed',ended,words);
}
function abandon(s,ms,ended,words){return finish(at(s,ms,words),'abandoned',ended,words);}
function result(s,date){const m=metrics(s);return {...G.result(s,date),speedrunVersion:1,score:m.score,lost:m.lost,skipped:m.skipped,winningAttempts:m.winningAttempts,solved4:m.solved4,solved5:m.solved5,solved6:m.solved6,solved7:m.solved7,activeMs:s.activeMs};}
function validateEvent(e,words){
 G.validateEvent(e,words);
 const integers=['lost','skipped','winningAttempts','solved4','solved5','solved6','solved7'];
 if(e.mode!=='speedrun'||e.speedrunVersion!==1||!['completed','abandoned'].includes(e.status)||integers.some(k=>!Number.isSafeInteger(e[k])||e[k]<0)||!finite(e.activeMs)||e.activeMs>BUDGET)fail();
 const sum=[4,5,6,7].reduce((n,l)=>n+e['solved'+l],0),points=[4,5,6,7].reduce((n,l)=>n+e['solved'+l]*POINTS[l],0),maxWin=[4,5,6,7].reduce((n,l)=>n+e['solved'+l]*(l<6?6:7),0),closed=e.solved+e.lost+e.skipped;
 if(sum!==e.solved||points!==e.score||e.winningAttempts<sum||e.winningAttempts>maxWin||e.winningAttempts>e.attempts||closed>e.rounds||closed<e.rounds-1||e.skipped>18||e.activeMs+e.skipped*SKIP>=BUDGET+SKIP||e.status==='completed'&&closed===e.rounds&&e.skipped===0||e.attempts>maxWin+e.lost*7+e.skipped*6+(e.rounds-closed)*6||e.attempts<e.winningAttempts+e.lost*6||e.status==='completed'&&e.activeMs+e.skipped*SKIP<BUDGET||e.status==='abandoned'&&(closed===e.rounds||e.activeMs+e.skipped*SKIP>=BUDGET))fail();
 return e;
}
function colors(s){const r=active(s),out={};r.guesses.forEach((w,j)=>E.letters(w).forEach((c,i)=>out[c]=Math.max(out[c]??0,r.evaluations[j][i])));return out;}
function summary(events){
 const rows=events.filter(e=>e.mode==='speedrun'&&e.speedrunVersion===1),completed=rows.filter(e=>e.status==='completed'),total=(list,k)=>list.reduce((n,e)=>n+e[k],0);
 // Stable sort retains the previous (older) record on a complete tie.
 const ranked=rows.map((e,i)=>({e,i})).sort((a,b)=>b.e.score-a.e.score||b.e.solved-a.e.solved||a.e.attempts-b.e.attempts||a.i-b.i).map(x=>x.e),solved=total(rows,'solved');
 return {played:rows.length,completed:completed.length,abandoned:rows.length-completed.length,record:ranked[0]||null,highscore:ranked[0]?.score??null,bestSolved:rows.reduce((n,e)=>Math.max(n,e.solved),0),avgScore:completed.length?total(completed,'score')/completed.length:null,avgSolved:rows.length?solved/rows.length:null,solved,skipped:total(rows,'skipped'),avgAttempts:solved?total(rows,'winningAttempts')/solved:null,top:ranked.slice(0,10)};
}
function share(s,events){const m=metrics(s),stats=summary(events);return `WORDLE DE – SPEEDRUN ⚡\n${s.status==='abandoned'?'Run abgebrochen':'⏱ 3:00 Minuten'}\n🏆 ${m.score.toLocaleString('de-DE')} Punkte\n✅ ${m.solved} Wörter gelöst\n⏭ ${m.skipped} übersprungen\nPersönlicher Rekord: ${(stats.highscore??m.score).toLocaleString('de-DE')} Punkte`;}
/* Monotone anchors are deliberately never serialized. Every durable snapshot
   requires explicit resume. Checkpoint resets only the anchor, never the budget. */
function createClock(now=()=>performance.now()){
 let running=false,anchor=0,base=0,id=null;
 function elapsed(s){return running&&id===s.id?base+Math.max(0,now()-anchor):s.activeMs;}
 function checkpoint(s){const sample=now(),ms=running&&id===s.id?base+Math.max(0,sample-anchor):s.activeMs,next=clone(s);next.activeMs=Math.min(ms,Math.max(0,BUDGET-s.roundEnds.filter(e=>e.reason==='skipped').length*SKIP));if(running&&id===s.id){base=next.activeMs;anchor=sample;}return next;}
 return {get running(){return running;},elapsed,checkpoint,resume(s){if(s.status!=='playing'||remaining(s)===0)throw Error('Run abgeschlossen.');if(running)throw Error('Timer läuft bereits.');id=s.id;base=s.activeMs;anchor=now();running=true;},pause(s){const next=checkpoint(s);running=false;return next;},stop(){running=false;id=null;}};
}
const api={hasContract,BUDGET,SKIP,POINTS,create,validate,remaining,active,views,metrics,chooseLength,error,submit,skip,expire,abandon,result,validateEvent,colors,summary,share,createClock};
root.WordleSpeedrun=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
