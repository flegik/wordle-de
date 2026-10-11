const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../js/engine.js'),G=require('../js/sessions.js'),S=require('../js/storage.js');
vm.runInThisContext(fs.readFileSync(require.resolve('../data/words.js'),'utf8'));
const fixture=require('./fixtures/schema-1-representative.json'),dailyFixtures=require('./fixtures/de-1-daily.json');
const copy=v=>JSON.parse(JSON.stringify(v));let count=0;
function test(name,fn){fn();count++;console.log('✓ '+name);}
function store(entries=[]){const data=new Map(entries);return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};}
function double(){return G.createSession({id:'arcade-double',mode:'double',started:1000,attemptBudget:8,
 rounds:[G.createRound({id:'a',length:5,target:'LEGAT',attemptLimit:8},WORDS),G.createRound({id:'b',length:5,target:'SEGEL',attemptLimit:8},WORDS)]},WORDS);}
test('Representative schema-1 fixture validates and migrates without changing any legacy collection',()=>{
 E.validate(fixture,WORDS);const original=copy(fixture),s=S.migrate(fixture,WORDS);
 assert.equal(s.schema,2);assert.equal(s.wordVersion,'de-1');
 for(const k of Object.keys(fixture).filter(k=>k!=='schema'))assert.deepEqual(s[k],fixture[k]);
 assert.deepEqual(fixture,original);assert.deepEqual(s.sessions,{});assert.deepEqual(s.sessionEvents,[]);
 assert.deepEqual(E.summary(s.events),E.summary(fixture.events));assert.equal(s.streak.best,2);
 assert.equal(s.games.random.target,'HUNNI');assert.equal(s.games.classic.input,'ÄÖẞ');
});
test('Migration is deterministic and idempotent, including backup roundtrips',()=>{
 const a=S.migrate(fixture,WORDS),b=S.migrate(fixture,WORDS);
 assert.deepEqual(a,b);assert.deepEqual(S.migrate(a,WORDS),a);
 assert.deepEqual(S.importBackup(S.exportBackup(a,WORDS),WORDS),a);
 assert.deepEqual(S.importBackup(JSON.stringify(fixture),WORDS),a);
});
test('1461 frozen UTC daily fixtures remain unchanged across schema migration',()=>{
 for(const {date,length,target} of dailyFixtures)assert.deepEqual(E.daily(WORDS,date),{length,target});
 const s=S.migrate(fixture,WORDS),d=Object.keys(s.daily)[0];assert.equal(s.daily[d],fixture.daily[d]);
 assert.equal(s.games['daily:'+d].target,E.daily(WORDS,d).target);
 assert(WORDS.solutions[5].includes('LEGAT'));assert(WORDS.accepted[5].includes('LEGAT'));
});
test('New key takes precedence; the original key stays byte-for-byte unchanged',()=>{
 const raw=JSON.stringify(fixture),storage=store([[S.LEGACY_KEY,raw]]),loaded=S.load(storage,WORDS);
 assert.equal(loaded.readOnly,false);assert.equal(loaded.source,S.LEGACY_KEY);assert.equal(storage.data.size,1);
 S.save(storage,loaded.state,WORDS);assert.equal(storage.data.get(S.LEGACY_KEY),raw);
 assert.deepEqual(S.load(storage,WORDS).state,loaded.state);assert.equal(S.load(storage,WORDS).source,S.KEY);
});
test('Corrupt/unknown data is preserved and writing is explicitly blocked',()=>{
 for(const raw of ['{broken',JSON.stringify({...fixture,schema:99}),JSON.stringify({...fixture,wordVersion:'de-2'})]){
  const storage=store([[S.KEY,raw],[S.LEGACY_KEY,JSON.stringify(fixture)]]),loaded=S.load(storage,WORDS);
  assert.equal(loaded.readOnly,true);assert.equal(loaded.raw,raw);assert(loaded.error);
  assert.throws(()=>S.save(storage,loaded.state,WORDS,loaded));assert.equal(storage.data.get(S.KEY),raw);
 }
 const broken=store([[S.LEGACY_KEY,'not json']]);assert(S.load(broken,WORDS).readOnly);assert.equal(broken.data.get(S.LEGACY_KEY),'not json');
 assert(S.load({getItem(){throw Error('denied');}},WORDS).readOnly);
 assert.throws(()=>S.migrate({...fixture,sessions:{old:'data'}},WORDS));
});
test('Multiple rounds share one canonical input and derive separate duplicate-aware colors',()=>{
 const original=double(),next=G.appendAttempt(original,'legat',['a','b'],WORDS);
 assert.equal(original.attempts.length,0);assert.equal(next.attempts.length,1);
 assert.equal(G.roundView(next,'a').status,'won');assert.equal(G.roundView(next,'b').status,'playing');
 assert.deepEqual(G.roundView(next,'b').evaluations[0],E.evaluate('LEGAT','SEGEL'));
 const state=S.fresh();state.sessions[next.id]=next;
 assert.deepEqual(S.importBackup(S.exportBackup(state,WORDS),WORDS),state);
 assert.throws(()=>G.appendAttempt(next,'SEGEL',['a','b'],WORDS));
 const solved=G.appendAttempt(next,'SEGEL',['b'],WORDS);assert.equal(G.roundView(solved,'b').status,'won');
});
test('Session budgets, round limits, IDs, dictionary validation and Hard Mode are enforced',()=>{
 assert.throws(()=>G.createSession({id:'dup',mode:'double',started:0,rounds:[double().rounds[0],double().rounds[0]]},WORDS));
 const s=double();s.attemptBudget=1;const n=G.appendAttempt(s,'REGAL',['a'],WORDS);
 assert.throws(()=>G.appendAttempt(n,'SEGEL',['b'],WORDS));
 assert.throws(()=>G.appendAttempt(double(),'XXXXX',['a'],WORDS));
 assert.throws(()=>G.appendAttempt(double(),'LEGAT',['a','a'],WORDS));
 const h=G.createSession({id:'hard',mode:'theme',started:0,rounds:[G.createRound({id:'h',length:5,target:'APFEL',hard:true},WORDS)]},WORDS);
 const first=G.appendAttempt(h,'ALLEE',['h'],WORDS);
 assert.throws(()=>G.appendAttempt(first,'ALARM',['h'],WORDS));
 assert.doesNotThrow(()=>G.appendAttempt(first,'APFEL',['h'],WORDS));
 const umlaut=G.createRound({id:'u',length:6,target:'straße'},WORDS);assert.equal(umlaut.target,'STRAẞE');
});
test('Arcade result recording is idempotent and never changes original Wordle means',()=>{
 const before=S.migrate(fixture,WORDS),stats=E.summary(before.events);
 let s=G.appendAttempt(double(),'LEGAT',['a','b'],WORDS);s=G.appendAttempt(s,'SEGEL',['b'],WORDS);s=G.finish(s,'won',3000,WORDS);
 const next=S.recordSession(before,s,'2026-10-11',WORDS),again=S.recordSession(next,s,'2026-10-11',WORDS);
 assert.deepEqual(again,next);assert.deepEqual(E.summary(next.events),stats);assert.equal(next.sessionEvents.length,1);
 assert.deepEqual(G.summary(next.sessionEvents,'double'),{played:1,wins:1,solved:2,attempts:2,bestScore:null,bestSolved:2});
 assert.equal(G.summary(next.sessionEvents,'tower').played,0);
 assert.deepEqual(S.importBackup(S.exportBackup(next,WORDS),WORDS),next);
 const duplicate=copy(next);duplicate.sessionEvents.push(copy(duplicate.sessionEvents[0]));assert.throws(()=>S.validate(duplicate,WORDS));
 const conflict={...s,ended:4000};assert.throws(()=>S.recordSession(next,conflict,'2026-10-11',WORDS));
 const collision={...s,id:fixture.events[0].id};assert.throws(()=>S.recordSession(before,collision,'2026-10-11',WORDS));
});
test('Mode-specific score records stay separate and inconsistent backups are rejected',()=>{
 const session=G.createSession({id:'speed',mode:'speedrun',started:0,rounds:[G.createRound({id:'s',length:4,target:'AUTO'},WORDS)]},WORDS);
 const finished=G.finish(session,'completed',180000,WORDS,120),state=S.recordSession(S.fresh(),finished,'2026-10-11',WORDS);
 assert.equal(G.summary(state.sessionEvents,'speedrun').bestScore,120);assert.equal(E.summary(state.events).played,0);
 const bad=copy(state);bad.sessionEvents[0].solved=1;assert.throws(()=>S.validate(bad,WORDS));
 const active=copy(state);active.sessions.speed.status='playing';delete active.sessions.speed.ended;assert.throws(()=>S.validate(active,WORDS));
 const invalid=copy(session);invalid.status='won';invalid.ended=1;assert.throws(()=>G.validate(invalid,WORDS));
});
test('Validation failure and storage quota failure cannot overwrite existing saves',()=>{
 const storage=store([[S.KEY,'original']]),bad=S.fresh();bad.settings.hard='true';
 assert.throws(()=>S.save(storage,bad,WORDS));assert.equal(storage.data.get(S.KEY),'original');
 assert.throws(()=>S.save({setItem(){throw Error('quota');}},S.fresh(),WORDS));
});
console.log(`${count} session/migration checks passed.`);
