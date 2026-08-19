(()=>{'use strict';
const $=id=>document.getElementById(id);
const btn=$('aiShare');
if(!btn)return;

function abilityToObject(x){
  if(Array.isArray(x))return {name:x[0]||'',owned:!!x[1],description:x[2]||''};
  return {name:x?.label||x?.name||'',owned:!!(x?.active??x?.owned),description:x?.description||''};
}

function buildAIData(){
  if(typeof draft==='undefined'||!draft)return null;
  return {
    format:'ironsworn-ai-character-v1',
    character:{
      id:draft.id||'',
      name:draft.name||'',
      stats:{...(draft.stats||{})},
      tracks:{...(draft.tracks||{})},
      vow:{...(draft.vow||{})},
      assets:(draft.assets||[]).map(a=>({
        id:a.assetId||a.id||'',
        name:a.name||'',
        type:a.type||'',
        summary:a.summary||'',
        abilities:(a.abilities||[]).map(abilityToObject)
      })),
      tattoos:{...(draft.tattoos||{})}
    }
  };
}

function resetModal(){
  $('slotArea').style.display='none';
  $('saveCurrent').style.display='none';
  $('loadGithub').style.display='none';
  $('exportSave').style.display='none';
  $('importSave').style.display='none';
  $('saveStatus').textContent='';
  $('characterList').style.display='block';
}

async function copyText(text,textarea,status){
  try{
    await navigator.clipboard.writeText(text);
    status.textContent='コピーしました。ChatGPTに貼り付ければ読めます。';
  }catch(e){
    textarea.focus();textarea.select();
    try{document.execCommand('copy');status.textContent='コピーしました。ChatGPTに貼り付ければ読めます。'}
    catch(err){status.textContent='自動コピーできませんでした。上の文字を長押ししてコピーしてください。'}
  }
}

btn.addEventListener('click',()=>{
  const data=buildAIData();if(!data)return;
  const text=JSON.stringify(data,null,2);
  resetModal();
  $('managerTitle').textContent='AIにキャラデータを渡す';
  $('managerNote').textContent='現在の画面のキャラクターデータです。コピーしてChatGPTに貼り付けてください。';
  const h=$('characterList');h.innerHTML='';
  const ta=document.createElement('textarea');
  ta.className='ai-share-text';ta.readOnly=true;ta.value=text;
  const actions=document.createElement('div');actions.className='ai-share-actions';
  const copy=document.createElement('button');copy.type='button';copy.className='save-action github';copy.textContent='コピー';
  const share=document.createElement('button');share.type='button';share.className='save-action';share.textContent='共有';
  const status=document.createElement('div');status.className='ai-share-status';
  copy.onclick=()=>copyText(text,ta,status);
  share.onclick=async()=>{
    if(navigator.share){
      try{await navigator.share({title:(draft?.name||'Ironsworn')+' キャラデータ',text});status.textContent='共有しました。'}catch(e){}
    }else{
      copyText(text,ta,status);
    }
  };
  actions.append(copy,share);h.append(ta,actions,status);
  $('managerModal').classList.add('open');
});
})();
