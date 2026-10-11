/* Exact source snapshots and conservative conflict detection; never last-write-wins. */
(function(root){
'use strict';
const E=root.Engine||(typeof require==='function'?require('./engine.js'):null),V=root.WordRegistry||(typeof require==='function'?require('../data/word-registry.js'):null);
const clone=v=>JSON.parse(JSON.stringify(v)),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// Exact raw source, rather than a collision-prone digest. It remains local and in backups.
function validate(state){if(state.legacySource!==undefined&&state.legacySource!==null){if(typeof state.legacySource!=='string'||state.legacySource.length>20*1024*1024)throw Error('Ungültige alte Speicherquelle.');const s=JSON.parse(state.legacySource);if(!E.validate(s,V.daily())||s.schema!==1)throw Error('Ungültiger alter Speichervertrag.');}}
function covered(state,old){if(old.events.some(e=>!state.events.some(n=>same(e,n))))return false;if(Object.entries(old.daily).some(([d,id])=>state.daily[d]!==id))return false;for(const [key,g] of Object.entries(old.games)){const own=state.games[key];if(own?.id===g.id){if(!same(own,g)&&!state.events.some(e=>e.id===g.id))return false;}else if(!state.events.some(e=>e.id===g.id))return false;}return true;}
function checkpoint(state,raw){return {...state,legacySource:raw};}
function guardLegacy(state,raw){if(state.legacySource!==undefined&&state.legacySource!==raw)throw Error('Ältere PWA hat Daten geändert. Beide Stände sichern und Konflikt auflösen.');}
function guardWrite(actual,expected){if(expected!==undefined&&actual!==expected)throw Error('Anderer Tab hat den Spielstand geändert. Beide Stände sichern.');}
function mergeLegacy(state,old){
 // Only unambiguous additive history is eligible; divergent drafts/settings/bags are conflicts.
 const next=clone(state),newEvents=old.events.filter(e=>!state.events.some(n=>n.id===e.id));
 for(const e of old.events){const existing=state.events.find(n=>n.id===e.id);if(existing&&!same(existing,e))throw Error('Gleiche Ergebnis-ID mit anderem Inhalt.');}
 const last=state.events.reduce((d,e)=>e.date>d?e.date:d,'');if(newEvents.some(e=>e.date<=last))throw Error('Ereignisreihenfolge nicht eindeutig rekonstruierbar.');
 for(const [d,id] of Object.entries(old.daily))if(next.daily[d]&&next.daily[d]!==id)throw Error('Konkurrierendes Tagesergebnis.');
 if(!same(state.settings,old.settings))throw Error('Einstellungen unterscheiden sich.');
 for(const [k,g] of Object.entries(old.games)){const own=next.games[k];if(own?.id===g.id&&!same(own,g))throw Error('Runde wurde auf beiden Seiten geändert.');if(own?.status==='playing'&&own.id!==g.id)throw Error('Zwei aktive Runden im selben Modus.');if(!own||own.status!=='playing')next.games[k]=clone(g);}
 // The v1 bag and the weighted v2 bag represent different histories; never replace either blindly.
 if(!same(state.bags,old.bags)||!same(state.last,old.last))throw Error('Wortbeutel unterscheiden sich; manuelle Auflösung erforderlich.');
 next.events.push(...clone(newEvents));Object.assign(next.daily,old.daily);const streak=E.summary(next.events.filter(e=>e.mode==='streak'));next.streak={current:streak.current,best:streak.best};return next;
}
root.WordleSync={validate,covered,checkpoint,guardLegacy,guardWrite,mergeLegacy};if(typeof module!=='undefined')module.exports=root.WordleSync;
})(globalThis);
