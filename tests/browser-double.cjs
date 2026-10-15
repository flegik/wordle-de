/* Optional real-browser checks. Requires Playwright + Chromium, development only.
   Run: node tests/browser-double.cjs. No server/deployment on the live origin. */
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const uri=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(!uri.startsWith('/wordle-de/')){res.writeHead(404);res.end();return;}
 const file=path.resolve(root,uri.slice('/wordle-de/'.length)||'index.html');
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data);});
});
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}/wordle-de/`;
  for(const width of [320,360,390,430,1000]){
   const context=await browser.newContext({viewport:{width,height:width===320?568:800},hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url);await page.locator('[data-mode="double"]').tap();await page.locator('#close-info').tap();
   await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem(WordleStorage.KEY));s.settings.reduced=true;s.settings.hard=true;const d=Object.values(s.sessions)[0];d.rounds[0].target='LEGAT';d.rounds[1].target='SEGEL';localStorage.setItem(WordleStorage.KEY,JSON.stringify(s));});
   await page.reload();await page.locator('[data-mode="double"]').tap();
   assert.equal(await page.locator('.double-puzzle:visible').count(),width>=800?2:1);
   await page.locator('[data-id="b"]').tap();assert.equal(await page.locator('.double-card.selected').getAttribute('data-id'),'b');
   for(const c of 'LEGAT')await page.locator(`[data-key="${c}"]`).tap();await page.locator('[data-key="Enter"]').tap();
   await page.waitForFunction(()=>Object.values(JSON.parse(localStorage.getItem('wordle-de:v2')).sessions)[0].attempts.length===1);
   await page.waitForFunction(()=>document.querySelector('[data-id="b"]').getAttribute('aria-pressed')==='true');
   // Wait for the input controller to unlock using its reduced-motion delay.
   await page.waitForTimeout(180);await page.keyboard.type('SEGEL');await page.keyboard.press('Enter');
   await page.locator('.double-victory').waitFor();
   const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('wordle-de:v2')));assert.equal(s.sessionEvents.length,1);assert.equal(s.events.length,0);assert(s.settings.hard);assert.equal(s.sessionEvents[0].attempts,2);
   await page.locator('[data-action="next"]').tap();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow at '+width);
   const boxes=await page.locator('.double-card').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));assert(boxes.every(h=>h>=44));
   assert.deepEqual(errors,[]);console.log(`✓ Real Chromium: ${width}px, touch, keyboard, layout, two-board win`);
   await context.close();
  }
  const context=await browser.newContext(),page=await context.newPage();await page.goto(url);
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await context.setOffline(true);await page.reload();await page.locator('[data-mode="double"]').click();await page.locator('#close-info').click();assert.equal(await page.locator('.double-card').count(),2);console.log('✓ Real Chromium: nested-path offline reload loads all double assets');
  await context.close();
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.listening?server.close(resolve):resolve());}
})().catch(e=>{console.error(e);process.exitCode=1;});
