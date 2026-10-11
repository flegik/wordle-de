/* State adapter, not a layout or device test. */
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../..');
function harness(store=new Map()){
 const timers=new Map();let seq=0;
 class El{constructor(){this.innerHTML='';this.textContent='';this.dataset={};this.open=false;this.classList={add(){},remove(){},toggle(){}};this.handlers={};}addEventListener(k,fn){this.handlers[k]=fn;}querySelector(){return new El();}querySelectorAll(){return [];}showModal(){this.open=true;}close(){this.open=false;}append(){}click(){}remove(){}select(){}}
 const els=new Map();const get=s=>{if(!els.has(s))els.set(s,new El());return els.get(s);};
 const doc=new El();doc.querySelector=get;doc.body=new El();doc.createElement=()=>new El();
 const win=new El();const downloads=[];class TestURL extends URL{static createObjectURL(blob){downloads.push(blob);return 'blob:test';}static revokeObjectURL(){}}
 let seed=123456;const seededMath=Object.create(Math);seededMath.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const context={console,document:doc,window:win,navigator:{},location:{protocol:'file:'},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setTimeout:(fn)=>{timers.set(++seq,fn);return seq;},clearTimeout:id=>timers.delete(id),setInterval(){},matchMedia:()=>({matches:false}),Blob,URL:TestURL,Date,Math:seededMath,crypto:require('node:crypto').webcrypto,isSecureContext:false};
 vm.createContext(context);for(const f of ['data/words.js','js/engine.js','js/sessions.js','js/storage.js','js/app.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f});
 const app=get('#app');
 const click=(action,data={})=>app.handlers.click({target:{closest:()=>({dataset:{action,...data}})}});
 const type=word=>{for(const c of word)app.handlers.click({target:{closest:()=>({dataset:{key:c}})}});};
 const enter=()=>app.handlers.click({target:{closest:()=>({dataset:{key:'Enter'}})}});
 const flush=()=>{for(let i=0;timers.size&&i<20;i++){const batch=[...timers.values()];timers.clear();batch.forEach(f=>f());}};
 return {context,store,downloads,click,type,enter,flush,html:()=>app.innerHTML,state:()=>JSON.parse(store.get('wordle-de:v2')),get,app};
}
module.exports=harness;
