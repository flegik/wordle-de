/* Authentic result projections. Never infer missing historical attempts. */
(function(root){
'use strict';
const E=root.Engine||(typeof require==='function'?require('./engine.js'):null),G=root.Sessions||(typeof require==='function'?require('./sessions.js'):null);
const titles={classic:'KLASSISCH',random:'ZUFALL',daily:'TAGESRÄTSEL',streak:'STREAK',double:'DOPPELTES WORDLE',tower:'WORDLE TOWER',speedrun:'SPEEDRUN',theme:'THEMEN-WORDLE',duel:'WORT-DUELL'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function model(s,context){
 const session=Array.isArray(s.rounds),mode=s.mode;
 let boards=session?s.rounds.map(r=>G.roundView(s,r.id)):[{...s,evaluations:s.guesses.map(w=>E.evaluate(w,s.target))}];
 let summary=session?`${s.attempts.length} Versuche`:`${s.guesses.length}/${s.length<6?6:7} Versuche · ${s.length} Buchstaben`,detail='';
 if(mode==='double')summary=`${s.attempts.length}/${s.attemptBudget} gemeinsame Versuche · ${s.rounds[0].length} Buchstaben`;
 if(mode==='tower'){const p=root.WordleTower.progress(s);boards=boards.slice(0,p.reached);summary=`${p.solved}/4 Etagen · ${p.used}/20 Versuche`;detail=`${p.remaining} Versuche übrig`;}
 if(mode==='speedrun'){const m=root.WordleSpeedrun.metrics(s);boards=m.rounds;summary=`${m.score.toLocaleString('de-DE')} Punkte · ${m.solved} Wörter gelöst`;detail=`${m.attempts} Tipps · ${m.skipped} übersprungen`;}
 if(mode==='theme'){detail=s.categoryId||'';if(s.themeVersion)detail=root.WordleTheme.category(s.themeVersion,s.categoryId,root.WordRegistry.resolve(s.wordVersion)).name||detail;}
 if(mode==='streak'&&context){const end=context.events.findIndex(e=>e.id===s.id);detail='Serie '+E.summary(context.events.slice(0,end+1).filter(e=>e.mode==='streak')).current;}
 if(mode==='speedrun'&&context)detail+=' · Highscore '+(root.WordleSpeedrun.summary(context.sessionEvents).highscore??0).toLocaleString('de-DE');
 if(mode==='duel')detail=s.challengeId?'Challenge '+s.challengeId:'';
 if(mode==='daily')detail=s.date+' · UTC';
 boards=boards.map((b,i)=>({...b,title:mode==='tower'?'Etage '+(i+1):mode==='double'?'Wort '+String.fromCharCode(65+i):mode==='speedrun'?'Wort '+(i+1):'Dein Wortraster'}));
 return {id:s.id,mode,title:titles[mode],status:s.status,summary,detail,boards};
}
function selected(m,index){return m.mode==='speedrun'?[m.boards[Math.min(Math.max(0,index),m.boards.length-1)]]:m.boards;}
function html(m,index=0){const names=['absent','present','correct'],labels=['grau','gelb','grün'];return `<section class="panel played-result"><h3>Dein gespieltes Rätsel</h3>${m.mode==='speedrun'?`<label>Wort ansehen<select id="result-round">${m.boards.map((b,i)=>`<option value="${i}" ${i===index?'selected':''}>Wort ${i+1} · ${b.status==='won'?'gelöst':b.status==='skipped'?'übersprungen':b.status==='lost'?'verloren':'offen'} · ${b.guesses.length} Tipps</option>`).join('')}</select></label>`:''}<div class="result-boards">${selected(m,index).map(b=>`<section class="result-board"><div class="compare"><strong>${esc(b.title)}</strong><small>${b.status==='won'?'✓ Gelöst':b.status==='skipped'?'Übersprungen':'Nicht gelöst'} · ${b.guesses.length} Tipps</small></div><div class="result-grid" style="--n:${b.length}" role="group" aria-label="${esc(b.title)}, tatsächlich abgegebene Tipps">${b.guesses.length?b.guesses.map((w,j)=>`<div class="row">${E.letters(w).map((c,k)=>`<span class="tile ${names[b.evaluations[j][k]]}" aria-label="${esc(c)}, ${labels[b.evaluations[j][k]]}">${esc(c)}</span>`).join('')}</div>`).join(''):'<p class="mini">Keine Tipps abgegeben.</p>'}</div></section>`).join('')}</div><button class="secondary" data-action="result-image">▧ Als Bild teilen</button><p class="mini">Das Bild bleibt ohne Buchstaben und Lösungen, solange du die Spoiler-Option nicht aktivierst.</p></section>`;}
root.WordleResults={model,html,selected};if(typeof module!=='undefined')module.exports=root.WordleResults;
})(globalThis);
