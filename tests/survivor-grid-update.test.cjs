/* Exercise the actual app update handlers, not a duplicate implementation. */
const assert=require('node:assert/strict'),fixtures=require('./fixtures/survivor-grid/saves.json'),S=require('../js/storage.js'),harness=require('./helpers/app-harness.cjs');
async function create({name='v1-active-hint',fail=false,corrupt=false}={}){
 const f=fixtures.cases.find(x=>x.name===name),store=new Map([[S.KEY,corrupt?'{damaged':JSON.stringify(f.state)]]),messages=[],handlers={},calls={reload:0},h=harness(store,{url:'https://isolated.test/wordle/',setup(ctx){ctx.navigator.serviceWorker={controller:{},register:async()=>({waiting:{postMessage:m=>messages.push(m)},addEventListener(){}}),getRegistration:async()=>({active:{}}),addEventListener:(name,fn)=>handlers[name]=fn};ctx.location.reload=()=>calls.reload++;if(fail)ctx.localStorage.setItem=()=>{throw Error('QuotaExceededError');};}});
 await Promise.resolve();await Promise.resolve();h.click('settings');return {f,h,store,messages,handlers,calls};
}
(async()=>{
 for(const name of ['v1-active-hint','v2-active-extra','v3-pending-offer']){
  const x=await create({name});const original=x.h.state().sessions;x.h.click('update');assert.equal(JSON.stringify(x.messages),JSON.stringify([{type:'SKIP_WAITING'}]));x.handlers.controllerchange();x.handlers.controllerchange();assert.equal(x.calls.reload,1);assert.deepEqual(x.h.state().sessions,original);const reloaded=harness(x.store);assert.deepEqual(reloaded.state().sessions,original);assert.deepEqual(reloaded.state().sessionEvents,x.f.state.sessionEvents);
 }
 for(const controllerFirst of [false,true]){const x=await create({fail:true});const raw=x.store.get(S.KEY);if(controllerFirst)x.handlers.controllerchange();else{x.h.click('update');x.handlers.controllerchange();}assert.equal(x.calls.reload,0);assert.equal(x.messages.length,0);assert.equal(x.store.get(S.KEY),raw);assert(x.h.get('#toast').textContent.includes('angehalten'));}
 const readonly=await create({corrupt:true});readonly.h.click('update');readonly.handlers.controllerchange();assert.equal(readonly.store.get(S.KEY),'{damaged');assert.equal(readonly.calls.reload,0);assert.equal(readonly.messages.length,0);
 const concurrent=await create();const alien=JSON.parse(concurrent.store.get(S.KEY));alien.settings.sound=!alien.settings.sound;const alienRaw=JSON.stringify(alien);concurrent.store.set(S.KEY,alienRaw);concurrent.h.click('update');concurrent.handlers.controllerchange();assert.equal(concurrent.messages.length,0);assert.equal(concurrent.calls.reload,0);assert.equal(concurrent.store.get(S.KEY),alienRaw);
 const active=await create();active.h.click('start',{mode:'survivor'});active.h.click('survivor-resume');active.h.click('update');active.handlers.controllerchange();assert.equal(active.calls.reload,0);assert.equal(active.messages.length,0);assert.deepEqual(active.h.state().sessions,active.f.state.sessions);
 console.log('8 actual-app update groups passed: paused 3/5/7-win runs reload once intact; failed saves, corrupt originals, concurrent writes and active play block activation/reload.');
})().catch(e=>{console.error(e);process.exitCode=1;});
