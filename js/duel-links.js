/* Bounded, canonical challenge codec. Encoding/checksum is NOT encryption. */
(function(root){
'use strict';
const E=root.Engine||(typeof require==='function'?require('./engine.js'):null);
const MESSAGE='Diese Herausforderung ist ungültig oder wird von deiner Spielversion nicht unterstützt.';
const keys=['version','type','id','length','word','wordVersion','rules'];
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
function fail(){throw Error(MESSAGE);}
function exact(v,names){if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==names.length||names.some(k=>!Object.hasOwn(v,k)))fail();}
function validId(id){return typeof id==='string'&&uuid.test(id);}
function limit(n){return n<6?6:7;}
function checksum(text){let n=2166136261;for(const c of text){n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;}return n.toString(16).padStart(8,'0');}
function validate(c,words){exact(c,keys);if(c.version!==1||!['random','wish'].includes(c.type)||typeof c.id!=='string'||!uuid.test(c.id)||![4,5,6,7].includes(c.length)||typeof c.word!=='string'||c.word!==E.normalize(c.word)||!/^[A-ZÄÖÜẞ]{4,7}$/u.test(c.word)||E.letters(c.word).length!==c.length||c.wordVersion!==words.version||c.rules!=='normal-1'||!(c.type==='random'?words.solutions:words.accepted)[c.length].includes(c.word))fail();return c;}
function canonical(c){return JSON.stringify(Object.fromEntries(keys.map(k=>[k,c[k]])));}
function encode(text){return btoa(unescape(encodeURIComponent(text))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function decode(text){if(!/^[A-Za-z0-9_-]+$/.test(text)||text.length>1400||text.length%4===1)fail();try{const raw=decodeURIComponent(escape(atob(text.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-text.length%4)%4))));if(encode(raw)!==text||raw.length>1024)fail();return raw;}catch{fail();}}
function pack(text){return encode(text)+'.'+checksum(text);}
function unpack(text){if(typeof text!=='string'||text.length>1500)fail();const parts=text.split('.');if(parts.length!==2||!/^[0-9a-f]{8}$/.test(parts[1]))fail();const raw=decode(parts[0]);if(checksum(raw)!==parts[1])fail();return raw;}
function fragment(c,words){validate(c,words);return '#duel=v1.'+pack(canonical(c));}
function parse(hash,words){if(typeof hash!=='string'||hash.length>1530||!hash.startsWith('#duel=v1.'))fail();try{const raw=unpack(hash.slice(9)),c=validate(JSON.parse(raw),words);if(raw!==canonical(c))fail();return c;}catch{fail();}}
function link(c,href,words){const url=new URL(href);url.search='';url.hash=fragment(c,words);return url.href;}
function newId(crypto=root.crypto){if(crypto?.randomUUID)return crypto.randomUUID();if(!crypto?.getRandomValues)throw Error('Für sichere eindeutige IDs wird Web Crypto benötigt.');const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const h=Array.from(b,n=>n.toString(16).padStart(2,'0')).join('');return [h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20)].join('-');}
function wordError(raw,words){if(typeof raw!=='string'||raw.length>32)return 'Bitte ein deutsches Wort eingeben.';const w=E.normalize(raw),n=E.letters(w).length;if(!/^[A-ZÄÖÜẞ]*$/u.test(w))return 'Nur deutsche Buchstaben, keine Leer- oder Sonderzeichen.';if(n<4||n>7)return 'Bitte 4–7 Buchstaben eingeben.';if(!words.accepted[n].includes(w))return 'Dieses Wort steht nicht im Eingabewörterbuch.';return null;}
function create(type,word,words,id=newId()){const w=E.normalize(word);return validate({version:1,type,id,length:E.letters(w).length,word:w,wordVersion:words.version,rules:'normal-1'},words);}
const api={MESSAGE,validId,limit,checksum,validate,canonical,fragment,parse,link,newId,wordError,create,pack,unpack};root.DuelLinks=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
