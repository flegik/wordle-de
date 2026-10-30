/* Read-only rendering and controller upgrade compatibility across real 3/5/7-win contracts. */
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm'),fixtures=require('./fixtures/survivor-grid/saves.json'),SV=require('../js/survivor.js'),S=require('../js/storage.js'),V=require('../data/word-registry.js'),E=require('../js/engine.js'),harness=require('./helpers/app-harness.cjs');
require('../js/double-ui.js');require('../js/survivor-ui.js');const UI=global.SurvivorUI,W=V.active();
const old=fs.readFileSync('tests/fixtures/survivor-grid/ui-before-grid.js','utf8');assert.equal(crypto.createHash('sha256').update(old).digest('hex'),'d196285d19f061c4c4399832cf71f2b1cab4257170164d30b7f8e67b082e007a');
const oldUI={WordleSurvivor:SV,Engine:E,DoubleUI:global.DoubleUI};vm.createContext(oldUI);vm.runInContext(old,oldUI);
let count=0;
for(const f of fixtures.cases){const s=Object.values(f.state.sessions)[0],original=JSON.stringify(f.state),expectedRaw=JSON.stringify(s),before=SV.summary(f.state.sessionEvents,s.status==='playing'?[s]:[]);
 SV.validate(s,W);assert.equal(SV.upgradeEvery(s),f.interval);assert.deepEqual(SV.metrics(s),f.expected);
 const html=f.stage==='word'?UI.game(s):f.stage==='result'?UI.result(s,f.state.sessionEvents):UI.between(s);
 if(f.stage!=='word'&&s.roundEnds.length===s.rounds.length){const r=f.expected.rounds.at(-1);assert(html.includes('survivor-round-grid'));const match=html.match(/class="result-grid survivor-round-grid"[^>]*>(.*?)<\/div><\/div>/s);assert(match);const cells=[...match[1].matchAll(/class="tile (absent|present|correct)" aria-label="([^"]+)">([^<]*)<\/span>/g)];assert.equal(cells.length,r.guesses.length*r.length);let i=0;for(let j=0;j<r.guesses.length;j++)for(let k=0;k<r.length;k++){const c=cells[i++];assert.equal(c[1],['absent','present','correct'][r.evaluations[j][k]]);assert.equal(c[3],E.letters(r.guesses[j])[k]);}}
 if(f.stage==='word')assert(!html.includes('survivor-round-review'),'never reveal a playing word through the new panel');
 if(f.name.includes('abandoned-draft'))assert(!html.includes('survivor-round-review'),'never fabricate a completed puzzle after abandonment');
 assert.equal(JSON.stringify(f.state),original);
 const restored=S.importBackup(S.exportBackup(f.state,W),W);assert.equal(JSON.stringify(restored.sessions[s.id]),expectedRaw);assert.deepEqual(restored.sessionEvents,f.state.sessionEvents);assert.deepEqual(restored.events,f.state.events);assert.deepEqual(SV.summary(restored.sessionEvents,s.status==='playing'?[s]:[]),before);
 const scripts=[...fs.readFileSync('index.html','utf8').matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]);const beforeScripts=scripts.map(p=>p==='./js/survivor-ui.js'?'./tests/fixtures/survivor-grid/ui-before-grid.js':p);
 let h=harness(new Map([[S.KEY,original]]),{scripts:beforeScripts});h.click('start',{mode:'survivor'});if(s.status==='playing')h.click('survivor-resume');
 // Persist through the actual previous controller, then reload the updated UI/controller.
 h.click('settings');const previous=h.store.get(S.KEY);h=harness(h.store);h.click('start',{mode:'survivor'});if(s.status==='playing')h.click('survivor-resume');assert.equal(JSON.stringify(h.state().sessions[s.id]),expectedRaw);
 assert.deepEqual(h.state().sessionEvents,f.state.sessionEvents);assert.deepEqual(h.state().events,f.state.events);
 h.click('home');h=harness(h.store);h.click('start',{mode:'survivor'});if(s.status==='playing')h.click('survivor-resume');assert.equal(JSON.stringify(h.state().sessions[s.id]),expectedRaw);
 if(f.stage==='between'){const closed=s.roundEnds.length;h.click('survivor-next');h.click('survivor-next');const next=h.state().sessions[s.id];assert.equal(next.rounds.length,s.rounds.length+1);assert.equal(next.roundEnds.length,closed);assert.equal(next.survivorVersion,s.survivorVersion);assert.equal(SV.metrics(next).hearts,f.expected.hearts);assert.equal(h.state().sessionEvents.length,f.state.sessionEvents.length);}
 if(f.stage==='upgrade'){const id=s.upgrades.at(-1).offered[0];h.click('survivor-upgrade',{id,after:String(s.rounds.length)});const chosen=h.state().sessions[s.id];h.click('survivor-upgrade',{id,after:String(s.rounds.length)});assert.deepEqual(h.state().sessions[s.id],chosen);assert.equal(SV.metrics(chosen).upgradesChosen,f.expected.upgradesChosen+1);}
 if(s.status!=='playing'){assert.deepEqual(S.recordSession(restored,s,'2026-10-30',W),restored);assert.deepEqual(S.recordSession(S.recordSession(restored,s,'2026-10-30',W),s,'2026-10-30',W),restored);}
 count++;
}
console.log(count+' frozen Survivor snapshots: authentic letter/color grids, old UI → new controller reload, 3/5/7-win contracts, hearts, active effects, pending choices, drafts, statistics, backup round-trips and exactly-once progression passed.');
