(()=>{'use strict';
const KEY='ironsworn-private-loaded-save-v1';
const TOKEN_KEY='ironsworn-private-save-token-v1';
const $=id=>document.getElementById(id);
let formOpen=false;

function read(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){return null}}
function write(save){sessionStorage.setItem(KEY,JSON.stringify(save));window.dispatchEvent(new CustomEvent('ironsworn:statechange'))}
function activeQuest(c){return Array.isArray(c?.quests)?c.quests.find(q=>q?.status==='active'):null}
function actionsBox(){return $('questActions')||document.querySelector('.quest-actions')}

function injectButton(){
 if(formOpen)return;
 const save=read(),c=save?.character,box=actionsBox();
 if(!c||!box||activeQuest(c)||box.querySelector('#customQuestBtn'))return;
 const btn=document.createElement('button');
 btn.id='customQuestBtn';btn.type='button';btn.className='quest-play-btn custom-quest-launch';btn.textContent='自分で作る';
 btn.onclick=openForm;box.appendChild(btn);
}

function openForm(){
 formOpen=true;
 const save=read(),draft=save?.character?.customQuestDraft;
 $('questTitle').textContent='自分で作る';
 $('questText').innerHTML=`<form id="customQuestForm" class="custom-quest-form">
  <textarea id="customQuestText" rows="8" maxlength="1200" placeholder="ここに、そのまま書いてください。"></textarea>
 </form>`;
 $('customQuestText').value=draft?.status==='waiting-ai'?String(draft.text||''):'';
 $('questMetaLabel').textContent='CUSTOM QUEST';
 $('questObjective').textContent='内容・目的・難易度などは、あとでChatGPTが整えます。';
 const box=actionsBox();
 box.innerHTML='<button id="customQuestSave" class="quest-play-btn primary" type="button">セーブ</button><button id="customQuestCancel" class="quest-play-btn" type="button">戻る</button>';
 $('customQuestSave').onclick=saveDraft;$('customQuestCancel').onclick=closeForm;
}

function closeForm(){formOpen=false;window.dispatchEvent(new CustomEvent('ironsworn:questopen'))}

function saveDraft(){
 const text=$('customQuestText').value.trim();
 if(!text){$('questObjective').textContent='何か入力してください。';return}
 const save=read(),c=save?.character;if(!c)return;
 const now=new Date().toISOString(),old=c.customQuestDraft||{};
 c.customQuestDraft={
  format:'ironsworn-custom-quest-draft-v1',
  text,
  status:'waiting-ai',
  createdAt:old.createdAt||now,
  updatedAt:now,
  aiInstructions:'この自由入力をもとに、キャラクター・世界設定・地図・現在の状況と矛盾しないIronsworn用クエストへ整える。タイトル、目的、導入、関係者、賭けられているもの、未確定事項、タグ、難易度はAIが判断する。'
 };
 c.updatedAt=now;save.character=c;
 write(save);
 $('questObjective').textContent='保存しました。ChatGPTで「自作クエスト見て」と聞いてください。';
 const saveBtn=$('saveBtn');
 if(saveBtn&&localStorage.getItem(TOKEN_KEY))saveBtn.click();
 else if(!localStorage.getItem(TOKEN_KEY))$('questObjective').textContent='ゲーム内には保存しました。ChatGPTから読むには上のSAVEを完了してください。';
}

const observer=new MutationObserver(()=>injectButton());
function boot(){const box=actionsBox();if(box)observer.observe(box,{childList:true,subtree:true});setTimeout(injectButton,0)}
window.addEventListener('ironsworn:questopen',()=>setTimeout(injectButton,0));
setTimeout(boot,0);
})();
