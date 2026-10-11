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
  for(const width of [320,360,390,430,1000]){
   const context=await browser.newContext({viewport:{width,height:width===320?568:width===360?640:800},hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
   await page.locator('[data-mode="tower"]').tap();await page.locator('[data-action="tower-launch"]').tap();
   await page.evaluate(()=>{const state=JSON.parse(localStorage.getItem(WordleStorage.KEY));state.settings.reduced=true;state.settings.hard=true;const session=Object.values(state.sessions).find(s=>s.mode==='tower');['AUTO','LEGAT','STRAẞE','FENSTER'].forEach((w,i)=>session.rounds[i].target=w);for(const word of WORDS.accepted[4].filter(w=>w!=='AUTO').slice(0,8))state.sessions[session.id]=WordleTower.submit(state.sessions[session.id],word,Date.now(),WORDS);localStorage.setItem(WordleStorage.KEY,JSON.stringify(state));});
   await page.reload();await page.locator('[data-mode="tower"]').tap();await page.locator('[data-action="tower-launch"]').tap();
   const geometry=await page.evaluate(()=>{const area=document.querySelector('.tower-history').getBoundingClientRect(),row=document.querySelector('[data-current-row]').getBoundingClientRect(),keys=document.querySelector('.keyboard').getBoundingClientRect();return {areaTop:area.top,areaBottom:area.bottom,rowTop:row.top,rowBottom:row.bottom,keysBottom:keys.bottom,scroll:document.documentElement.scrollWidth,width:innerWidth,height:innerHeight};});
   assert(geometry.rowTop>=geometry.areaTop-1&&geometry.rowBottom<=geometry.areaBottom+1,'Current row must be visible at '+width);
   assert(geometry.keysBottom<=geometry.height+1,'Keyboard must fit at '+width);assert(geometry.scroll<=width,'Horizontal overflow at '+width);
   await page.locator('.tower-history').evaluate(el=>el.scrollTop=0);await page.locator('[data-action="tower-current"]').tap();
   for(const c of 'AUTO')await page.locator(`[data-key="${c}"]`).tap();await page.locator('[data-key="Enter"]').tap();
   await page.locator('[data-action="tower-advance"]').waitFor();await page.reload();await page.locator('[data-mode="tower"]').tap();await page.locator('[data-action="tower-launch"]').tap();assert((await page.locator('h1').textContent()).includes('Etage 1 geschafft'));
   for(const word of ['LEGAT','STRAẞE','FENSTER']){await page.locator('[data-action="tower-advance"]').tap();for(const c of word)await page.keyboard.press(c);await page.keyboard.press('Enter');if(word==='FENSTER')await page.locator('.tower-victory').waitFor();else await page.locator('[data-action="tower-advance"]').waitFor();}
   const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('wordle-de:v2')));assert.equal(state.sessionEvents.length,1);assert.equal(state.sessionEvents[0].attempts,12);assert.equal(state.events.length,0);assert(state.settings.hard);assert.deepEqual(errors,[]);console.log(`✓ Chromium ${width}px: long history, current row, touch, keyboard, reload, full ascent`);await context.close();
  }
  const context=await browser.newContext(),page=await context.newPage();await page.goto(url);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);await page.reload();await page.locator('[data-mode="tower"]').click();await page.locator('[data-action="tower-launch"]').click();await page.locator('.tower-history').waitFor();console.log('✓ Chromium: offline nested-path Tower bootstrap');await context.close();
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.listening?server.close(resolve):resolve());}
})().catch(e=>{console.error(e);process.exitCode=1;});
