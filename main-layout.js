(()=>{'use strict';
const $=id=>document.getElementById(id);const esc=s=>String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function persist(){if(typeof writeDraft==='function')writeDraft()}
function renderExtra(){if(typeof draft==='undefined'||!draft)return;
  const setup=draft.setup||{},profile=draft.profile||{};
  $('selfContent').innerHTML='<dl class="profile-grid"><dt>人物像</dt><dd>'+esc(profile.concept||setup.concept||'未設定')+'</dd><dt>開始地点</dt><dd>'+esc(setup.startLocation||'未設定')+'</dd><dt>背景の誓い</dt><dd>'+esc(draft.backgroundVow?.title||setup.backgroundVow||'未設定')+'</dd><dt>絆</dt><dd>'+esc((draft.bonds||[]).map(x=>x.name||x).join('、')||'未設定')+'</dd></dl>';
  $('equipmentText').value=draft.equipment||'';
  $('inventoryList').innerHTML=(draft.inventory||[]).length?(draft.inventory||[]).map((x,i)=>'<div class="list-row"><span>'+esc(x.name||x)+'</span><button data-remove-item="'+i+'">削除</button></div>').join(''):'<p>所持品はまだありません。</p>';
  $('questList').innerHTML=[draft.backgroundVow,draft.vow,...(draft.quests||[])].filter(x=>x&&x.title).map(q=>'<article class="quest-card"><strong>'+esc(q.title)+'</strong><small>'+(esc(q.rank||'Dangerous'))+' / '+esc(q.status||'active')+'</small></article>').join('')||'<p>クエストはまだありません。</p>';
  $('logList').innerHTML=(draft.log||[]).slice().reverse().map(x=>'<div class="log-entry"><time>'+new Date(x.at).toLocaleString('ja-JP')+'</time>'+esc(x.text)+'</div>').join('');
  document.querySelectorAll('[data-remove-item]').forEach(b=>b.onclick=()=>{draft.inventory.splice(Number(b.dataset.removeItem),1);persist();renderExtra()});
}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('[data-panel]').forEach(x=>x.classList.toggle('on',x.dataset.panel===b.dataset.tab));renderExtra()});
$('saveEquipment').onclick=()=>{draft.equipment=$('equipmentText').value.trim();persist();renderExtra()};
$('addInventory').onclick=()=>{const name=$('inventoryName').value.trim();if(!name)return;draft.inventory.push({name,quantity:1});$('inventoryName').value='';persist();renderExtra()};
$('openLog').onclick=()=>{$('logModal').classList.add('open');renderExtra()};$('closeLog').onclick=()=>$('logModal').classList.remove('open');
$('addLog').onclick=()=>{const text=$('logText').value.trim();if(!text)return;draft.log.push({at:new Date().toISOString(),text});$('logText').value='';persist();renderExtra()};
$('askQuestAi').onclick=async()=>{const prompt='Ironswornのソロプレイ用に、今すぐ開始できる次のクエストを1件作ってください。質問で返さず、依頼人・目の前で起きる事件・具体的な目的・最初に選べる行動3つ・推奨ランクを決定してください。\n\n主人公：'+draft.name+'\n現在地：'+(draft.setup?.startLocation||'未設定')+'\n現在の誓い：'+(draft.vow?.title||'なし')+'\n直近ログ：'+(draft.log||[]).slice(-5).map(x=>x.text).join(' / ');try{await navigator.clipboard.writeText(prompt);alert('クエスト作成用の文をコピーしました。ChatGPTに貼り付けてください。')}catch(e){alert(prompt)}};
const oldRender=window.renderGame;window.renderExtra=renderExtra;setTimeout(renderExtra,0);
})();
