const assert=require('node:assert/strict'),harness=require('./helpers/app-harness.cjs');
const fixture=require('./fixtures/schema-1-representative.json');
const S=require('../js/storage.js');let count=0;
function test(name,fn){fn();count++;console.log('✓ '+name);}
test('Legacy saved rounds resume through the UI and original data is never rewritten',()=>{
 const raw=JSON.stringify(fixture),store=new Map([[S.LEGACY_KEY,raw]]),h=harness(store);
 h.click('resume',{mode:'random'});h.type('N');assert.equal(h.state().schema,2);
 assert.equal(h.state().games.random.input,'HUN');assert.equal(h.state().games.random.target,'HUNNI');
 assert.deepEqual(h.state().events,fixture.events);assert.equal(store.get(S.LEGACY_KEY),raw);
 h.type('NI');h.enter();h.flush();assert.equal(h.state().games.random.status,'won');
 assert.equal(h.state().events.length,fixture.events.length+1);assert.equal(h.state().streak.best,2);
 const r=harness(store);r.click('settings');assert(r.html().includes('Backup exportieren'));
});
test('Corrupted storage permits temporary play but cannot replace the protected original',()=>{
 for(const key of [S.KEY,S.LEGACY_KEY]){
  const store=new Map([[key,'{broken']]),h=harness(store);h.click('start',{mode:'random'});h.type('AUTO');
  assert.equal(store.get(key),'{broken');assert.equal(store.size,1);
  h.click('settings');assert(h.html().includes('Geschützte Originaldaten sichern'));
  h.click('recover');assert.equal(h.downloads.length,1);
 }
});
test('Invalid cross-tab writes are protected; a valid replacement restores persistence',()=>{
 const h=harness();h.click('start',{mode:'random'});const valid=h.store.get(S.KEY);
 h.store.set(S.KEY,'broken-other-tab');h.context.window.handlers.storage({key:S.KEY,newValue:'broken-other-tab'});
 h.type('A');assert.equal(h.store.get(S.KEY),'broken-other-tab');h.click('settings');
 assert(h.html().includes('Geschützte Originaldaten sichern'));h.click('recover');assert.equal(h.downloads.length,1);
 h.store.set(S.KEY,valid);h.context.window.handlers.storage({key:S.KEY,newValue:valid});h.click('resume',{mode:'random'});h.type('A');
 assert.equal(h.state().games.random.input,'A');
});
test('Physical German keyboard inputs preserve umlauts and sharp S as single letters',()=>{
 const h=harness();h.click('classic');h.click('length',{n:'6'});h.click('launch-classic');let prevented=0;
 for(const key of ['ß','ä','ö','ü'])h.context.document.handlers.keydown({key,target:{closest:()=>null},preventDefault(){prevented++;}});
 assert.equal(h.state().games.classic.input,'ẞÄÖÜ');assert.equal(prevented,4);
 h.context.document.handlers.keydown({key:'Backspace',target:{closest:()=>null},preventDefault(){}});
 assert.equal(h.state().games.classic.input,'ẞÄÖ');
});
(async()=>{
 const h=harness(new Map([[S.LEGACY_KEY,JSON.stringify(fixture)]]));h.click('export');
 const backup=JSON.parse(await h.downloads[0].text());assert.equal(backup.schema,2);
 assert.deepEqual(backup.events,fixture.events);assert.deepEqual(backup.daily,fixture.daily);
 const damaged=new Map([[S.KEY,'broken']]),r=harness(damaged);
 await r.get('#import-file').handlers.change({target:{files:[{size:10000,text:async()=>JSON.stringify(fixture)}],value:'old.json'}});
 assert.equal(damaged.get(S.KEY),'broken');r.get('#confirm-action').onclick();
 assert.deepEqual(r.state().events,fixture.events);assert.equal(r.state().schema,2);
 console.log('✓ Schema-1 UI backup import/export retains history and overwrites only after confirmation');count++;
 const round={id:'future',mode:'double',wordVersion:'de-1',attemptBudget:8,rounds:[{id:'f',length:5,target:'LEGAT',hard:false,attemptLimit:8},{id:'g',length:5,target:'SEGEL',hard:false,attemptLimit:8}],attempts:[],status:'playing',started:0};
 const state=r.state();state.sessions.future=round;damaged.set(S.KEY,JSON.stringify(state));
 const withSession=harness(damaged);withSession.click('export');
 const exported=JSON.parse(await withSession.downloads[0].text());assert.deepEqual(exported.sessions.future,round);
 assert.equal(exported.events.length,fixture.events.length);console.log('✓ UI backups preserve future session data without counting it as Wordle rounds');count++;
 console.log(`${count} application migration checks passed (DOM adapter).`);
})().catch(err=>{console.error(err);process.exitCode=1;});
