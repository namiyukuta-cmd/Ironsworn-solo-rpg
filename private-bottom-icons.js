(()=>{'use strict';
const KEY='ironsworn-private-loaded-save-v1';
const $=id=>document.getElementById(id);
function read(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){return null}}
function write(save){if(!save?.character)return;save.character.updatedAt=new Date().toISOString();sessionStorage.setItem(KEY,JSON.stringify(save));window.dispatchEvent(new CustomEvent('ironsworn:statechange'))}
function loadNote(){const save=read(),ta=$('privateFreeNote');if(!save?.character||!ta)return;ta.value=String(save.character.freeNote||'')}
function openNote(){
 document.querySelectorAll('[data-panel]').forEach(p=>p.classList.toggle('on',p.dataset.panel==='note'));
 document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab==='note'));
 if($('stageKicker'))$('stageKicker').textContent='NOTE';
 if($('stageTitle'))$('stageTitle').textContent='自由入力';
 loadNote();
 setTimeout(()=>$('privateFreeNote')?.focus(),0)
}
const noteBtn=document.querySelector('[data-tab="note"]');
if(noteBtn)noteBtn.onclick=openNote;
const ta=$('privateFreeNote');
if(ta){
 loadNote();
 ta.addEventListener('input',()=>{
  const save=read();if(!save?.character)return;
  save.character.freeNote=ta.value;
  save.character.updatedAt=new Date().toISOString();
  sessionStorage.setItem(KEY,JSON.stringify(save));
 })
}
setTimeout(()=>{
 const q=document.querySelector('[data-tab="quest"]');
 if(q)q.click()
},0);
})();
