/* Additive guess compatibility only: never mutate frozen targets or package files. */
(function(root){
'use strict';
const additions=Object.freeze(['NUTZUNG','VORWAHL','SÜDPOL']),cache=new WeakMap();
function apply(words){if(cache.has(words))return cache.get(words);const accepted={...words.accepted};for(const word of additions){const n=Array.from(word).length;if(accepted[n]&&!accepted[n].includes(word))accepted[n]=[...accepted[n],word];}const view={...words,accepted};cache.set(words,view);cache.set(view,view);return view;}
const api={version:1,additions,apply};root.AcceptedAdditions=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
