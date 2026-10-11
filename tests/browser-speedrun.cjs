/* Optional browser QA. Playwright/Chromium are development tools, not app dependencies.
   Starts its own isolated localhost server; never touches the deployed origin. */
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webmanifest':'application/manifest+json','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const uri=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(!uri.startsWith('/wordle-de/')){res.writeHead(404);res.end();return;}
 const file=path.resolve(root,uri.slice('/wordle-de/'.length)||'index.html');
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(err?'':data);});
});
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}/wordle-de/`;
  for(const [width,height] of [[320,568],[360,640],[390,844],[430,932],[1000,800],[640,360]]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.evaluate(()=>Math.random=()=>.1);
   await page.locator('[data-mode="speedrun"]').tap();await page.locator('[data-action="speedrun-launch"]').tap();
   // Pause via UI; seed a long active 7-letter history using the real rule module.
   await page.locator('[data-action="game-menu"]').tap();
   await page.evaluate(()=>{const state=JSON.parse(localStorage.getItem(WordleStorage.KEY)),id=Object.values(state.sessions).find(s=>s.mode==='speedrun').id;
    let s=WordleSpeedrun.create({id,started:Date.now(),length:7,target:'FENSTER'},WORDS);
    for(const [i,word] of WORDS.accepted[7].filter(w=>w!=='FENSTER').slice(0,6).entries())s=WordleSpeedrun.submit(s,word,i+1,Date.now(),WORDS,()=>({length:4,target:'AUTO'}));
    state.sessions[id]=s;state.settings.reduced=true;state.settings.hard=true;localStorage.setItem(WordleStorage.KEY,JSON.stringify(state));});
   await page.reload();await page.evaluate(()=>Math.random=()=>.1);await page.locator('[data-mode="speedrun"]').tap();await page.locator('[data-action="speedrun-launch"]').tap();
   const geometry=await page.evaluate(()=>{const area=document.querySelector('.speed-board-wrap').getBoundingClientRect(),row=document.querySelector('[data-speed-current]').getBoundingClientRect(),keys=document.querySelector('.keyboard').getBoundingClientRect(),timer=document.querySelector('.speed-hud').getBoundingClientRect();return {areaTop:area.top,areaBottom:area.bottom,rowTop:row.top,rowBottom:row.bottom,keysBottom:keys.bottom,timerTop:timer.top,scroll:document.documentElement.scrollWidth};});
   assert(geometry.rowTop>=geometry.areaTop-1&&geometry.rowBottom<=geometry.areaBottom+1,'Current row not visible at '+width+'x'+height);
   assert(geometry.keysBottom<=height+1,'Keyboard must fit');assert(geometry.scroll<=width,'Horizontal overflow');assert(geometry.timerTop>=0,'Timer must fit');
   for(const c of 'FENSTER')await page.locator(`[data-key="${c}"]`).tap();await page.locator('[data-key="Enter"]').tap();
   await page.waitForFunction(()=>document.querySelector('.game-top small')?.textContent.includes('4 Buchstaben'));
   const nextTarget=await page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('wordle-de:v2')).sessions).find(s=>s.mode==='speedrun').rounds.at(-1).target);for(const c of nextTarget)await page.keyboard.press(c);await page.keyboard.press('Enter');
   await page.waitForFunction(()=>WordleSpeedrun.metrics(Object.values(JSON.parse(localStorage.getItem('wordle-de:v2')).sessions).find(s=>s.mode==='speedrun')).solved===2);
   await page.locator('[data-action="game-menu"]').tap();let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('wordle-de:v2')));const s=Object.values(state.sessions).find(s=>s.mode==='speedrun');assert.equal(WordScore(s),350);assert(state.settings.hard);assert.equal(state.events.length,0);
   await page.reload();await page.evaluate(()=>Math.random=()=>.1);await page.locator('[data-mode="speedrun"]').tap();await page.locator('[data-action="speedrun-launch"]').tap();
   await page.locator('[data-action="game-menu"]').tap();await page.locator('[data-action="speedrun-abandon"]').tap();await page.locator('#confirm-action').tap();await page.locator('.speed-score').waitFor();
   state=await page.evaluate(()=>JSON.parse(localStorage.getItem('wordle-de:v2')));assert.equal(state.sessionEvents.length,1);assert.equal(state.sessionEvents[0].score,350);assert.deepEqual(errors,[]);
   console.log(`✓ Chromium ${width}x${height}: geometry, last row, touch, hardware input, automatic next word, reload, abort`);await context.close();
  }
  const context=await browser.newContext(),page=await context.newPage();await page.goto(url);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);await page.reload();await page.locator('[data-mode="speedrun"]').click();await page.locator('[data-action="speedrun-launch"]').click();await page.locator('.speed-hud').waitFor();console.log('✓ Chromium: offline nested-path Speedrun bootstrap');await context.close();
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.listening?server.close(resolve):resolve());}
})().catch(e=>{console.error(e);process.exitCode=1;});
function WordScore(s){return s.roundEnds.filter(e=>e.reason==='won').reduce((sum,e)=>sum+({4:100,5:150,6:200,7:250})[s.rounds.find(r=>r.id===e.roundId).length],0);}
