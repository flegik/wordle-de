const assert=require('node:assert/strict');
const V=require('../data/word-registry.js'),F=require('../js/selection.js'),S=require('../js/storage.js'),E=require('../js/engine.js'),SV=require('../js/survivor.js');
assert.equal(V.current,'de-2.5');assert(V.active().solutions[7].includes('VORWAHL'));assert(F.pools(7).A.includes('VORWAHL'));
for(const [version,raw] of Object.entries(V.packages)){assert(V.resolve(version).accepted[7].includes('VORWAHL'));if(!['de-2.4','de-2.5'].includes(version))assert(!raw.solutions[7].includes('VORWAHL'));}
let run=SV.create({id:'vorwahl',started:0,length:7,target:'VORWAHL'},V.active());run=SV.submit(run,'VORWAHL',1,V.active());assert.equal(run.roundEnds[0].reason,'won');assert.equal(SV.UPGRADE_INTERVAL,7);
const state=S.fresh();state.selection={version:1,wordVersion:'de-2.3',qualityVersion:'quality-4',lengths:{7:{cycle:4,initial:{A:1,B:0,C:0},remaining:{A:['NUTZUNG'],B:[],C:[]},recent:['FENSTER']}}};
const migrated=S.migrate(state,V.active());assert.deepEqual(migrated.selection.lengths[7].remaining.A,['NUTZUNG','VORWAHL']);assert.deepEqual(S.migrate(migrated,V.active()),migrated);assert.deepEqual(S.importBackup(S.exportBackup(migrated,V.active()),V.active()),migrated);
for(const d of ['2026-10-16','2026-10-17','2027-01-01'])assert.deepEqual(E.daily(V.daily(),d),E.daily(V.packages['de-1'],d));
console.log('VORWAHL: active A target, historical input compatibility, real Survivor win, seven-win balance, bag migration/idempotence, backup round-trip and frozen daily targets passed.');
const harness=require('./helpers/app-harness.cjs');
for(const mode of ['classic','random','streak']){const state=S.migrate(S.fresh(),V.active());state.games[mode]={id:mode,mode,length:7,target:'FENSTER',guesses:[],input:'',status:'playing',hard:false,wordVersion:'de-2.3',started:0};const h=harness(new Map([[S.KEY,JSON.stringify(state)]]));h.click('start',{mode});h.type('vorwahl');h.enter();h.flush();assert.deepEqual(h.state().games[mode].guesses,['VORWAHL']);}
console.log('VORWAHL accepted through classic/random/streak UI in saved historical rounds.');
