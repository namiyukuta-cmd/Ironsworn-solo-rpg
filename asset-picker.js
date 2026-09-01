(()=>{'use strict';
const SAVES_KEY='ironsworn-saves-v3';
const ACTIVE_KEY='ironsworn-active-character';
const DRAFT_KEY='ironsworn-working-draft-v3';
const CUSTOM_KEY='ironsworn-user-custom-assets-v1';
const DATA_FILES=['assets/custom.json','assets/companions.json','assets/paths-1.json','assets/paths-2.json','assets/combat.json','assets/rituals.json'];
const $=id=>document.getElementById(id);
const el={
  backBtn:$('backBtn'),charLabel:$('charLabel'),costLabel:$('costLabel'),search:$('search'),filters:$('filters'),list:$('list'),
  modal:$('modal'),modalTitle:$('modalTitle'),modalText:$('modalText'),startAbilities:$('startAbilities'),cancelBtn:$('cancelBtn'),confirmBtn:$('confirmAssetBtn'),
  customNewBtn:$('customNewBtn'),customModal:$('customModal'),customName:$('customName'),customType:$('customType'),customSummary:$('customSummary'),
  customA1:$('customA1'),customD1:$('customD1'),customA2:$('customA2'),customD2:$('customD2'),customA3:$('customA3'),customD3:$('customD3'),
  customError:$('customError'),customCancelBtn:$('customCancelBtn'),customCreateBtn:$('customCreateBtn')
};
let saves={};try{saves=JSON.parse(localStorage.getItem(SAVES_KEY)||'{}')||{}}catch(e){}
const params=new URLSearchParams(location.search);
const charId=params.get('char')||localStorage.getItem(ACTIVE_KEY);
const replaceRaw=params.get('replace');
let pack=null;try{pack=JSON.parse(sessionStorage.getItem(DRAFT_KEY)||'null')}catch(e){}
let ch=(pack&&pack.id===charId&&pack.character)?pack.character:(charId&&saves[charId]?JSON.parse(JSON.stringify(saves[charId])):null);
if(!ch){location.replace('index.html');return}
ch.assets=Array.isArray(ch.assets)?ch.assets:[];ch.tracks=ch.tracks||{};if(!Number.isFinite(Number(ch.tracks.xp)))ch.tracks.xp=0;
let replaceIndex=replaceRaw===null?null:Number(replaceRaw);
if(!Number.isInteger(replaceIndex)||replaceIndex<0||replaceIndex>=ch.assets.length||replaceIndex>2)replaceIndex=null;
let data=[],filter='すべて',query='',pending=null,pendingAbility=0;
const types=['すべて','相棒','パス','戦闘タレント','儀式','カスタム'];
const TERMS=[['Reach Your Destination','目的地に着いた時の判定'],['Undertake a Journey','旅を進める判定'],['Secure an Advantage','有利な状況を作る判定'],['Gather Information','情報を集める判定'],['Swear an Iron Vow','誓いを立てる判定'],['Fulfill Your Vow','誓いを達成できたか確かめる判定'],['Forge a Bond','相手との絆を結ぶ判定'],['Test Your Bond','相手との絆を試す判定'],['Face Desolation','絶望に耐える判定'],['Face Death','死に直面した時の判定'],['Endure Stress','精神的なダメージに耐える判定'],['Endure Harm','ケガやダメージに耐える判定'],['Enter the Fray','戦闘を始める時の判定'],['Turn the Tide','戦闘中に一度だけ流れを変える行動'],['Face Danger','危険に対処する判定'],['Check Your Gear','必要な装備があるか確かめる判定'],['Aid Your Ally','仲間を助ける判定'],['Make Camp','野営する時'],['Resupply','食料や物資を補給する判定'],['Sojourn','集落で休息・交流・補給する判定'],['Compel','説得・交渉・威圧する判定'],['Draw the Circle','一対一の決闘を始める判定'],['Strike','こちらが主導権を持って攻撃する判定'],['Clash','相手の攻撃に応戦する判定'],['Battle','集団戦の判定'],['Heal','治療する判定'],['Forsake Your Vow','誓いを捨てる'],['Maimed','重傷状態'],['Corrupted','汚染状態'],['Shadow','Shadow（隠密・ずる賢さ）'],['Heart','Heart（勇気・人との関わり）'],['Wits','Wits（知恵・観察力）'],['Iron','Iron（力・頑丈さ）'],['Edge','Edge（素早さ・遠距離）']];
function easy(t){let s=String(t||'');TERMS.forEach(([a,b])=>s=s.split(a).join(b));return s}
function plainEffect(t){return easy(t).replace(/を強化。?$/,'で有利になる。').replace(/を補助。?$/,'を使う判定で有利になる。').replace(/に強い。?$/,'で有利になる。')}
const count=()=>ch.assets.length;
const cost=()=>replaceIndex!==null?0:(count()<3?0:3);
function saveDraft(){sessionStorage.setItem(DRAFT_KEY,JSON.stringify({id:charId,character:ch}));localStorage.setItem(ACTIVE_KEY,charId)}
function status(){
  if(replaceIndex!==null){el.charLabel.textContent=ch.name+'　'+(replaceIndex+1)+'枠目を選び直し';el.costLabel.textContent='XP消費なし'}
  else{el.charLabel.textContent=ch.name+'　アセット '+count()+'個';el.costLabel.textContent=cost()===0?'初期枠 '+count()+' / 3':'追加：3 XP（所持 '+(Number(ch.tracks.xp)||0)+' XP）'}
}
function sameAsset(x,a){return !!x&&(x.assetId===a.id||x.name===a.name)}
function owned(a){return ch.assets.some((x,i)=>i!==replaceIndex&&sameAsset(x,a))}
function isCurrent(a){return replaceIndex!==null&&sameAsset(ch.assets[replaceIndex],a)}
function renderFilters(){
  el.filters.innerHTML='';
  types.forEach(t=>{const b=document.createElement('button');b.type='button';b.className='filter'+(t===filter?' on':'');b.textContent=t;b.onclick=()=>{filter=t;renderFilters();renderList()};el.filters.appendChild(b)})
}
function renderList(){
  el.list.innerHTML='';
  const q=query.trim().toLowerCase();
  const arr=data.filter(a=>(filter==='すべて'||a.type===filter)&&(!q||[a.name,a.type,a.summary,...(a.abilities||[]).flatMap(x=>[x.label,x.description])].join(' ').toLowerCase().includes(q)));
  if(!arr.length){el.list.innerHTML='<div class="empty">該当するアセットがありません。</div>';return}
  arr.forEach(a=>{
    const own=owned(a),current=isCurrent(a),c=document.createElement('div');c.className='card'+(own?' owned':'');
    c.innerHTML='<div class="card-top"><div class="name">'+a.name+(a.userCustom?' <span class="user-custom-tag">自作</span>':'')+'</div><div class="type">'+a.type+'</div></div>'+
      '<div class="summary"><b>ざっくり：</b>'+easy(a.summary)+'</div>'+
      (a.requirement?'<div class="req"><b>取得条件：</b>'+easy(a.requirement)+'</div>':'')+
      '<div class="what-title">このアセットでできること</div><div class="abilities">'+(a.abilities||[]).map((x,i)=>'<div class="ability"><div class="ability-name"><span class="num">'+(i+1)+'</span><b>'+x.label+'</b>'+(i===0&&!a.chooseStartingAbility?'<span class="start-tag">最初から</span>':'')+'</div><div class="effect"><span class="effect-label">使うと</span><span>'+plainEffect(x.description)+'</span></div></div>').join('')+'</div>'+
      '<button type="button" class="choose" '+(own?'disabled':'')+'>'+(own?'取得済み':current?'このままにする':replaceIndex!==null?'これに変更':cost()?'3 XPで取得':'選ぶ')+'</button>';
    const b=c.querySelector('.choose');if(!own)b.onclick=()=>begin(a);el.list.appendChild(c);
  })
}
function begin(a){
  if(owned(a))return;
  if(replaceIndex===null&&cost()>0&&(Number(ch.tracks.xp)||0)<3){alert('このアセットを追加するにはXPが3必要です。');return}
  pending=a;pendingAbility=0;
  if(isCurrent(a)){const cur=ch.assets[replaceIndex],marked=(cur.abilities||[]).findIndex(x=>Array.isArray(x)?x[1]:x.active);pendingAbility=marked>=0?marked:0}
  el.modalTitle.textContent=a.name;
  el.modalText.textContent=a.chooseStartingAbility?'最初から使える能力を1つ選んでください。':'このアセットを'+(replaceIndex!==null?'この枠に入れます。':'追加します。')+' 1番目の能力が最初から使えます。';
  el.startAbilities.innerHTML='';
  if(a.chooseStartingAbility)(a.abilities||[]).forEach((x,i)=>{const b=document.createElement('button');b.type='button';b.className='start-ability'+(i===pendingAbility?' selected':'');b.innerHTML='<strong>'+x.label+'</strong><span>'+plainEffect(x.description)+'</span>';b.onclick=()=>{pendingAbility=i;el.startAbilities.querySelectorAll('.start-ability').forEach((z,j)=>z.classList.toggle('selected',j===i))};el.startAbilities.appendChild(b)});
  el.modal.classList.add('open');el.modal.setAttribute('aria-hidden','false');
}
function closeModal(){pending=null;el.modal.classList.remove('open');el.modal.setAttribute('aria-hidden','true')}
function confirmSelection(){
  if(!pending)return;
  const xpCost=cost(),currentXp=Number(ch.tracks.xp)||0;
  if(replaceIndex===null&&xpCost>0){if(currentXp<xpCost){alert('XPが足りません。');return}ch.tracks.xp=currentXp-xpCost}
  const obj={assetId:pending.id,name:pending.name,type:pending.type,summary:pending.summary||'',abilities:(pending.abilities||[]).map((x,i)=>[x.label,i===pendingAbility,x.description||'']),source:pending.userCustom?'user-custom':'asset-library',userCustom:!!pending.userCustom};
  if(replaceIndex!==null)ch.assets[replaceIndex]=obj;else ch.assets.push(obj);
  saveDraft();closeModal();location.href=new URLSearchParams(location.search).get('setup')==='1'?'new.html':'main.html';
}
function loadCustoms(){try{return JSON.parse(localStorage.getItem(CUSTOM_KEY)||'[]')||[]}catch(e){return[]}}
function openCustom(){[el.customName,el.customSummary,el.customA1,el.customD1,el.customA2,el.customD2,el.customA3,el.customD3].forEach(x=>x.value='');el.customType.value='カスタム';el.customError.textContent='';el.customModal.classList.add('open');el.customModal.setAttribute('aria-hidden','false')}
function closeCustom(){el.customModal.classList.remove('open');el.customModal.setAttribute('aria-hidden','true')}
function createCustom(){
  const name=el.customName.value.trim(),a1=el.customA1.value.trim();
  if(!name){el.customError.textContent='アセット名を入力してください。';return}
  if(!a1){el.customError.textContent='能力1の名前を入力してください。';return}
  const abilities=[];
  [[el.customA1,el.customD1],[el.customA2,el.customD2],[el.customA3,el.customD3]].forEach(([n,d])=>{const label=n.value.trim();if(label)abilities.push({label,description:d.value.trim()||'効果を自由に決める。'})});
  const a={id:'user-custom-'+Date.now(),name,type:el.customType.value,summary:el.customSummary.value.trim()||'自作のカスタムアセット。',abilities,chooseStartingAbility:abilities.length>1,requirement:null,userCustom:true};
  const cs=loadCustoms();cs.push(a);localStorage.setItem(CUSTOM_KEY,JSON.stringify(cs));data.push(a);closeCustom();renderList();begin(a);
}
el.backBtn.onclick=()=>location.href=new URLSearchParams(location.search).get('setup')==='1'?'new.html':'main.html';
el.search.oninput=e=>{query=e.target.value;renderList()};
el.cancelBtn.onclick=closeModal;el.confirmBtn.onclick=confirmSelection;el.modal.onclick=e=>{if(e.target===el.modal)closeModal()};
el.customNewBtn.onclick=openCustom;el.customCancelBtn.onclick=closeCustom;el.customCreateBtn.onclick=createCustom;el.customModal.onclick=e=>{if(e.target===el.customModal)closeCustom()};
Promise.all(DATA_FILES.map(f=>fetch(f+'?v=asset7',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(f);return r.json()}))).then(parts=>{data=parts.flat().concat(loadCustoms());status();renderFilters();renderList()}).catch(err=>{console.error(err);el.list.innerHTML='<div class="empty">アセットデータを読み込めませんでした。</div>'});
})();
