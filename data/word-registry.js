/* Resolve the exact historical dictionary. Unknown versions never fall back. */
(function(root){
'use strict';
if(typeof require==='function'&&(!root.WORDS||!root.WORDS_DE_2||!root.WORDS_DE_21||!root.WORDS_DE_22||!root.WORDS_DE_23)){require('./words-de-1.js');require('./words-de-2.js');require('./words-de-2.1.js');require('./words-de-2.2.js');require('./words-de-2.3.js');}
const A=root.AcceptedAdditions||(typeof require==='function'?require('./accepted-additions.js'):null);
const packages={'de-1':root.WORDS,'de-2':root.WORDS_DE_2,'de-2.1':root.WORDS_DE_21,'de-2.2':root.WORDS_DE_22,'de-2.3':root.WORDS_DE_23},current='de-2.3';
function resolve(version,explicit){if(explicit?.version===version)return A.apply(explicit);const words=packages[version];if(!words)throw Error('Unbekannte Wortversion; Originaldaten bleiben erhalten.');return A.apply(words);}
const api={current,resolve,active:()=>resolve(current),daily:()=>resolve('de-1'),packages};root.WordRegistry=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
