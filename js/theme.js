/* Single-round theme contract and independently versioned editorial bags. */
(function(root){
'use strict';
const V=root.WordRegistry||(typeof require==='function'?require('../data/word-registry.js'):null);
const E=root.Engine||(typeof require==='function'?require('./engine.js'):null),G=root.Sessions||(typeof require==='function'?require('./sessions.js'):null);
const P=root.ThemePools||(typeof require==='function'?require('../data/themes.js'):null),clone=v=>JSON.parse(JSON.stringify(v));
function pack(version=P.current,words,registry=P){const p=registry.versions[version];if(!p)throw Error('Unbekannte Themenversion.');words=V.resolve(p.baseWordVersion,words);if(p.version!==version||p.baseWordVersion!==words.version)throw Error('Unbekannte Themen- oder Basiswortversion.');return p;}
function category(version,id,words,registry=P){const c=pack(version,words,registry).categories.find(c=>c.id===id);if(!c)throw Error('Unbekannte Themenkategorie.');return c;}
function pool(version,id,n,words,registry=P){const c=category(version,id,words,registry);if(!c.lengths.includes(n)||!c.solutions[n]||c.solutions[n].length<pack(version,words,registry).minimum)throw Error('Diese Themenwortlänge ist noch nicht freigeschaltet.');return c.solutions[n];}
function hasContract(s){return ['themeVersion','categoryId','themeContract'].some(k=>k in s);}
function validate(s,words,registry=P){words=V.resolve(s.wordVersion,words);
 G.validate(s,words);const c=category(s.themeVersion,s.categoryId,words,registry),r=s.rounds[0];
 if(typeof s.themeVersion!=='string'||s.mode!=='theme'||s.themeContract!==1||s.rounds.length!==1||r.id!=='word'||r.attemptLimit!==(r.length<6?6:7)||s.attemptBudget!==undefined||!pool(s.themeVersion,c.id,r.length,words,registry).includes(r.target)||s.score!==undefined||!['playing','won','lost','abandoned'].includes(s.status))throw Error('Ungültige Themenrunde.');
 const v=G.roundView(s,r.id);
 if(s.status==='playing'&&v.status!=='playing'||s.status==='lost'&&v.guesses.length!==r.attemptLimit||s.status==='abandoned'&&(v.status==='won'||v.guesses.length>=r.attemptLimit))throw Error('Widersprüchlicher Themenabschluss.');
 if(typeof s.input!=='string'||E.normalize(s.input)!==s.input||!/^[A-ZÄÖÜẞ]*$/u.test(s.input)||E.letters(s.input).length>r.length||s.status!=='playing'&&s.input!=='')throw Error('Ungültige Themeneingabe.');
 return s;
}
function create({id,categoryId,length,target,started,hard=false,themeVersion=P.current},words){
 const s=G.createSession({id,mode:'theme',started,rounds:[G.createRound({id:'word',length,target,hard},words)]},words);
 Object.assign(s,{themeContract:1,themeVersion,categoryId,input:''});return validate(s,words);
}
function error(s,word,words){words=V.resolve(s.wordVersion,words);const r=G.roundView(s,'word'),w=E.normalize(word);return E.letters(w).length!==r.length?`${r.length} Buchstaben bitte.`:!words.accepted[r.length].includes(w)?'Dieses Wort steht nicht in der Wortliste.':r.guesses.includes(w)?'Dieses Wort hast du schon versucht.':r.hard?E.hardError(w,r.guesses,r.target):null;}
function submit(s,word,ended,words){validate(s,words);const err=error(s,word,words);if(err)throw Error(err);let next=G.appendAttempt(s,word,['word'],words);next.input='';const v=G.roundView(next,'word');if(v.status!=='playing')next=G.finish(next,v.status,Math.max(ended,s.started),words);return validate(next,words);}
function abandon(s,ended,words){validate(s,words);const next=G.finish(s,'abandoned',Math.max(ended,s.started),words);next.input='';return validate(next,words);}
function result(s,date){return {...G.result(s,date),themeContract:1,themeVersion:s.themeVersion,categoryId:s.categoryId,length:s.rounds[0].length};}
function validateEvent(e,words,registry=P){G.validateEvent(e,words);pool(e.themeVersion,e.categoryId,e.length,words,registry);const limit=e.length<6?6:7;if(typeof e.themeVersion!=='string'||e.mode!=='theme'||e.themeContract!==1||e.rounds!==1||e.score!==undefined||e.attempts>limit||e.status==='completed'||e.status==='won'&&(e.solved!==1||e.attempts<1)||e.status!=='won'&&e.solved!==0||e.status==='lost'&&e.attempts!==limit||e.status==='abandoned'&&e.attempts===limit)throw Error('Ungültige Themenstatistik.');return e;}
function validateBags(state,words,registry=P){
 if(state.themeLast!==undefined&&!Object.values(registry.versions).some(p=>p.baseWordVersion===words.version&&p.categories.some(c=>Object.values(c.solutions).some(a=>a.includes(state.themeLast)))))throw Error('Ungültiges letztes Themenwort.');
 if(state.themeBags===undefined)return state;
 if(!state.themeBags||typeof state.themeBags!=='object'||Array.isArray(state.themeBags))throw Error('Ungültige Themenbeutel.');
 for(const [key,bag] of Object.entries(state.themeBags)){
  const [version,id,n,...extra]=key.split(':');if(extra.length||n!==String(+n))throw Error('Ungültiger Themenbeutel-Schlüssel.');const p=pool(version,id,+n,words,registry);
  if(!bag||typeof bag!=='object'||Array.isArray(bag)||Object.keys(bag).some(k=>!['remaining','last'].includes(k))||!Array.isArray(bag.remaining)||new Set(bag.remaining).size!==bag.remaining.length||bag.remaining.some(w=>!p.includes(w))||!p.includes(bag.last)||bag.remaining.includes(bag.last))throw Error('Ungültiger Themenbeutel.');
 }
 return state;
}
function draw(state,id,n,words,random=Math.random,version=P.current){
 validateBags(state,words);const p=pool(version,id,n,words),key=`${version}:${id}:${n}`,bags=clone(state.themeBags||{}),old=bags[key],bag=old?.remaining.length?[...old.remaining]:[...p];
 if(!old?.remaining.length)for(let i=bag.length-1;i>0;i--){const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw Error('Ungültige Zufallsquelle.');const j=Math.floor(value*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
 // Avoid both this pool's last word and the most recent word in another pool.
 if([old?.last,state.themeLast].includes(bag.at(-1))){const j=bag.findIndex(w=>![old?.last,state.themeLast].includes(w));if(j>=0)[bag[j],bag[bag.length-1]]=[bag[bag.length-1],bag[j]];}
 let target;if(bag.length===1&&bag[0]===state.themeLast){const choices=p.filter(w=>w!==state.themeLast&&w!==old?.last),value=random();if(!Number.isFinite(value)||value<0||value>=1)throw Error('Ungültige Zufallsquelle.');target=choices[Math.floor(value*choices.length)];}else target=bag.pop();bags[key]={remaining:bag,last:target};return {target,themeBags:bags,themeLast:target};
}
function colors(s){const r=G.roundView(s,'word'),out={};r.guesses.forEach((w,j)=>E.letters(w).forEach((c,i)=>out[c]=Math.max(out[c]??0,r.evaluations[j][i])));return out;}
function summary(events,id='all',n='all'){const rows=events.filter(e=>e.mode==='theme'&&e.themeContract===1&&(id==='all'||e.categoryId===id)&&(n==='all'||e.length===+n));return {...E.summary(rows.map(e=>({win:e.status==='won',abandoned:e.status==='abandoned',guesses:e.attempts}))),byCategory:rows.reduce((a,e)=>{if(e.status==='won')a[e.categoryId]=(a[e.categoryId]||0)+1;return a;},{})};}
function share(s,words){const r=G.roundView(s,'word'),c=category(s.themeVersion,s.categoryId,words);return `WORDLE DE – THEMEN-WORDLE ${c.icon}\nKategorie: ${c.name}\n${r.length} Buchstaben${r.hard?' · Hard':''}\n${s.status==='won'?'Gelöst in '+r.guesses.length:'X'}/${r.attemptLimit} Versuchen${s.status==='abandoned'?' · Abgebrochen':''}\n\n${r.evaluations.map(row=>row.map(n=>['⬛','🟨','🟩'][n]).join('')).join('\n')}`;}
const api={pack,category,pool,hasContract,create,validate,error,submit,abandon,result,validateEvent,validateBags,draw,colors,summary,share};root.WordleTheme=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
