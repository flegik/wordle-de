/* Increment CACHE when changing the shipped offline assets. */
const ROOT=new URL('./',self.location.href);
const PREFIX='wordle-de-offline:'+ROOT.pathname+':';
const CACHE=PREFIX+'v1';
const ASSETS=['./','index.html','style.css','js/engine.js','js/sessions.js','js/double.js','js/double-ui.js','js/tower.js','js/tower-ui.js','js/speedrun.js','js/speedrun-ui.js','data/themes.js','js/theme.js','js/theme-ui.js','js/storage.js','js/app.js','data/words.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png'].map(p=>new URL(p,ROOT).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==ROOT.origin)return;event.respondWith(caches.open(CACHE).then(async cache=>{const hit=await cache.match(event.request);if(hit)return hit;try{return await fetch(event.request);}catch(err){if(event.request.mode==='navigate'){const fallback=await cache.match(new URL('index.html',ROOT).href);if(fallback)return fallback;}throw err;}}));});
