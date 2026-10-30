const assert=require('node:assert/strict');
const E=require('../js/engine.js');
const V=require('../data/word-registry.js');
const SV=require('../js/survivor.js');
require('../js/survivor-ui.js');
const UI=globalThis.SurvivorUI,W=V.active();
const fresh=()=>SV.create({id:'survivor-review-test',started:1,length:4,target:'AUTO'},W);

function verifyGrid(session,expectedCount){
 const original=JSON.stringify(session);
 assert.equal(SV.stage(session)==='between'||SV.stage(session)==='upgrade',true);
 const html=UI.between(session);
 assert.match(html,/So hast du geraten/);
 assert.match(html,/class="result-grid survivor-round-grid"/);
 assert.equal((html.match(/class="row"/g)||[]).length,expectedCount);
 assert.equal((html.match(/class="tile (?:absent|present|correct)"/g)||[]).length,expectedCount*session.rounds.at(-1).length);
 assert.equal(JSON.stringify(session),original,'UI must not mutate ongoing run');
 assert.equal(SV.validate(JSON.parse(original),W).id,session.id,'ongoing run remains valid after serialization');
 return html;
}

let won=SV.submit(fresh(),'BAUM',2,W);
won=SV.submit(won,'AUTO',3,W);
assert.equal(SV.stage(won),'between');
assert.match(verifyGrid(won,2),/data-action="survivor-next"/);
assert.match(UI.between(won),/class="tile correct"/);

let lost=fresh();
const misses=W.accepted[4].filter(w=>w!=='AUTO').slice(0,SV.active(lost).attemptLimit);
for(const word of misses)lost=SV.submit(lost,word,3,W);
assert.equal(SV.stage(lost),'between');
assert.match(verifyGrid(lost,misses.length),/Ein Herz verloren/);

for(const version of [1,2,3]){
 const old=JSON.parse(JSON.stringify(won));old.survivorVersion=version;
 assert.equal(SV.validate(old,W).survivorVersion,version);
 assert.match(verifyGrid(old,2),/So hast du geraten/);
}
console.log('✓ Survivor between-round grid shows actual guesses on existing runs, including legacy versions');
