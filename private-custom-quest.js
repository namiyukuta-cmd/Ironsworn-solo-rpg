(()=>{'use strict';
const KEY='ironsworn-private-loaded-save-v1';
const $=id=>document.getElementById(id);
let formOpen=false;

function read(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){return null}}
function write(save){sessionStorage.setItem(KEY,JSON.stringify(save));window.dispatchEvent(new CustomEvent('ironsworn:statechange'))}
function activeQuest(c){return Array.isArray(c?.quests)?c.quests.find(q=>q?.status==='active'):null}
function actionsBox(){return $('questActions')||document.querySelector('.quest-actions')}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function injectButton(){
 if(formOpen)return;
 const save=read(),c=save?.character,box=actionsBox();
 if(!c||!box||activeQuest(c)||box.querySelector('#customQuestBtn'))return;
 const btn=document.createElement('button');
 btn.id='customQuestBtn';btn.type='button';btn.className='quest-play-btn custom-quest-launch';btn.textContent='自分でクエストを作る';
 btn.onclick=openForm;box.appendChild(btn);
}

function openForm(){
 formOpen=true;
 $('questTitle').textContent='自分でクエストを作る';
 $('questText').innerHTML=`<form id="customQuestForm" class="custom-quest-form">
  <label>タイトル<input id="customQuestTitle" type="text" maxlength="80" placeholder="例：なくした剣を探す" required></label>
  <label>目的<textarea id="customQuestObjective" rows="3" maxlength="240" placeholder="何を成し遂げたい？" required></textarea></label>
  <label>難易度<select id="customQuestRank"><option value="Troublesome">Troublesome</option><option value="Dangerous" selected>Dangerous</option><option value="Formidable">Formidable</option><option value="Extreme">Extreme</option><option value="Epic">Epic</option></select></label>
  <label>導入・今起きていること<textarea id="customQuestOpening" rows="4" maxlength="500" placeholder="今どんな状況から始まる？"></textarea></label>
 </form>`;
 $('questMetaLabel').textContent='CUSTOM QUEST';
 $('questObjective').textContent='必要なところだけ決めれば始められます。';
 const box=actionsBox();
 box.innerHTML='<button id="customQuestStart" class="quest-play-btn primary" type="button">このクエストを使う</button><button id="customQuestCancel" class="quest-play-btn" type="button">戻る</button>';
 $('customQuestStart').onclick=submitQuest;$('customQuestCancel').onclick=closeForm;
}

function closeForm(){formOpen=false;window.dispatchEvent(new CustomEvent('ironsworn:questopen'))}

function submitQuest(){
 const title=$('customQuestTitle').value.trim(),objective=$('customQuestObjective').value.trim(),rank=$('customQuestRank').value,opening=$('customQuestOpening').value.trim();
 if(!title||!objective){$('questObjective').textContent='タイトルと目的を入れてください。';return}
 const save=read(),c=save?.character;if(!c)return;
 c.questBoard=c.questBoard||{counter:0,lastOfferId:''};
 const now=new Date().toISOString();
 c.questOffer={
  id:'custom_'+Date.now(),title,rank,hook:opening||objective,people:[],objective,
  stakes:'自分で決めた誓い。',unknowns:[],openingSituation:opening||objective,tags:[],
  source:'user',custom:true,offerId:'custom-offer-'+Date.now(),offeredAt:now
 };
 c.questBoard.completedNotice=null;
 c.updatedAt=now;save.character=c;
 write(save);formOpen=false;
 window.dispatchEvent(new CustomEvent('ironsworn:questopen'));
}

const observer=new MutationObserver(()=>injectButton());
function boot(){const box=actionsBox();if(box)observer.observe(box,{childList:true,subtree:true});setTimeout(injectButton,0)}
window.addEventListener('ironsworn:questopen',()=>setTimeout(injectButton,0));
setTimeout(boot,0);
})();
