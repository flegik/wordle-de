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
  browser=await chromium.launch({headless:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}/wordle-de/`;
  for(const [width,height] of [[320,568],[360,640],[390,844],[430,932],[1000,800],[640,360]]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
   await page.locator('[data-mode="theme"]').tap();await page.locator('[data-action="theme-category"][data-id="nature"]').tap();await page.locator('[data-action="theme-length"][data-n="6"]').tap();await page.locator('[data-action="theme-launch"]').tap();
   const target=await page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('wordle-de:v2')).sessions).find(s=>s.mode==='theme').rounds[0].target);
   for(const c of 'LEGAT')await page.keyboard.press(c);await page.keyboard.press('Backspace');await page.reload();await page.locator('[data-mode="theme"]').tap();await page.locator('[data-action="theme-resume"]').tap();
   for(let i=0;i<4;i++)await page.keyboard.press('Backspace');
   const geometry=await page.evaluate(()=>{const keys=document.querySelector('.keyboard').getBoundingClientRect(),head=document.querySelector('.theme-game header').getBoundingClientRect();return {keysBottom:keys.bottom,headTop:head.top,width:document.documentElement.scrollWidth};});assert(geometry.keysBottom<=height+1);assert(geometry.headTop>=0);assert(geometry.width<=width);
   for(const c of target)await page.locator(`[data-key="${c}"]`).tap();await page.locator('[data-key="Enter"]').tap();await page.locator('[data-action="theme-choose"]').waitFor();
   let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('wordle-de:v2')));assert.equal(state.sessionEvents.length,1);assert.equal(state.sessionEvents[0].categoryId,'nature');assert.equal(state.events.length,0);await page.locator('[data-action="next"]').tap();state=await page.evaluate(()=>JSON.parse(localStorage.getItem('wordle-de:v2')));const current=Object.values(state.sessions).find(s=>s.mode==='theme'&&s.status==='playing');assert.equal(current.categoryId,'nature');assert.equal(current.rounds[0].length,6);assert.notEqual(current.rounds[0].target,target);assert.deepEqual(errors,[]);console.log(`✓ Chromium ${width}x${height}: categories, touch, keyboard, reload, layout, win, next word`);await context.close();
  }
  const context=await browser.newContext(),page=await context.newPage();await page.goto(url);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);await page.reload();await page.locator('[data-mode="theme"]').click();await page.locator('[data-action="theme-launch"]').click();await page.locator('.theme-game').waitFor();console.log('✓ Chromium: offline theme data and game under nested path');await context.close();
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.listening?server.close(resolve):resolve());}
})().catch(e=>{console.error(e);process.exitCode=1;});
