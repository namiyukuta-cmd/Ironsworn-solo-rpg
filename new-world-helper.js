(()=>{'use strict';
const card=document.getElementById('newCard');
const next=document.getElementById('nextBtn');
if(!card||!next)return;
const originalNext=next.onclick;
function isWorldStep(){return document.getElementById('stepLabel')?.textContent.trim()==='3 / 8'}
function softenWorldStep(){
  if(!isWorldStep())return;
  const help=card.querySelector('.help');
  if(help)help.textContent='ここは今わからなくて大丈夫です。決めたい項目だけ入力し、空欄のまま「次へ」で進めます。';
  card.querySelectorAll('.field>span').forEach(span=>{
    const t=span.textContent.trim();
    if(t==='世界名')span.textContent='世界名（分かれば）';
    if(t==='世界の基本設定')span.textContent='世界の基本設定（分かれば）';
    if(t==='物語の開始地点')span.textContent='物語の開始地点（分かれば）';
  });
}
next.onclick=async function(e){
  if(isWorldStep()){
    const worldName=document.getElementById('worldName');
    const startLocation=document.getElementById('startLocation');
    if(worldName&&!worldName.value.trim())worldName.value='未設定';
    if(startLocation&&!startLocation.value.trim())startLocation.value='未設定';
    const err=document.getElementById('newError');if(err)err.textContent='';
  }
  return originalNext?.call(this,e);
};
new MutationObserver(softenWorldStep).observe(card,{childList:true,subtree:true});
softenWorldStep();
})();
