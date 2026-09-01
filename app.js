const SAVES_KEY='ironsworn-saves-v3';
const OLD_STORE_KEY='ironsworn-characters-v1';
const ACTIVE_KEY='ironsworn-active-character';
const DRAFT_KEY='ironsworn-working-draft-v3';
const WHITE_ID='shirogane';

const whiteTemplate={
  id:WHITE_ID,name:'白金',
  stats:{edge:3,heart:1,iron:2,shadow:1,wits:2},
  tracks:{health:5,spirit:5,supply:3,momentum:3,xp:1},
  vow:{title:'アデルを連絡拠点まで守る',progress:0},
  assets:[
    {assetId:'last-of-people',name:'最後の民',type:'カスタム',summary:'一族最後の生き残り。荒野で生きる力を持つ。',abilities:[['荒野の子',true,'荒野での行動を助ける。'],['獣を捌く者',false,'獣の扱いに長ける。'],['異邦の眼',false,'異文化を観察する。']]},
    {assetId:'herbalist',name:'薬草師',type:'パス',summary:'薬草を使った治療を得意とする。',abilities:[['薬草治療',true,'薬草を使った治療を強化する。'],['癒やし手',false,'他者を治療した時に恩恵を得る。'],['滋養食',false,'野営時の食事で回復を助ける。']]},
    {assetId:'raven',name:'肉',type:'相棒',summary:'鴉の相棒。策略・死の境・伝書に役立つ。',abilities:[['ずる賢い',false,'悪戯や盗みで行動を助ける。'],['知る者',false,'死に直面した時に助ける。'],['勤勉',true,'離れた相手への伝書や情報収集に使える。']]}
  ],
  tattoos:{'道標':'ready','鷹目':'ready','守骨':'ready','影歩':'ready','狩牙':'ready','止血':'cool','熾火':'ready','息潜':'ready'},
  createdAt:'2026-08-19T00:00:00+09:00',updatedAt:new Date().toISOString()
};

const clone=x=>JSON.parse(JSON.stringify(x));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const $=id=>document.getElementById(id);

function migrate(c){
  if(!c)return c;
  c.assets=Array.isArray(c.assets)?c.assets:[];
  c.tracks=c.tracks||{health:5,spirit:5,supply:5,momentum:2,xp:0};
  c.vow=c.vow||{title:'未設定',progress:0};
  c.tattoos=c.tattoos||{};
  return c;
}

function loadSaves(){
  let s={};
  try{s=JSON.parse(localStorage.getItem(SAVES_KEY)||'{}')||{}}catch(e){}
  if(!Object.keys(s).length){
    try{
      const old=JSON.parse(localStorage.getItem(OLD_STORE_KEY)||'{}')||{};
      Object.values(old).forEach(c=>{if(c&&c.id)s[c.id]=migrate(clone(c))});
    }catch(e){}
  }
  if(!s[WHITE_ID])s[WHITE_ID]=clone(whiteTemplate);
  localStorage.setItem(SAVES_KEY,JSON.stringify(s));
  return s;
}

let saves=loadSaves();
let activeId=localStorage.getItem(ACTIVE_KEY)||WHITE_ID;
let draft=null;

function saveSaves(){
  localStorage.setItem(SAVES_KEY,JSON.stringify(saves));
  localStorage.setItem(ACTIVE_KEY,activeId);
}
function readDraft(){
  try{
    const p=JSON.parse(sessionStorage.getItem(DRAFT_KEY)||'null');
    return p&&p.id&&p.character?p:null;
  }catch(e){return null}
}
function writeDraft(){
  if(!draft)return;
  sessionStorage.setItem(DRAFT_KEY,JSON.stringify({id:activeId,character:draft}));
  localStorage.setItem(ACTIVE_KEY,activeId);
}
function discardDraft(){draft=null;sessionStorage.removeItem(DRAFT_KEY)}
function startDraft(id,c){activeId=id;draft=migrate(clone(c));writeDraft();return draft}
function formalSave(){
  if(!draft)return false;
  draft.updatedAt=new Date().toISOString();
  saves[activeId]=clone(draft);
  saveSaves();
  writeDraft();
  return true;
}
function show(id){
  ['homeScreen','newScreen','gameScreen'].forEach(x=>$(x).classList.add('hidden'));
  $(id).classList.remove('hidden');
}
function abilityParts(x){
  if(Array.isArray(x))return{label:x[0]||'能力',active:!!x[1],description:x[2]||''};
  return{label:x?.label||'能力',active:!!x?.active,description:x?.description||''};
}

