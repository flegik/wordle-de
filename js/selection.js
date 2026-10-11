/* Shared, versioned weighted bags. Window debt bounds class exhaustion. */
(function(root){
'use strict';
const V=root.WordRegistry||(typeof require==='function'?require('../data/word-registry.js'):null);
if(typeof require==='function'&&!root.WordQuality)require('../data/word-quality.js');
const Q=root.WordQuality,clone=v=>JSON.parse(JSON.stringify(v)),CLASSES=['A','B','C'],WINDOW=64,COOLDOWN=150;
const weights={classic:[.70,.25,.05],random:[.70,.25,.05],streak:[.70,.25,.05],double:[.75,.25,0],tower:[.70,.30,0],speedrun:[.85,.15,0],duel:[.75,.25,0]};
const cached={};
function pools(n){if(cached[n])return Object.fromEntries(CLASSES.map(c=>[c,[...cached[n][c]]]));const p={A:[],B:[],C:[]};for(const w of V.active().solutions[n])p[Q.classes[w]].push(w);cached[n]=p;return Object.fromEntries(CLASSES.map(c=>[c,[...p[c]]]));}
const membership=Object.fromEntries([4,5,6,7].map(n=>[n,new Set(V.active().solutions[n])]));
function valid(s){if(s===undefined)return;if(!s||s.version!==1||s.wordVersion!==V.current||s.qualityVersion!==Q.version||!s.lengths||typeof s.lengths!=='object'||Array.isArray(s.lengths)||Object.keys(s).some(k=>!['version','wordVersion','qualityVersion','lengths'].includes(k)))throw Error('Ungültige Auswahlversion.');
 for(const [n,b] of Object.entries(s.lengths)){if(!['4','5','6','7'].includes(n)||!b||Object.keys(b).sort().join(',')!=='cycle,initial,recent,remaining'||!Number.isSafeInteger(b.cycle)||b.cycle<0||!Array.isArray(b.recent)||b.recent.length>COOLDOWN||b.recent.some(w=>!V.daily().solutions[n].includes(w))||!b.initial||!b.remaining||Object.keys(b.initial).sort().join(',')!=='A,B,C'||Object.keys(b.remaining).sort().join(',')!=='A,B,C')throw Error('Ungültiger Auswahlbeutel.');const p=pools(n),seen=new Set();for(const c of CLASSES){if(!Number.isSafeInteger(b.initial[c])||b.initial[c]<0||b.initial[c]>p[c].length||!Array.isArray(b.remaining[c])||b.remaining[c].length>b.initial[c])throw Error('Ungültige Klassengröße.');for(const w of b.remaining[c]){if(Q.classes[w]!==c||!membership[n].has(w)||seen.has(w))throw Error('Ungültiges Auswahlwort.');seen.add(w);}}}
}
function shuffled(a,random){for(let i=a.length-1;i>0;i--){const j=Math.floor(value(random)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function value(random){const v=random();if(!Number.isFinite(v)||v<0||v>=1)throw Error('Ungültige Zufallsquelle.');return v;}
function prepare(state){if(state.selection){valid(state.selection);return state.selection;}const lengths={};for(const n of [4,5,6,7]){const allowed=new Set(V.active().solutions[n]),legacy=state.bags[n];if(legacy===undefined)continue;const rem={A:[],B:[],C:[]};for(const w of legacy)if(allowed.has(w))rem[Q.classes[w]].push(w);lengths[n]={cycle:0,initial:Object.fromEntries(CLASSES.map(c=>[c,rem[c].length])),remaining:rem,recent:state.last[n]?[state.last[n]]:[]};}const s={version:1,wordVersion:V.current,qualityVersion:Q.version,lengths};valid(s);return s;}
function draw(state,n,mode='classic',random=Math.random,algorithm='adaptive'){
 if(![4,5,6,7].includes(n)||!weights[mode]||!['adaptive','naive','uniform'].includes(algorithm))throw Error('Ungültige Auswahlkonfiguration.');
 // Clone only this small bag, never the entire session history.
 const base=state.selection||prepare(state),old=base.lengths[n],b=old?clone(old):{cycle:0,recent:[],initial:{A:0,B:0,C:0},remaining:{A:[],B:[],C:[]}};
 if(!CLASSES.some(c=>b.remaining[c].length)){const p=pools(n);b.cycle++;b.remaining=Object.fromEntries(CLASSES.map(c=>[c,shuffled(p[c],random)]));b.initial=Object.fromEntries(CLASSES.map(c=>[c,p[c].length]));}
 const total=CLASSES.reduce((sum,c)=>sum+b.initial[c],0),used=total-CLASSES.reduce((sum,c)=>sum+b.remaining[c].length,0),cooldown=Math.min(COOLDOWN,V.active().solutions[n].length-1),recent=new Set(b.recent.slice(-cooldown));
 const preferred=weights[mode],eligible=CLASSES.map((c,i)=>preferred[i]>0&&b.remaining[c].length>0);if(algorithm==='uniform'||!eligible.some(Boolean))eligible.fill(true);
 let candidates=CLASSES.map((c,i)=>eligible[i]?b.remaining[c].filter(w=>!recent.has(w)):[]);
 if(!candidates.some(a=>a.length)){
  // Relax oldest cooldown first; avoid immediate repetition whenever any alternative exists.
  for(let keep=cooldown-1;keep>=0;keep--){const blocked=new Set(keep?b.recent.slice(-keep):[]);candidates=CLASSES.map((c,i)=>eligible[i]?b.remaining[c].filter(w=>!blocked.has(w)):[]);if(candidates.some(a=>a.length))break;}
 }
 let permitted=candidates.map(a=>a.length>0);
 if(algorithm==='adaptive'){const capped=CLASSES.map((c,i)=>permitted[i]&&b.initial[c]-b.remaining[c].length<(used+1)*b.initial[c]/total+WINDOW/2);if(capped.some((yes,i)=>yes&&preferred[i]>0))permitted=capped;}
 let effective=permitted.map((yes,i)=>yes?(algorithm==='uniform'?b.remaining[CLASSES[i]].length:preferred[i]):0);
 // C can be suppressed while any unplayed A/B is available. If only C remains,
 // consume it rather than repeat A/B or deadlock. This is an explicit exhaustion fallback.
 if(!effective.some(x=>x>0)){permitted=candidates.map(a=>a.length>0);effective=permitted.map((yes,i)=>yes?b.remaining[CLASSES[i]].length:0);}
 let ticket=value(random)*effective.reduce((a,b)=>a+b,0),i=0;for(;i<2;i++){ticket-=effective[i];if(ticket<0)break;}
 const list=candidates[i],target=list.at(-1),c=CLASSES[i];b.remaining[c].splice(b.remaining[c].indexOf(target),1);b.recent=[...b.recent,target].slice(-COOLDOWN);
 const selection={...base,lengths:{...base.lengths,[n]:b}};return {target,selection,class:c,cycle:b.cycle};
}
const api={weights,WINDOW,COOLDOWN,pools,validate:valid,prepare,draw};root.WordSelection=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
