/* Survivor v2: canonical attempts, round boundaries and upgrade decisions.
   Health, score and charges are projections, never independently persisted. */
(function(root){
'use strict';
const V=root.WordRegistry||(typeof require==='function'?require('../data/word-registry.js'):null),E=root.Engine||(typeof require==='function'?require('./engine.js'):null),G=root.Sessions||(typeof require==='function'?require('./sessions.js'):null);
const UPGRADE_INTERVAL=5,upgradeEvery=s=>s.survivorVersion===1?3:UPGRADE_INTERVAL;
const MAX_HEARTS=3,UPGRADES=Object.freeze({heal:{name:'Heilung',icon:'♥',description:'Ein verlorenes Herz zurück. Maximum: 3.'},shield:{name:'Schutzschild',icon:'◈',description:'Verhindert den nächsten Herzverlust. Ein Schild gleichzeitig.'},extra:{name:'Extra Versuch',icon:'+1',description:'Ein zusätzlicher Versuch bei den nächsten 3 Rätseln. Restladungen werden addiert.'},hint:{name:'Start-Hinweis',icon:'✦',description:'Eine korrekte Position bei den nächsten 2 Rätseln. Restladungen werden addiert.'}});
const clone=v=>JSON.parse(JSON.stringify(v)),int=(v,a,b)=>Number.isSafeInteger(v)&&v>=a&&v<=b,normalLimit=n=>n<6?6:7;
function fail(){throw Error('Ungültiger Survivor-Spielstand.');}
function random(rng){const v=rng();if(!Number.isFinite(v)||v<0||v>=1)throw Error('Ungültige Zufallsquelle.');return v;}
function chooseLength(solved,rng=Math.random){if(!int(solved,0,100000))fail();const weights=solved<6?[.65,.35,0,0]:solved<15?[.15,.55,.30,0]:solved<30?[.05,.35,.50,.10]:[0,.20,.55,.25];let t=random(rng);for(let i=0;i<4;i++){t-=weights[i];if(t<0)return i+4;}return 7;}
function points(length,attempts){return (length-3)*100+Math.max(0,normalLimit(length)-attempts)*20;}
function eligible(m){return Object.keys(UPGRADES).filter(id=>id==='heal'?m.hearts<MAX_HEARTS:id==='shield'?!m.shield:true);}
function offer(m,rng){const ids=eligible(m);for(let i=ids.length-1;i>0;i--){const j=Math.floor(random(rng)*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}return ids.slice(0,3);}
function apply(m,id){if(id==='heal')m.hearts++;else if(id==='shield')m.shield=1;else if(id==='extra')m.extra+=3;else if(id==='hint')m.hints+=2;m.upgradesChosen++;}
// One ordered replay serves validation, HUD, statistics, scoring and exports.
function replay(s,strict=false){
 const m={hearts:MAX_HEARTS,shield:0,extra:0,hints:0,solved:0,lost:0,score:0,upgradesChosen:0,rounds:[]};let pos=0,upgradeIndex=0;
 for(let i=0;i<s.rounds.length;i++){
  const r=s.rounds[i],end=s.roundEnds[i],hasExtra=m.extra>0,hasHint=m.hints>0,guesses=[];
  if(strict&&(m.hearts===0||r.id!=='word-'+(i+1)||r.hard||r.attemptLimit!==normalLimit(r.length)+(hasExtra?1:0)||(hasHint?!int(r.hintIndex,0,r.length-1):r.hintIndex!==undefined)))fail();
  if(hasExtra)m.extra--;if(hasHint)m.hints--;
  while(pos<s.attempts.length&&s.attempts[pos].roundIds[0]===r.id){const a=s.attempts[pos++];if(strict&&a.roundIds.length!==1)fail();guesses.push(a.word);}
  const won=guesses.at(-1)===r.target,exhausted=guesses.length===r.attemptLimit;
  const shielded=end?.reason==='lost'&&m.shield===1;
  if(end){
   if(strict&&(end.roundId!==r.id||end.attemptIndex!==pos||!['won','lost'].includes(end.reason)||(end.reason==='won'?!won:won||!exhausted)))fail();
   if(end.reason==='won'){m.solved++;m.score+=points(r.length,guesses.length);}else{m.lost++;if(m.shield)m.shield=0;else m.hearts--;}
   if(end.reason==='won'&&m.solved%upgradeEvery(s)===0){
    const u=s.upgrades[upgradeIndex++],usable=eligible(m);
    if(!u||u.afterRound!==i+1||!Array.isArray(u.offered)||u.offered.length!==Math.min(3,usable.length)||new Set(u.offered).size!==u.offered.length||u.offered.some(id=>!usable.includes(id))||u.picked!==null&&!u.offered.includes(u.picked))fail();
    if(u.picked!==null)apply(m,u.picked);else if(i!==s.rounds.length-1)fail();
   }
  }else if(strict&&(i!==s.rounds.length-1||won||exhausted))fail();
  m.rounds.push({...r,guesses,evaluations:guesses.map(w=>E.evaluate(w,r.target)),shielded,status:end?.reason||(s.status==='playing'?'playing':'unfinished'),hasExtra,hasHint});
 }
 if(strict&&(pos!==s.attempts.length||upgradeIndex!==s.upgrades.length))fail();
 return {...m,attempts:s.attempts.length,closed:s.roundEnds.length,pending:s.upgrades.at(-1)?.picked===null};
}
function metrics(s){return replay(s);}
function active(s){return G.roundView(s,s.rounds.at(-1).id);}
function stage(s){return s.status!=='playing'?'result':s.roundEnds.length<s.rounds.length?'word':s.upgrades.at(-1)?.picked===null?'upgrade':'between';}
function validate(s,words){words=V.resolve(s?.wordVersion,words);G.validate(s,words);
 if(s.mode!=='survivor'||![1,2].includes(s.survivorVersion)||!['playing','completed','abandoned'].includes(s.status)||s.attemptBudget!==undefined||!Array.isArray(s.roundEnds)||s.roundEnds.length<s.rounds.length-1||s.roundEnds.length>s.rounds.length||!Array.isArray(s.upgrades))fail();
 const m=replay(s,true);
 if(s.status==='completed'?(m.hearts!==0||m.closed!==s.rounds.length):m.hearts<=0)fail();
 if(s.status==='playing'?s.score!==undefined:s.score!==m.score)fail();
 if(typeof s.input!=='string'||s.input!==E.normalize(s.input)||!/^[A-ZÄÖÜẞ]*$/u.test(s.input)||E.letters(s.input).length>active(s).length||stage(s)!=='word'&&s.input!=='')fail();return s;
}
function makeRound(config,index,m,words,rng){const n=config.length,r=G.createRound({id:'word-'+index,length:n,target:config.target,hard:false,attemptLimit:normalLimit(n)+(m.extra>0?1:0)},words);if(m.hints>0)r.hintIndex=Math.floor(random(rng)*n);return r;}
function create({id,started,length,target},words){const s=G.createSession({id,mode:'survivor',started,rounds:[makeRound({length,target},1,{extra:0,hints:0},words,Math.random)]},words);Object.assign(s,{survivorVersion:2,roundEnds:[],upgrades:[],input:''});return validate(s,words);}
function error(s,word,words){const r=active(s),w=E.normalize(word);words=V.resolve(s.wordVersion,words);return E.letters(w).length!==r.length?r.length+' Buchstaben bitte.':!words.accepted[r.length].includes(w)?'Dieses Wort steht nicht in der Wortliste.':r.guesses.includes(w)?'Dieses Wort hast du schon versucht.':null;}
function submit(s,word,ended,words,rng=Math.random){validate(s,words);if(stage(s)!=='word')throw Error('Dieses Rätsel ist bereits abgeschlossen.');const err=error(s,word,words);if(err)throw Error(err);const r=active(s);let next=G.appendAttempt(s,word,[r.id],words);next.input='';const v=active(next);
 if(v.status!=='playing'){next.roundEnds.push({roundId:r.id,reason:v.status,attemptIndex:next.attempts.length});if(v.status==='won'&&(metrics(s).solved+1)%upgradeEvery(s)===0)next.upgrades.push({afterRound:next.rounds.length,offered:offer(metrics(s),rng),picked:null});const m=metrics(next);if(m.hearts===0)next=G.finish(next,'completed',ended,words,m.score);}
 return validate(next,words);
}
function chooseUpgrade(s,id,afterRound,words){validate(s,words);if(stage(s)!=='upgrade')throw Error('Keine offene Upgrade-Auswahl.');const next=clone(s),u=next.upgrades.at(-1);if(u.afterRound!==afterRound||!u.offered.includes(id))throw Error('Dieses Upgrade ist nicht verfügbar.');u.picked=id;return validate(next,words);}
function advance(s,config,words,rng=Math.random){validate(s,words);if(stage(s)!=='between')throw Error('Zuerst das Rätsel und die Upgrade-Auswahl abschließen.');const next=clone(s);next.rounds.push(makeRound(config,next.rounds.length+1,metrics(next),V.resolve(s.wordVersion,words),rng));return validate(next,words);}
function abandon(s,ended,words){validate(s,words);const next=G.finish(s,'abandoned',ended,words,metrics(s).score);next.input='';return validate(next,words);}
function result(s,date){const m=metrics(s);return {...G.result(s,date),survivorVersion:s.survivorVersion,score:m.score,lost:m.lost,upgradesChosen:m.upgradesChosen,hearts:m.hearts};}
function validateEvent(e,words){G.validateEvent(e,words);if(e.mode!=='survivor'||![1,2].includes(e.survivorVersion)||!['completed','abandoned'].includes(e.status)||!int(e.lost,0,e.rounds)||!int(e.upgradesChosen,0,Math.floor(e.solved/upgradeEvery(e)))||!int(e.hearts,0,3)||!int(e.score,e.solved*100,e.solved*520)||e.score%20!==0||e.lost>3+e.upgradesChosen||e.status==='completed'&&(e.lost<3||e.upgradesChosen!==Math.floor(e.solved/upgradeEvery(e)))||e.status==='completed'&&e.hearts!==0||e.status==='abandoned'&&e.hearts===0||e.solved+e.lost>e.rounds||e.solved+e.lost<e.rounds-1||e.attempts<e.solved+e.lost*6||e.attempts>e.rounds*8||e.status==='completed'&&e.solved+e.lost!==e.rounds)fail();return e;}
function colors(s){const r=active(s),out={};r.guesses.forEach((w,j)=>E.letters(w).forEach((c,i)=>out[c]=Math.max(out[c]??0,r.evaluations[j][i])));if(r.hintIndex!==undefined)out[E.letters(r.target)[r.hintIndex]]=2;return out;}
function summary(events,running=[]){const rows=events.filter(e=>e.mode==='survivor'),ids=new Set(rows.map(e=>e.id));return {played:rows.length+running.filter(s=>s.status==='playing'&&!ids.has(s.id)).length,finished:rows.length,abandoned:rows.filter(e=>e.status==='abandoned').length,highscore:rows.reduce((n,e)=>Math.max(n,e.score),0),bestSolved:rows.reduce((n,e)=>Math.max(n,e.solved),0),solved:rows.reduce((n,e)=>n+e.solved,0),attempts:rows.reduce((n,e)=>n+e.attempts,0)};}
function share(s){const m=metrics(s);return `WORDLE DE – SURVIVOR 🌿\n${s.status==='abandoned'?'Run beendet':'Game Over'}\n🏆 ${m.score.toLocaleString('de-DE')} Punkte\n✅ ${m.solved} Wörter gelöst\n${m.lost} Rätsel verloren · ${m.attempts} Rateversuche\n✦ ${m.upgradesChosen} Upgrades gewählt`;}
const api={UPGRADE_INTERVAL,upgradeEvery,MAX_HEARTS,UPGRADES,normalLimit,chooseLength,points,eligible,create,validate,metrics,active,stage,error,submit,chooseUpgrade,advance,abandon,result,validateEvent,colors,summary,share};root.WordleSurvivor=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
