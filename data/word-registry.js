/* Resolve the exact historical dictionary. Unknown versions never fall back. */
(function(root){
'use strict';
if(typeof require==='function'&&(!root.WORDS||!root.WORDS_DE_2)){require('./words-de-1.js');require('./words-de-2.js');}
const packages={'de-1':root.WORDS,'de-2':root.WORDS_DE_2},current='de-2';
function resolve(version,explicit){if(explicit?.version===version)return explicit;const words=packages[version];if(!words)throw Error('Unbekannte Wortversion; Originaldaten bleiben erhalten.');return words;}
const api={current,resolve,active:()=>resolve(current),daily:()=>resolve('de-1'),packages};root.WordRegistry=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