function renderMomentum(){
  const h=$('mtrack');h.innerHTML='';
  for(let v=-6;v<=10;v++){
    const b=document.createElement('button');
    b.type='button';
    b.className='mc'+(v===draft.tracks.momentum?' on':'');
    b.textContent=v;
    b.onclick=()=>{draft.tracks.momentum=v;writeDraft();renderGame()};
    h.appendChild(b);
  }
}

function renderVow(){
  const h=$('vtrack');h.innerHTML='';
  for(let i=1;i<=10;i++){
    const b=document.createElement('button');
    b.type='button';
    b.className='vcell'+(i<=draft.vow.progress?' on':'');
    b.onclick=()=>{draft.vow.progress=draft.vow.progress===i?i-1:i;writeDraft();renderGame()};
    h.appendChild(b);
  }
  $('vp').textContent=draft.vow.progress;
  $('vowTitle').textContent=draft.vow.title||'未設定';
}

function openAssetPicker(replaceIndex=null){
  writeDraft();
  let u='assets.html?char='+encodeURIComponent(activeId);
  if(Number.isInteger(replaceIndex))u+='&replace='+replaceIndex;
  location.href=u;
}

function resetManagerForDetail(){
  $('characterList').style.display='block';
  $('slotArea').style.display='none';
  $('saveCurrent').style.display='none';
  $('loadGithub').style.display='none';
  $('exportSave').style.display='none';
  $('importSave').style.display='none';
  $('saveStatus').textContent='';
}

function openAssetDetail(i){
  const a=draft.assets[i];if(!a)return;
  resetManagerForDetail();
  $('managerTitle').textContent=a.name;
  $('managerNote').textContent=a.summary||'説明なし';
  const h=$('characterList');h.innerHTML='';
  (a.abilities||[]).map(abilityParts).forEach(x=>{
    const r=document.createElement('div');r.className='char-row';
    r.innerHTML='<div class="char-row-main"><div class="char-name">'+(x.active?'● ':'○ ')+x.label+'</div></div><div class="char-meta">'+(x.description||'説明なし')+'</div>';
    h.appendChild(r);
  });
  const change=document.createElement('button');
  change.type='button';change.className='save-action github';change.style.width='100%';change.style.marginTop='6px';
  change.textContent='このアセットを選び直す';
  change.onclick=()=>{$('managerModal').classList.remove('open');openAssetPicker(i)};
  h.appendChild(change);
  $('managerModal').classList.add('open');
}

function renderAssets(){
  const h=$('assets');
  draft.assets=Array.isArray(draft.assets)?draft.assets:[];
  h.innerHTML='';
  $('assetCount').textContent=draft.assets.length+'個';
  const add=$('assetAddTop');
  add.textContent=draft.assets.length<3?'＋初期 '+draft.assets.length+'/3':'＋追加 3XP';
  add.onclick=()=>openAssetPicker();

  const visible=draft.assets.length>3?draft.assets.slice(0,2):draft.assets.slice(0,3);
  visible.forEach((a,i)=>{
    const d=document.createElement('button');
    d.type='button';d.className='asset asset-edit';
    const abs=(a.abilities||[]).map(abilityParts);
    d.innerHTML='<div class="aname"><strong>'+a.name+'</strong><small>'+(a.type||'ASSET')+'　<span class="asset-edit-tag">詳細</span></small></div><div class="abilities">'+abs.map(x=>'<span class="ability '+(x.active?'on':'')+'">'+x.label+'</span>').join('')+'</div>';
    d.onclick=()=>openAssetDetail(i);
    h.appendChild(d);
  });

  if(draft.assets.length<3){
    for(let i=draft.assets.length;i<3;i++){
      const b=document.createElement('button');
      b.type='button';b.className='asset-add';
      b.innerHTML='＋ アセットを追加<br><small>初期枠 '+draft.assets.length+' / 3</small>';
      b.onclick=()=>openAssetPicker();
      h.appendChild(b);
    }
  }else if(draft.assets.length>3){
    const b=document.createElement('button');
    b.type='button';b.className='asset-more';
    b.innerHTML='ほか '+(draft.assets.length-2)+'個<br>一覧・追加';
    b.onclick=()=>openAssetPicker();
    h.appendChild(b);
  }
}

