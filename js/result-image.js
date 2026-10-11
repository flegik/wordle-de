/* Offline Canvas PNG, ready before file sharing to preserve user activation. */
(function(root){
'use strict';
const colors=['#52615c','#b78c32','#389b68'];
function draw(model,{spoiler=false,index=0,canvas=root.document.createElement('canvas')}={}){
 const boards=root.WordleResults.selected(model,index),tile=76,gap=10,width=900;
 const spacing=spoiler?170:130;const height=380+boards.reduce((h,b)=>h+spacing+Math.max(1,b.guesses.length)*(tile+gap),0);
 canvas.width=width;canvas.height=height;const c=canvas.getContext('2d');if(!c)throw Error('Dein Browser kann kein Ergebnisbild erzeugen.');
 function box(x,y,w,h,color,r=18){c.fillStyle=color;c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();c.fill();}
 function text(value,x,y,size=28,color='#edf8f1',align='left'){c.font=`600 ${size}px sans-serif`;c.fillStyle=color;c.textAlign=align;c.fillText(String(value),x,y,width-104);}
 c.fillStyle='#081b16';c.fillRect(0,0,width,height);box(36,32,width-72,6,'#58d68a',3);
 text('WORDLE DE 2.0',52,100,42,'#7ee3a2');text(model.title,52,150,26);
 text(model.status==='won'?'GESCHAFFT!':model.status==='completed'?'RUN ABGESCHLOSSEN':model.status==='abandoned'?'RUN ABGEBROCHEN':'NEUER VERSUCH, NEUES GLÜCK',52,200,30);
 text(model.summary,52,246,30);if(model.detail)text(model.detail,52,284,22,'#b2c7bd');
 let y=326;
 for(const b of boards){box(36,y,width-72,spacing-22+Math.max(1,b.guesses.length)*(tile+gap),'#122b23');text(`${b.title} · ${b.length} Buchstaben · ${b.guesses.length} Tipps${b.status==='won'?' · GELÖST':''}`,58,y+42,24);
 if(spoiler)text('Lösung: '+b.target,58,y+80,26,'#7ee3a2');
 let rowY=y+(spoiler?110:70);const x=(width-(b.length*(tile+gap)-gap))/2;
 if(!b.guesses.length)text('Keine Tipps abgegeben',width/2,rowY+48,24,'#b2c7bd','center');
 for(let j=0;j<b.guesses.length;j++){const letters=Array.from(b.guesses[j]);for(let i=0;i<b.length;i++){box(x+i*(tile+gap),rowY,tile,tile,colors[b.evaluations[j][i]],10);if(spoiler)text(letters[i],x+i*(tile+gap)+tile/2,rowY+51,40,'#ffffff','center');}rowY+=tile+gap;}
 y+=spacing+Math.max(1,b.guesses.length)*(tile+gap);
 }
 text(spoiler?'ENTHÄLT DIE LÖSUNG / SPOILER':'DEIN WORTMOMENT · OHNE LÖSUNG',width/2,height-24,18,spoiler?'#f4ca73':'#b2c7bd','center');return canvas;
}
function create(model,options){const c=draw(model,options);return new Promise((resolve,reject)=>c.toBlob(b=>b&&b.type==='image/png'?resolve(b):reject(Error('PNG konnte nicht erstellt werden.')),'image/png'));}
function canShare(file,navigator=root.navigator){try{return typeof navigator?.share==='function'&&typeof navigator.canShare==='function'&&navigator.canShare({files:[file]});}catch{return false;}}
root.WordleResultImage={draw,create,canShare};if(typeof module!=='undefined')module.exports=root.WordleResultImage;
})(globalThis);
