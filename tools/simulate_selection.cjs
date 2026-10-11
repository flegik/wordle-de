/* Seeded reproducible selection experiment; wall times are measurements, not thresholds. */
const fs=require('node:fs'),assert=require('node:assert/strict'),F=require('../js/selection.js'),V=require('../data/word-registry.js');
const seedRng=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const modes=Object.keys(F.weights),rows=[];
for(const algorithm of ['naive','adaptive','uniform'])for(const profile of ['mixed',...modes])for(const seed of (profile==='mixed'?[17,42,2026]:[42]))for(const n of [4,5,6,7]){
 let state={bags:{},last:{}},rng=seedRng(seed+n),counts={A:0,B:0,C:0},seen=new Set(),history=[],same=0,cooldown=0,gaps=[],lastSeen=new Map();
 const total=V.active().solutions[n].length,start=performance.now();
 for(let i=0;i<total+100;i++){
  const mode=profile==='mixed'?modes[i%modes.length]:profile,d=F.draw(state,n,mode,rng,algorithm);state.selection=d.selection;
  if(i<total){assert(!seen.has(d.target));seen.add(d.target);}else if(history.slice(-150).includes(d.target))cooldown++;
  if(history.at(-1)===d.target)same++;if(lastSeen.has(d.target))gaps.push(i-lastSeen.get(d.target));lastSeen.set(d.target,i);history.push(d.target);counts[d.class]++;
  if([100,500,1000,total,total+100].includes(i+1))rows.push({algorithm,profile,seed,length:n,draws:i+1,modePattern:profile==='mixed'?modes:[profile],classes:{...counts},last100:history.slice(-100).reduce((a,w)=>{a[global.WordQuality.classes[w]]++;return a;},{A:0,B:0,C:0}),cycle:d.cycle,milliseconds:+(performance.now()-start).toFixed(2),bagBytes:Buffer.byteLength(JSON.stringify(state.selection)),immediateRepeats:same,boundaryCooldownViolations:cooldown,repeats:gaps.length,meanRepeatGap:gaps.length?+(gaps.reduce((a,b)=>a+b,0)/gaps.length).toFixed(2):null,minRepeatGap:gaps.length?Math.min(...gaps):null});
 }
 assert.equal(seen.size,total);assert.equal(same,0);assert.equal(cooldown,0);
}
const pools=Object.fromEntries([4,5,6,7].map(n=>[n,Object.fromEntries(Object.entries(F.pools(n)).map(([c,a])=>[c,a.length]))]));
const report={schema:1,seedMethod:'LCG 1664525/1013904223 uint32',cooldown:F.COOLDOWN,window:F.WINDOW,pools,rows,note:'Mixed mode pattern. Wall-clock milliseconds vary by machine. Full cycles necessarily have inventory proportions, not preferred mode weights.'};
fs.writeFileSync('data/quality/selection-simulation.json',JSON.stringify(report)+'\n');console.log(`${rows.length} checkpoints; all full-cycle uniqueness and boundary cooldown assertions passed.`);
