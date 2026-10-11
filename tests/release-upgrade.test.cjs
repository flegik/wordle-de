/* Actual, byte-frozen production 1.0 controller -> current controller.
 * State adapter only: does NOT certify browser, service worker or device update. */
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const harness=require('./helpers/app-harness.cjs'),S=require('../js/storage.js'),V=require('../data/word-registry.js');
const old=fs.readFileSync('tests/fixtures/app-v1.js');
assert.equal(crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${old.length}\0`),old])).digest('hex'),'6e6b5b700c48ed3275c021c51e82c3b4f497d239');
const store=new Map(),v1=harness(store,{storageKey:S.LEGACY_KEY,scripts:['data/words.js','js/engine.js','tests/fixtures/app-v1.js']});
const win=mode=>{v1.click('start',{mode});const key=mode==='daily'?'daily:'+new Date().toISOString().slice(0,10):mode;v1.type(v1.state().games[key].target);v1.enter();v1.flush();v1.click('home');};
v1.click('classic');v1.click('length',{n:'4'});v1.click('launch-classic');v1.type(v1.state().games.classic.target);v1.enter();v1.flush();v1.click('home');
win('random');win('daily');win('streak');win('streak');
v1.click('classic');v1.click('length',{n:'5'});v1.click('launch-classic');v1.type('ÄÖẞ');v1.click('home');
const raw=store.get(S.LEGACY_KEY),before=JSON.parse(raw);assert.equal(before.schema,1);assert.equal(before.streak.current,2);assert.equal(before.events.length,5);
const modern=harness(store);modern.click('resume',{mode:'classic'});modern.app.handlers.click({target:{closest:()=>({dataset:{key:'Backspace'}})}});modern.type('ẞ');modern.click('home');const after=modern.state();
for(const key of ['events','games','bags','last','daily','streak','settings'])assert.deepEqual(after[key],before[key]);
assert.equal(store.get(S.LEGACY_KEY),raw);assert.equal(after.schema,2);assert.equal(after.games.classic.input,'ÄÖẞ');
console.log('✓ Real frozen 1.0 controller creates saves; 2.0 preserves all legacy collections and original bytes');
const reload=harness(store);reload.click('resume',{mode:'classic'});reload.click('home');assert.equal(reload.state().events.length,5);
assert.deepEqual(S.importBackup(S.exportBackup(reload.state(),V.active()),V.active()),reload.state());
const imported=S.importBackup(raw,V.active());for(const key of ['events','games','bags','last','daily','streak','settings'])assert.deepEqual(imported[key],before[key]);
assert.deepEqual(S.migrate(imported,V.active()),imported);
console.log('✓ Legacy backup, current backup, reload and idempotent migration preserve statistics and active draft');
v1.click('start',{mode:'random'});v1.type(v1.state().games.random.target);v1.enter();v1.flush();const changedLegacy=store.get(S.LEGACY_KEY),modernRaw=store.get(S.KEY);
const conflict=S.load({getItem:k=>store.get(k)||null},V.active());assert(conflict.readOnly);assert.equal(conflict.raw,changedLegacy);
assert.throws(()=>S.save({getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},conflict.state,V.active(),{expectedRaw:modernRaw}),/ältere|ursprünglich|Konflikt/i);
assert.equal(store.get(S.KEY),modernRaw);assert.equal(store.get(S.LEGACY_KEY),changedLegacy);
console.log('✓ Later real old-tab writes protect both snapshots instead of silently overwriting or double-counting');
console.log('3 release upgrade groups passed; state adapter, not a real installed-PWA update.');
