/* Optional local editorial feedback. Never changes word eligibility. */
(function(root){'use strict';
const V=root.WordRegistry||(typeof require==='function'?require('../data/word-registry.js'):null);
const reasons={unknown:'Wort unbekannt',form:'Ungewöhnliche Wortform',spelling:'Schreibweise prüfen',unsuitable:'Als Rätsel ungeeignet',other:'Sonstiges'};
const modes=['classic','random','daily','streak','double','tower','speedrun','theme','duel'];
function validate(reports){if(reports===undefined)return;if(!Array.isArray(reports)||reports.length>10000)throw Error('Ungültige Wortmeldungen.');const ids=new Set();for(const r of reports){if(!r||Object.keys(r).sort().join(',')!=='id,mode,note,reason,word,wordVersion'||typeof r.id!=='string'||!/^[a-zA-Z0-9_-]{1,128}$/.test(r.id)||ids.has(r.id)||!modes.includes(r.mode)||!Object.hasOwn(reasons,r.reason)||typeof r.note!=='string'||r.note.length>240||typeof r.word!=='string'||!V.resolve(r.wordVersion).accepted[Array.from(r.word).length]?.includes(r.word))throw Error('Ungültige Wortmeldung.');ids.add(r.id);}}
function add(state,report){const list=[...(state.wordReports||[]),report];validate(list);return {...state,wordReports:list};}
root.WordReports={reasons,validate,add};if(typeof module!=='undefined')module.exports=root.WordReports;
})(globalThis);
