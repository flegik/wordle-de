/* Allowlisted runtime assets only; no tokens, source databases or local state. */
const fs=require('node:fs'),path=require('node:path');
const production=process.argv.includes('--production');
const root=path.resolve(__dirname,'..'),out=path.join(root,'online/site');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8'),list=sw.match(/const ASSETS=\[(.*?)\]\.map/s)[1];
for(const m of list.matchAll(/'([^']+)'/g)){
 const file=m[1]==='./'?'index.html':m[1];
 if(file.includes('..')||path.isAbsolute(file))throw Error('Unexpected offline asset');
 const dest=path.join(out,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,file),dest);
}
fs.copyFileSync(path.join(root,'sw.js'),path.join(out,'sw.js'));
fs.writeFileSync(path.join(out,'js/online-config.js'),"/* Same-origin Worker API. */\nglobalThis.WORDLE_ONLINE_API = location.origin;\nglobalThis.WORDLE_TEST_VERSION = "+(!production)+";\n");
fs.writeFileSync(path.join(out,'_headers'),"/*\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'\n");
console.log((production?'Production':'Isolated test')+' PWA packaged from the complete offline allowlist.');
