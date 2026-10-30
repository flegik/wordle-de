/* Representative snapshots made with unchanged production Survivor rules.
   Reproduce with node tools/build_survivor_grid_fixtures.cjs. Never user's personal data. */
const fs=require('node:fs'),V=require('../data/word-registry.js'),SV=require('../js/survivor.js'),S=require('../js/storage.js');
const files=[],date='2026-10-30',rng=()=>.99,clone=x=>JSON.parse(JSON.stringify(x));
function win(s,w){return SV.submit(s,s.rounds.at(-1).target,2,w,rng);}
function advance(s,w,n=4){return SV.advance(s,{length:n,target:n===4?'AUTO':n===5?'LEGAT':n===6?'STRAẞE':'FENSTER'},w,rng);}
function lose(s,w){const r=SV.active(s);for(const word of w.accepted[r.length].filter(x=>x!==r.target).slice(0,r.attemptLimit))s=SV.submit(s,word,2,w,rng);return s;}
function choose(s,id,w){if(!s.upgrades.at(-1).offered.includes(id))throw Error('fixture offer missing '+id);return SV.chooseUpgrade(s,id,s.rounds.length,w);}
for(const [version,wordVersion] of [[1,'de-2.2'],[2,'de-2.4'],[3,'de-2.5']]){
 const w=V.resolve(wordVersion),fresh=()=>Object.assign(SV.create({id:'survivor-grid-v'+version,started:1,length:4,target:'AUTO'},w),{survivorVersion:version});
 function capture(name,s){SV.validate(s,w);const state=S.migrate(S.fresh(),V.active());state.sessions[s.id]=clone(s);if(s.status!=='playing')state.sessionEvents=[SV.result(s,date)];state.events=[{id:'preserved-classic',mode:'classic',length:5,guesses:3,win:true,abandoned:false,date}];state.streak={current:0,best:0};S.validate(state,V.active());files.push({name:'v'+version+'-'+name,state,expected:SV.metrics(s),stage:SV.stage(s),interval:SV.upgradeEvery(s)});}
 let s=fresh();s.input='Äẞ';capture('draft',s);
 s=SV.submit(fresh(),'BAUM',2,w);s=win(s,w);capture('won',s);
 s=lose(fresh(),w);capture('lost',s);
 // Lose one heart before rewards so all four upgrade types can be legitimately selected.
 let base=lose(fresh(),w);for(let i=0;i<SV.upgradeEvery(base);i++){base=advance(base,w);base=win(base,w);}
 capture('pending-offer',base);
 for(const id of ['heal','shield','extra','hint']){
  // Store canonical alternative valid offers, not fabricated effects.
  const candidate=clone(base),u=candidate.upgrades.at(-1);u.offered=id==='heal'?['heal','extra','hint']:['shield','extra','hint'];SV.validate(candidate,w);
  const picked=choose(candidate,id,w);capture('chosen-'+id,picked);
  let active=advance(picked,w,id==='extra'||id==='hint'?7:4);active.input='Äẞ';capture('active-'+id,active);
  if(id==='shield'){active.input='';capture('shielded-loss',lose(active,w));}
  if(id==='extra'){active.input='';const r=SV.active(active);for(const word of w.accepted[7].filter(x=>x!==r.target).slice(0,r.attemptLimit-1))active=SV.submit(active,word,2,w,rng);active=win(active,w);capture('eight-tries-seven-letters',active);}
 }
 s=lose(fresh(),w);s=lose(advance(s,w),w);s=lose(advance(s,w),w);capture('game-over',s);
 s=SV.abandon(Object.assign(advance(win(fresh(),w),w),{input:'Äẞ'}),3,w);capture('abandoned-draft',s);
}
const output={sourceCommit:'56cc8574837732990d3e34ffb1a7d224b168fef1',description:'Representative production-compatible fixtures; no personal player data.',cases:files};
fs.writeFileSync('tests/fixtures/survivor-grid/saves.json',JSON.stringify(output,null,2)+'\n');console.log(files.length+' canonical Survivor snapshots generated.');