function renderTattoos(){
  const h=$('tattoos');h.innerHTML='';
  const e=Object.entries(draft.tattoos||{});
  $('tattooHint').textContent=e.length?'タップで状態切替':'未設定';
  if(!e.length){h.innerHTML='<div class="empty-note">刺青なし</div>';return}
  e.slice(0,8).forEach(([n,s])=>{
    const b=document.createElement('button');
    b.type='button';b.className='tat'+(s==='cool'?' cool':'');
    b.innerHTML='<strong>'+n+'</strong><span>'+(s==='cool'?'回復中':'使用可')+'</span>';
    b.onclick=()=>{draft.tattoos[n]=s==='cool'?'ready':'cool';writeDraft();renderGame()};
    h.appendChild(b);
  });
}

function renderGame(){
  if(!draft)return;
  $('charName').textContent=draft.name;
  ['xp','health','spirit','supply','momentum'].forEach(k=>$(k).textContent=draft.tracks[k]);
  ['Edge','Heart','Iron','Shadow','Wits'].forEach(k=>$('stat'+k).textContent=draft.stats[k.toLowerCase()]);
  renderMomentum();renderVow();renderAssets();renderTattoos();
}

document.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{
  if(!draft)return;
  const k=b.dataset.k,d=Number(b.dataset.d);
  if(k==='xp')draft.tracks.xp=clamp(draft.tracks.xp+d,0,99);
  if(['health','spirit','supply'].includes(k))draft.tracks[k]=clamp(draft.tracks[k]+d,0,5);
  if(k==='momentum')draft.tracks[k]=clamp(draft.tracks[k]+d,-6,10);
  writeDraft();renderGame();
});

function openLoad(){
  const m=$('managerModal');m.classList.add('open');
  $('managerTitle').textContent='キャラクターをロード';
  $('managerNote').textContent='最後に保存した状態を読み込みます。';
  $('characterList').style.display='block';
  $('slotArea').style.display='none';
  $('saveCurrent').style.display='none';
  $('loadGithub').style.display='none';
  $('exportSave').style.display='none';
  $('importSave').style.display='none';
  $('saveStatus').textContent='';
  const h=$('characterList');h.innerHTML='';
  Object.values(saves).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||'')).forEach(c=>{
    const r=document.createElement('div');r.className='char-row';
    const when=c.updatedAt?new Date(c.updatedAt).toLocaleString('ja-JP'):'';
    r.innerHTML='<div class="char-row-main"><div class="char-name">'+c.name+'</div><div class="char-meta">'+when+'</div></div><button type="button">ロード</button>';
    r.querySelector('button').onclick=()=>{startDraft(c.id,c);renderGame();m.classList.remove('open');show('gameScreen')};
    h.appendChild(r);
  });
}

$('homeLoad').onclick=()=>{discardDraft();openLoad()};
$('homeNew').onclick=()=>{discardDraft();$('newName').value='';$('newError').textContent='';show('newScreen')};
$('cancelNew').onclick=()=>{discardDraft();show('homeScreen')};
$('createNew').onclick=()=>{
  const name=$('newName').value.trim();
  const vals={edge:+$('newEdge').value,heart:+$('newHeart').value,iron:+$('newIron').value,shadow:+$('newShadow').value,wits:+$('newWits').value};
  const arr=Object.values(vals).sort((a,b)=>b-a).join(',');
  if(!name){$('newError').textContent='名前を入力してください。';return}
  if(arr!=='3,2,2,1,1'){$('newError').textContent='能力値は 3 / 2 / 2 / 1 / 1 を1つずつ使います。';return}
  const id='char-'+Date.now();
  startDraft(id,{id,name,stats:vals,tracks:{health:5,spirit:5,supply:5,momentum:2,xp:0},vow:{title:'未設定',progress:0},assets:[],tattoos:{},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
  renderGame();show('gameScreen');
};

$('goHome').onclick=()=>{discardDraft();history.replaceState(null,'',location.pathname);show('homeScreen')};
$('openSave').onclick=()=>{
  if(formalSave()){
    const b=$('openSave'),old=b.textContent;
    b.textContent='保存済み';
    setTimeout(()=>b.textContent=old,900);
  }
};
$('closeManager').onclick=()=>$('managerModal').classList.remove('open');
$('managerModal').onclick=e=>{if(e.target===$('managerModal'))$('managerModal').classList.remove('open')};

$('saveCurrent').style.display='none';
$('loadGithub').style.display='none';
$('exportSave').style.display='none';
$('importSave').style.display='none';
$('importFile').style.display='none';

const packed=readDraft();
if(location.hash==='#game'){
  if(packed){activeId=packed.id;draft=migrate(packed.character)}
  else if(saves[activeId])startDraft(activeId,saves[activeId]);
  if(draft){renderGame();show('gameScreen')}else show('homeScreen');
}else{
  discardDraft();show('homeScreen');
}
