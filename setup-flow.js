(()=>{'use strict';
const FLOW_KEY='ironsworn-new-game-flow-v1';
const NOTES_KEY='ironsworn-character-notes-v1';
const TOKEN_SESSION_KEY='ironsworn-github-token-session-v1';
const TOKEN_LOCAL_KEY='ironsworn-github-token-local-v1';
const $=id=>document.getElementById(id);
const clone=x=>JSON.parse(JSON.stringify(x));
let state=loadState();
let worlds=[];

function loadState(){try{return JSON.parse(sessionStorage.getItem(FLOW_KEY)||'null')}catch(e){return null}}
function saveState(){if(state)sessionStorage.setItem(FLOW_KEY,JSON.stringify(state));else sessionStorage.removeItem(FLOW_KEY)}
function blankState(){return {id:null,step:0,data:{concept:'',name:'',stats:{edge:3,heart:1,iron:2,shadow:1,wits:2},worldMode:'new',worldId:'',worldName:'',worldTruths:'',startLocation:'',bonds:['','',''],equipment:'',backgroundVow:'',backgroundVowRank:'Extreme',incitingIncident:'',startMode:'normal',openingScene:'',initialVow:'',initialVowRank:'Dangerous'}}}
function ensureModal(){
  if($('setupFlow'))return;
  const wrap=document.createElement('div');wrap.id='setupFlow';wrap.className='setup-flow';wrap.innerHTML='<div class="setup-card"><div class="setup-head"><div><small>IRONSWORN</small><h1 id="setupTitle"></h1></div><button id="setupCancel" type="button">×</button></div><div id="setupProgress" class="setup-progress"></div><div id="setupBody" class="setup-body"></div><div id="setupError" class="setup-error"></div><div class="setup-nav"><button id="setupBack" type="button">戻る</button><button id="setupNext" type="button" class="primary">次へ</button></div></div>';
  document.body.appendChild(wrap);
  $('setupCancel').onclick=cancelFlow;$('setupBack').onclick=goBack;$('setupNext').onclick=goNext;
}
function openFlow(){state=blankState();saveState();ensureModal();$('setupFlow').classList.add('open');render()}
function resumeFlow(){if(!state)return;ensureModal();$('setupFlow').classList.add('open');render()}
function cancelFlow(){
  if(state&&state.id&&typeof draft!=='undefined'&&draft&&draft.id===state.id&&typeof discardDraft==='function')discardDraft();
  state=null;saveState();$('setupFlow')?.classList.remove('open');if(typeof show==='function')show('homeScreen');history.replaceState(null,'',location.pathname);
}
function fields(){return state.data}
function syncDraft(){if(!state?.id||typeof draft==='undefined'||!draft)return;draft.setup=clone(state.data);if(typeof writeDraft==='function')writeDraft()}
function makeInput(label,key,placeholder='',type='text'){
  const v=fields()[key]??'';
  if(type==='textarea')return '<label class="setup-label">'+label+'<textarea data-field="'+key+'" rows="4" placeholder="'+escapeAttr(placeholder)+'">'+escapeHtml(v)+'</textarea></label>';
  return '<label class="setup-label">'+label+'<input data-field="'+key+'" type="text" placeholder="'+escapeAttr(placeholder)+'" value="'+escapeAttr(v)+'"></label>';
}
function escapeHtml(s){return String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function escapeAttr(s){return escapeHtml(s).replace(/"/g,'&quot;')}
function bindFields(){
  document.querySelectorAll('#setupBody [data-field]').forEach(el=>{
    const handler=()=>{fields()[el.dataset.field]=el.value;saveState();syncDraft()};el.addEventListener(el.tagName==='SELECT'?'change':'input',handler);
  });
}
function progress(){const names=['キャラクター','アセット','世界','背景','発端','開始場面','最初の誓い'];$('setupProgress').innerHTML=names.map((n,i)=>'<span class="'+(i===state.step?'on':i<state.step?'done':'')+'">'+(i+1)+'</span>').join('')}
function nextWorldId(){let max=0;worlds.forEach(w=>{const m=String(w.id||'').match(/^world-(\d+)$/);if(m)max=Math.max(max,Number(m[1]))});return max?('world-'+String(max+1).padStart(3,'0')):('world-'+Date.now())}
function render(){
  if(!state)return;ensureModal();progress();$('setupError').textContent='';$('setupBack').style.visibility=state.step===0?'hidden':'visible';$('setupNext').textContent=state.step===6?'ゲーム開始':'次へ';
  const d=fields(),body=$('setupBody');
  if(state.step===0){
    $('setupTitle').textContent='キャラクター作成';
    body.innerHTML=makeInput('どんな人物？（あとで増やせます）','concept','例：旅の占い師。口数は少ない。','textarea')+makeInput('名前','name','キャラクター名')+'<div class="setup-label">能力値 <small>3 / 2 / 2 / 1 / 1 を1つずつ</small></div><div class="setup-stats">'+['edge','heart','iron','shadow','wits'].map(k=>'<label><span>'+k.toUpperCase()+'</span><select data-stat="'+k+'"><option '+(d.stats[k]===1?'selected':'')+'>1</option><option '+(d.stats[k]===2?'selected':'')+'>2</option><option '+(d.stats[k]===3?'selected':'')+'>3</option></select></label>').join('')+'</div><div class="setup-fixed">開始値：Health 5 / Spirit 5 / Supply 5 / Momentum 2 / XP 0</div>';
    body.querySelectorAll('[data-stat]').forEach(el=>el.onchange=()=>{d.stats[el.dataset.stat]=Number(el.value);saveState();syncDraft()});bindFields();
  }else if(state.step===1){
    $('setupTitle').textContent='アセットを3つ選ぶ';
    const assets=(typeof draft!=='undefined'&&draft&&Array.isArray(draft.assets))?draft.assets:[];
    body.innerHTML='<div class="setup-assets">'+(assets.length?assets.map(a=>'<div><strong>'+escapeHtml(a.name)+'</strong><span>'+escapeHtml(a.type||'')+'</span></div>').join(''):'<p>まだ選んでいません。</p>')+'</div><button id="setupPickAsset" class="setup-big" type="button">アセットを選ぶ（'+assets.length+'/3）</button><p class="setup-help">3つ選ぶまで、この画面に戻って追加できます。</p>';
    $('setupPickAsset').onclick=()=>{syncDraft();location.href='assets.html?char='+encodeURIComponent(state.id)+'&setup=1'};
  }else if(state.step===2){
    $('setupTitle').textContent='世界';
    const options=['<option value="new" '+(d.worldMode==='new'?'selected':'')+'>新しい世界を作る</option>'].concat(worlds.map(w=>'<option value="'+escapeAttr(w.id)+'" '+(d.worldMode==='existing'&&d.worldId===w.id?'selected':'')+'>'+escapeHtml(w.name||w.id)+'</option>')).join('');
    body.innerHTML='<label class="setup-label">使う世界<select id="setupWorldSelect">'+options+'</select></label><div id="setupNewWorld">'+makeInput('世界名','worldName','例：ヒマリの世界')+makeInput('世界の基本設定','worldTruths','時代、国、雰囲気、魔法の有無など。あとで追加できます。','textarea')+'</div>'+makeInput('物語を始める場所','startLocation','例：パリ郊外の宿屋');
    const sel=$('setupWorldSelect');const toggle=()=>{const isNew=sel.value==='new';$('setupNewWorld').style.display=isNew?'block':'none';d.worldMode=isNew?'new':'existing';if(isNew){if(!d.worldId||worlds.some(w=>w.id===d.worldId))d.worldId=nextWorldId()}else{d.worldId=sel.value;const w=worlds.find(x=>x.id===sel.value);d.worldName=w?.name||sel.value}saveState();syncDraft()};sel.onchange=toggle;bindFields();toggle();
  }else if(state.step===3){
    $('setupTitle').textContent='背景';
    body.innerHTML='<div class="setup-label">背景の絆 <small>0〜3個。故郷、家族、友人、忠誠など</small></div>'+d.bonds.map((v,i)=>'<input class="setup-line" data-bond="'+i+'" value="'+escapeAttr(v)+'" placeholder="絆 '+(i+1)+'">').join('')+makeInput('大切な装備・持ち物','equipment','例：ローブ、占い石、小袋','textarea')+makeInput('背景の誓い','backgroundVow','長く抱えている大きな誓い')+'<label class="setup-label">背景の誓いの難易度<select id="backgroundRank"><option '+(d.backgroundVowRank==='Extreme'?'selected':'')+'>Extreme</option><option '+(d.backgroundVowRank==='Epic'?'selected':'')+'>Epic</option></select></label><p class="setup-help">背景の誓いはここでは判定しません。</p>';
    body.querySelectorAll('[data-bond]').forEach(el=>el.oninput=()=>{d.bonds[Number(el.dataset.bond)]=el.value;saveState();syncDraft()});$('backgroundRank').onchange=e=>{d.backgroundVowRank=e.target.value;saveState();syncDraft()};bindFields();
  }else if(state.step===4){
    $('setupTitle').textContent='発端事件';
    body.innerHTML=makeInput('何が起きて、動かざるを得なくなった？','incitingIncident','事件、依頼、危機、発見など。','textarea')+'<p class="setup-help">ここが最初の冒険を動かす問題になります。</p>';bindFields();
  }else if(state.step===5){
    $('setupTitle').textContent='開始場面';
    body.innerHTML='<div class="setup-choice"><label><input type="radio" name="startMode" value="normal" '+(d.startMode==='normal'?'checked':'')+'> <strong>日常から始める</strong><span>短いプロローグのあと事件へ。</span></label><label><input type="radio" name="startMode" value="in-media-res" '+(d.startMode==='in-media-res'?'checked':'')+'> <strong>事件の最中から始める</strong><span>すでに問題が起きている場面から。</span></label></div>'+makeInput('最初の場面','openingScene','どこで、誰がいて、何が起きている？','textarea');
    body.querySelectorAll('input[name=startMode]').forEach(el=>el.onchange=()=>{d.startMode=el.value;saveState();syncDraft()});bindFields();
  }else{
    $('setupTitle').textContent='最初の誓い';
    body.innerHTML=makeInput('この事件に対して何を誓う？','initialVow','例：消えた旅人を見つける')+'<label class="setup-label">難易度<select id="initialRank"><option '+(d.initialVowRank==='Troublesome'?'selected':'')+'>Troublesome</option><option '+(d.initialVowRank==='Dangerous'?'selected':'')+'>Dangerous</option><option '+(d.initialVowRank==='Formidable'?'selected':'')+'>Formidable</option></select></label><div class="setup-start-note">ゲーム開始後、最初に <b>Swear an Iron Vow</b> を判定します。結果から次の行動を決めます。</div>';
    $('initialRank').onchange=e=>{d.initialVowRank=e.target.value;saveState();syncDraft()};bindFields();
  }
}
function validate(){const d=fields();$('setupError').textContent='';
  if(state.step===0){if(!d.name.trim())return '名前を入力してください。';const a=Object.values(d.stats).sort((x,y)=>y-x).join(',');if(a!=='3,2,2,1,1')return '能力値は 3 / 2 / 2 / 1 / 1 を1つずつ使います。'}
  if(state.step===1){const n=(typeof draft!=='undefined'&&draft&&Array.isArray(draft.assets))?draft.assets.length:0;if(n!==3)return 'アセットを3つ選んでください。'}
  if(state.step===2){if(d.worldMode==='new'&&!d.worldName.trim())return '世界名を入力してください。';if(!d.startLocation.trim())return '物語を始める場所を入力してください。'}
  if(state.step===3&&!d.backgroundVow.trim())return '背景の誓いを入力してください。';
  if(state.step===4&&!d.incitingIncident.trim())return '発端事件を入力してください。';
  if(state.step===5&&!d.openingScene.trim())return '最初の場面を入力してください。';
  if(state.step===6&&!d.initialVow.trim())return '最初の誓いを入力してください。';return ''}
function goNext(){const err=validate();if(err){$('setupError').textContent=err;return}const d=fields();
  if(state.step===0&&!state.id){const id='char-'+Date.now();state.id=id;if(typeof startDraft==='function')startDraft(id,{id,name:d.name.trim(),stats:clone(d.stats),tracks:{health:5,spirit:5,supply:5,momentum:2,xp:0,momentumMax:10,momentumReset:2},vow:{title:'未設定',progress:0},assets:[],tattoos:{},notes:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),setup:clone(d)});}
  syncDraft();if(state.step<6){state.step++;saveState();render();return}finishFlow()}
function goBack(){if(state.step>0){state.step--;saveState();render()}}
async function finishFlow(){
  const d=fields();if(typeof draft==='undefined'||!draft)return;
  const bonds=d.bonds.map(x=>x.trim()).filter(Boolean);
  draft.name=d.name.trim();
  draft.setup={...clone(d),complete:true,needsSync:true,completedAt:new Date().toISOString(),playId:'play-'+state.id};
  draft.vow={title:d.initialVow.trim(),progress:0,rank:d.initialVowRank,status:'active'};
  draft.backgroundVow={title:d.backgroundVow.trim(),rank:d.backgroundVowRank,progress:0,status:'active'};
  draft.bonds=bonds.map(name=>({name,ticks:1,background:true}));
  draft.equipment=d.equipment.trim();
  draft.profile={concept:d.concept.trim(),bonds,equipment:d.equipment.trim(),backgroundVow:{title:d.backgroundVow.trim(),rank:d.backgroundVowRank}};
  draft.notes=[d.concept.trim()&&('人物像・性格・背景\n'+d.concept.trim()),d.equipment.trim()&&('持ち物・装備\n'+d.equipment.trim())].filter(Boolean).join('\n\n');
  try{const notes=JSON.parse(localStorage.getItem(NOTES_KEY)||'{}')||{};notes[draft.id]=draft.notes;localStorage.setItem(NOTES_KEY,JSON.stringify(notes))}catch(e){}
  if(typeof formalSave==='function')formalSave();
  const token=sessionStorage.getItem(TOKEN_SESSION_KEY)||localStorage.getItem(TOKEN_LOCAL_KEY)||'';
  $('setupNext').disabled=true;$('setupNext').textContent='保存中…';
  if(token){try{await Promise.all([window.IronswornGithubSync?.syncCurrentCharacter(token),window.IronswornSetupSync?.sync(token)])}catch(e){console.warn('initial github sync failed',e)}}
  state=null;saveState();$('setupFlow').classList.remove('open');if(typeof renderGame==='function')renderGame();if(typeof show==='function')show('gameScreen');history.replaceState(null,'',location.pathname+'#game');
}
async function loadWorlds(){try{const r=await fetch('worlds/index.json?v=setup2',{cache:'no-store'});if(r.ok){const j=await r.json();worlds=Array.isArray(j.worlds)?j.worlds:[];if(state?.step===2)render()}}catch(e){worlds=[]}}
const homeNew=$('homeNew');if(homeNew)homeNew.onclick=openFlow;
loadWorlds();if(state&&state.id&&typeof draft!=='undefined'&&draft&&draft.id===state.id)resumeFlow();
})();
