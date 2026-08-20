(()=>{'use strict';
const SAVES_KEY='ironsworn-saves-v3';
const ACTIVE_KEY='ironsworn-active-character';
const DRAFT_KEY='ironsworn-working-draft-v3';
const SETUP_KEY='ironsworn-campaign-setup-v1';
const SETUP_ACTIVE_KEY='ironsworn-setup-active-v1';
const NOTES_KEY='ironsworn-character-notes-v1';
const TOKEN_SESSION_KEY='ironsworn-github-token-session-v1';
const TOKEN_LOCAL_KEY='ironsworn-github-token-local-v1';
const OWNER='namiyukuta-cmd',REPO='Ironsworn-solo-rpg',BRANCH='main';
const API='https://api.github.com/repos/'+OWNER+'/'+REPO;
const $=id=>document.getElementById(id);
const card=$('setupCard'),error=$('setupError'),next=$('nextBtn'),back=$('backBtn'),exit=$('exitBtn');
let ch=null,setup=null,remoteWorlds=null;

function clone(x){return JSON.parse(JSON.stringify(x))}
function safeId(id){return String(id||'character').replace(/[^A-Za-z0-9._-]/g,'-')||'character'}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function readJson(storage,key,fallback){try{return JSON.parse(storage.getItem(key)||'null')||fallback}catch(e){return fallback}}
function writeDraft(){sessionStorage.setItem(DRAFT_KEY,JSON.stringify({id:ch.id,character:ch}));sessionStorage.setItem(SETUP_KEY,JSON.stringify(setup));sessionStorage.setItem(SETUP_ACTIVE_KEY,'1');localStorage.setItem(ACTIVE_KEY,ch.id)}
function blankCharacter(id){const now=new Date().toISOString();return{id,name:'',profile:'',stats:{edge:3,heart:1,iron:2,shadow:1,wits:2},tracks:{health:5,spirit:5,supply:5,momentum:2,momentumMax:10,momentumReset:2,xp:0},vow:{title:'未設定',progress:0,rank:'Dangerous'},backgroundVow:{title:'',rank:'Extreme',progress:0},bonds:[],assets:[],equipment:'',notes:'',tattoos:{},createdAt:now,updatedAt:now}}
function blankSetup(id){return{format:'ironsworn-campaign-setup-v1',characterId:id,step:1,status:'creating',profile:'',equipment:'',world:{id:'',name:'',truths:'',startLocation:''},bonds:['','',''],backgroundVow:{title:'',rank:'Extreme'},incitingIncident:'',sceneMode:'normal',incitingVow:{title:'',rank:'Dangerous'},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}}
function startNew(){const id='char-'+Date.now();ch=blankCharacter(id);setup=blankSetup(id);writeDraft()}
function load(){
  const isNew=new URLSearchParams(location.search).get('new')==='1';
  if(isNew){startNew();history.replaceState(null,'','setup.html');return}
  const p=readJson(sessionStorage,DRAFT_KEY,null),s=readJson(sessionStorage,SETUP_KEY,null);
  if(!p||!p.id||!p.character||!s||s.characterId!==p.id||s.status!=='creating'){location.replace('index.html');return}
  ch=p.character;setup=s;ch.assets=Array.isArray(ch.assets)?ch.assets:[];
}
function field(id,label,value,placeholder='',type='text'){return `<label class="field"><span>${label}</span><input id="${id}" class="input" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}"></label>`}
function area(id,label,value,placeholder='',small=false){return `<label class="field"><span>${label}</span><textarea id="${id}" class="textarea${small?' small':''}" placeholder="${esc(placeholder)}">${esc(value)}</textarea></label>`}
function selectStat(k,label){const v=Number(ch.stats[k]);return `<div class="stat"><small>${label}</small><select id="stat-${k}">${[1,2,3].map(n=>`<option value="${n}"${n===v?' selected':''}>${n}</option>`).join('')}</select></div>`}
function rankChoice(name,value,options){return `<div class="rank-row">${options.map(x=>`<label class="choice"><input type="radio" name="${name}" value="${x.value}"${value===x.value?' checked':''}><span>${x.label}</span></label>`).join('')}</div>`}
function setProgress(){const step=setup.step||1;$('stepText').textContent=step+' / 8';$('progressBar').style.width=(step/8*100)+'%';back.style.visibility=step===1?'hidden':'visible';next.textContent=step===8?'この誓いでゲーム開始':'次へ'}
function render(){
  error.textContent='';setProgress();const n=setup.step||1;
  if(n===1){card.innerHTML=`<div class="step-kicker">CHARACTER 1</div><h1 class="step-title">キャラクター</h1><p class="step-help">人物像は最初から全部決めなくても大丈夫です。名前と能力値はここで決めます。</p>${field('name','名前',ch.name,'キャラクター名')}${area('profile','人物像・性格・背景',setup.profile,'例：22歳の占い師。人当たりは柔らかいが用心深い。',true)}<label class="field"><span>能力値（3 / 2 / 2 / 1 / 1）</span><div class="stats">${selectStat('edge','EDGE')}${selectStat('heart','HEART')}${selectStat('iron','IRON')}${selectStat('shadow','SHADOW')}${selectStat('wits','WITS')}</div></label><p class="step-help">Health / Spirit / Supply は5、Momentumは2、XPは0で開始します。</p>`}
  if(n===2){const a=ch.assets||[];card.innerHTML=`<div class="step-kicker">CHARACTER 2</div><h1 class="step-title">初期アセット</h1><p class="step-help">開始時のアセットを3つ選びます。今のアセット選択画面をそのまま使います。</p><div class="asset-list">${a.map(x=>`<div class="asset-row"><b>${esc(x.name)}</b><span>${esc(x.type||'ASSET')}</span></div>`).join('')||'<div class="asset-row"><b>まだ選んでいません</b></div>'}</div><button id="pickAsset" class="asset-pick" type="button">＋ アセットを選ぶ</button><div class="count-note">${a.length} / 3</div>`;$('pickAsset').onclick=()=>{writeDraft();location.href='assets.html?char='+encodeURIComponent(ch.id)}}
  if(n===3){card.innerHTML=`<div class="step-kicker">CHARACTER 3</div><h1 class="step-title">装備・持ち物</h1><p class="step-help">物語上意味のある物だけで十分です。食料や矢など日常的な消耗品はSupplyで扱えます。</p>${area('equipment','重要な装備・持ち物',setup.equipment,'例：フード付きローブ\n小袋に入れた占い石\n短剣')}`}
  if(n===4){card.innerHTML=`<div class="step-kicker">CAMPAIGN 1</div><h1 class="step-title">世界</h1><p class="step-help">世界全部を完成させる必要はありません。基本だけ決め、空白はプレイ中に埋められます。</p>${field('worldName','世界名',setup.world.name,'例：ヒマリの世界')}${area('truths','世界の基本設定',setup.world.truths,'時代、地域、社会、魔法の有無など。数行でもOK。')}${field('startLocation','物語の開始地点',setup.world.startLocation,'例：フランス北部の小さな町')}`}
  if(n===5){card.innerHTML=`<div class="step-kicker">CAMPAIGN 2</div><h1 class="step-title">背景の絆</h1><p class="step-help">故郷、家族、友人、共同体など、開始時点ですでに繋がりのある相手を最大3つ。空欄でも進めます。</p><div class="bond-grid">${[0,1,2].map(i=>field('bond'+i,'絆 '+(i+1),setup.bonds[i]||'','空欄でもOK')).join('')}</div>`}
  if(n===6){card.innerHTML=`<div class="step-kicker">CAMPAIGN 3</div><h1 class="step-title">背景の誓い</h1><p class="step-help">すでに人生の背景として抱えている長期目標です。ここでは判定せず、Extreme または Epic にします。</p>${field('backgroundVow','背景の誓い',setup.backgroundVow.title,'例：失われた一族の行方を突き止める')}<label class="field"><span>ランク</span>${rankChoice('backgroundRank',setup.backgroundVow.rank,[{value:'Extreme',label:'Extreme'},{value:'Epic',label:'Epic'}])}</label>`}
  if(n===7){card.innerHTML=`<div class="step-kicker">CAMPAIGN 4</div><h1 class="step-title">発端事件</h1><p class="step-help">キャラクターが放っておけず、行動せざるを得ない問題を決めます。</p>${area('incident','何が起きた？',setup.incitingIncident,'例：占いに来た客が、その夜に行方不明になった。')}<label class="field"><span>どこから始める？</span><div class="scene-row"><label class="choice"><input type="radio" name="sceneMode" value="normal"${setup.sceneMode==='normal'?' checked':''}><span>日常から<br>（プロローグ）</span></label><label class="choice"><input type="radio" name="sceneMode" value="in_media_res"${setup.sceneMode==='in_media_res'?' checked':''}><span>事件の最中から</span></label></div></label>`}
  if(n===8){card.innerHTML=`<div class="step-kicker">CAMPAIGN 5</div><h1 class="step-title">最初の誓い</h1><p class="step-help">発端事件に対して、今から何を成し遂げると誓うかを決めます。ゲーム開始後、最初に Swear an Iron Vow の判定を行う状態で保存します。</p>${field('incitingVow','最初の誓い',setup.incitingVow.title,'例：行方不明の客を見つける')}<label class="field"><span>ランク</span>${rankChoice('incitingRank',setup.incitingVow.rank,[{value:'Troublesome',label:'Troublesome'},{value:'Dangerous',label:'Dangerous'},{value:'Formidable',label:'Formidable'}])}</label><div class="summary"><div><b>キャラクター</b><span>${esc(ch.name||'未設定')} / アセット ${(ch.assets||[]).length}個</span></div><div><b>世界</b><span>${esc(setup.world.name||'未設定')}\n${esc(setup.world.startLocation||'開始地点未設定')}</span></div><div><b>発端事件</b><span>${esc(setup.incitingIncident||'未設定')}</span></div></div><div id="syncStatus" class="sync-status"></div>`}
}
function capture(){const n=setup.step||1;
  if(n===1){ch.name=$('name').value.trim();setup.profile=$('profile').value.trim();ch.profile=setup.profile;['edge','heart','iron','shadow','wits'].forEach(k=>ch.stats[k]=Number($('stat-'+k).value))}
  if(n===3){setup.equipment=$('equipment').value;ch.equipment=setup.equipment}
  if(n===4){setup.world.name=$('worldName').value.trim();setup.world.truths=$('truths').value.trim();setup.world.startLocation=$('startLocation').value.trim()}
  if(n===5){setup.bonds=[0,1,2].map(i=>$('bond'+i).value.trim())}
  if(n===6){setup.backgroundVow.title=$('backgroundVow').value.trim();setup.backgroundVow.rank=document.querySelector('input[name="backgroundRank"]:checked').value}
  if(n===7){setup.incitingIncident=$('incident').value.trim();setup.sceneMode=document.querySelector('input[name="sceneMode"]:checked').value}
  if(n===8){setup.incitingVow.title=$('incitingVow').value.trim();setup.incitingVow.rank=document.querySelector('input[name="incitingRank"]:checked').value}
  setup.updatedAt=new Date().toISOString();writeDraft()
}
function validate(){const n=setup.step||1;
  if(n===1){if(!ch.name)return'名前を入力してください。';const a=Object.values(ch.stats).sort((x,y)=>y-x).join(',');if(a!=='3,2,2,1,1')return'能力値は 3 / 2 / 2 / 1 / 1 を1つずつ使います。'}
  if(n===2&&(ch.assets||[]).length!==3)return'開始時のアセットを3つ選んでください。';
  if(n===4){if(!setup.world.name)return'世界名を入力してください。';if(!setup.world.startLocation)return'開始地点を入力してください。'}
  if(n===6&&!setup.backgroundVow.title)return'背景の誓いを入力してください。';
  if(n===7&&!setup.incitingIncident)return'発端事件を入力してください。';
  if(n===8&&!setup.incitingVow.title)return'最初の誓いを入力してください。';
  return''
}
async function loadWorldIndex(){try{const r=await fetch('worlds/index.json?ts='+Date.now(),{cache:'no-store'});if(r.ok)remoteWorlds=await r.json()}catch(e){remoteWorlds=null}}
function chooseWorldId(){if(setup.world.id)return setup.world.id;const worlds=remoteWorlds&&Array.isArray(remoteWorlds.worlds)?remoteWorlds.worlds:[];let max=0;worlds.forEach(w=>{const m=String(w.id||'').match(/^world-(\d+)$/);if(m)max=Math.max(max,Number(m[1]))});setup.world.id=max?('world-'+String(max+1).padStart(3,'0')):('world-'+String(Date.now()));return setup.world.id}
function getToken(){return sessionStorage.getItem(TOKEN_SESSION_KEY)||localStorage.getItem(TOKEN_LOCAL_KEY)||''}
function utf8ToBase64(text){const bytes=new TextEncoder().encode(text);let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(binary)}
async function api(path,options={},token=getToken()){const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(options.headers||{})};if(token)headers.Authorization='Bearer '+token;const r=await fetch(API+path,{...options,headers});let body=null;try{body=await r.json()}catch(e){}if(!r.ok){const e=new Error((body&&body.message)||('GitHub API '+r.status));e.status=r.status;throw e}return body}
async function getRemoteJson(path,token){const p=path.split('/').map(encodeURIComponent).join('/');try{const f=await api('/contents/'+p+'?ref='+encodeURIComponent(BRANCH),{},token);const raw=(f.content||'').replace(/\n/g,'');const bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));const text=new TextDecoder().decode(bytes);return{data:JSON.parse(text),sha:f.sha||null}}catch(e){if(e.status===404)return{data:null,sha:null};throw e}}
async function putJson(path,data,token,message){const p=path.split('/').map(encodeURIComponent).join('/');for(let attempt=0;attempt<2;attempt++){const cur=await getRemoteJson(path,token);const payload={message,branch:BRANCH,content:utf8ToBase64(JSON.stringify(data,null,2)+'\n')};if(cur.sha)payload.sha=cur.sha;try{return await api('/contents/'+p,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)},token)}catch(e){if((e.status===409||e.status===422)&&attempt===0)continue;throw e}}}
async function syncGithub(){const token=getToken();if(!token)return{ok:false,reason:'no_token'};const now=ch.updatedAt,worldId=chooseWorldId(),playId='play-'+safeId(ch.id),cid=safeId(ch.id);ch.worldId=worldId;ch.playId=playId;
  const charDoc={format:'ironsworn-character-save-v1',id:ch.id,name:ch.name,updatedAt:now,character:{stats:ch.stats,tracks:ch.tracks,vow:ch.vow,assets:ch.assets,tattoos:ch.tattoos||{},createdAt:ch.createdAt}};
  const setupDoc={format:'ironsworn-character-setup-v1',characterId:ch.id,name:ch.name,updatedAt:now,profile:setup.profile,equipment:setup.equipment,worldId,playId,bonds:ch.bonds,backgroundVow:ch.backgroundVow,incitingIncident:setup.incitingIncident,sceneMode:setup.sceneMode,incitingVow:ch.vow};
  const worldDoc={format:'ironsworn-world-v1',id:worldId,name:setup.world.name,status:'active',basicTruths:setup.world.truths,startLocation:setup.world.startLocation,createdAt:setup.createdAt,updatedAt:now};
  const stateDoc={format:'ironsworn-world-state-v1',worldId,updatedAt:now,status:'campaign_started',currentLocation:setup.world.startLocation,changes:[]};
  const playDoc={format:'ironsworn-play-state-v1',id:playId,characterId:ch.id,worldId,status:'in_progress',updatedAt:now,scene:{number:1,mode:setup.sceneMode,location:setup.world.startLocation,incitingIncident:setup.incitingIncident,pendingMove:'Swear an Iron Vow'},backgroundVow:ch.backgroundVow,currentVow:ch.vow,bonds:ch.bonds};
  const hist={format:'ironsworn-play-history-v1',playId,events:[{at:now,type:'campaign_setup',text:'キャラクター作成とキャンペーン準備を完了。最初の誓いを立てる場面から開始。'}]};
  const noteDoc={format:'ironsworn-character-note-v1',characterId:ch.id,name:ch.name,updatedAt:now,text:ch.notes||''};
  await putJson('saves/characters/'+cid+'.json',charDoc,token,'Create character from setup: '+ch.name);
  await putJson('saves/setup/'+cid+'.json',setupDoc,token,'Save campaign setup: '+ch.name);
  await putJson('saves/notes/'+cid+'.json',noteDoc,token,'Initialize character note: '+ch.name);
  await putJson('worlds/'+worldId+'/world.json',worldDoc,token,'Create world: '+setup.world.name);
  await putJson('worlds/'+worldId+'/state.json',stateDoc,token,'Initialize world state: '+setup.world.name);
  await putJson('plays/'+cid+'/current.json',playDoc,token,'Create play state: '+ch.name);
  await putJson('plays/'+cid+'/history.json',hist,token,'Initialize play history: '+ch.name);
  const ci=await getRemoteJson('saves/characters/index.json',token),cidx=(ci.data&&Array.isArray(ci.data.characters))?ci.data:{format:'ironsworn-character-index-v1',characters:[]};const centry={id:ch.id,name:ch.name,path:'saves/characters/'+cid+'.json',updatedAt:now};const cp=cidx.characters.findIndex(x=>x&&x.id===ch.id);if(cp>=0)cidx.characters[cp]=centry;else cidx.characters.push(centry);cidx.latestCharacterId=ch.id;cidx.latestPath=centry.path;cidx.updatedAt=now;await putJson('saves/characters/index.json',cidx,token,'Update character index');await putJson('saves/characters/latest.json',charDoc,token,'Update latest character save');
  const wi=await getRemoteJson('worlds/index.json',token),widx=(wi.data&&Array.isArray(wi.data.worlds))?wi.data:{format:'ironsworn-world-index-v1',worlds:[]};const wentry={id:worldId,name:setup.world.name,status:'active',path:'worlds/'+worldId+'/world.json',statePath:'worlds/'+worldId+'/state.json',characterIds:[ch.id],playIds:[playId]};const wp=widx.worlds.findIndex(x=>x&&x.id===worldId);if(wp>=0)widx.worlds[wp]=wentry;else widx.worlds.push(wentry);widx.updatedAt=now;await putJson('worlds/index.json',widx,token,'Register world: '+setup.world.name);
  const pi=await getRemoteJson('plays/index.json',token),pidx=(pi.data&&Array.isArray(pi.data.plays))?pi.data:{format:'ironsworn-play-index-v1',plays:[]};const pentry={id:playId,name:ch.name+'のプレイ',characterId:ch.id,worldId,status:'in_progress',currentPath:'plays/'+cid+'/current.json',historyPath:'plays/'+cid+'/history.json'};const pp=pidx.plays.findIndex(x=>x&&x.id===playId);if(pp>=0)pidx.plays[pp]=pentry;else pidx.plays.push(pentry);pidx.updatedAt=now;await putJson('plays/index.json',pidx,token,'Register play: '+ch.name);
  return{ok:true,worldId,playId}}
function saveLocalFinal(){chooseWorldId();const bonds=setup.bonds.filter(Boolean).map(name=>({name,ticks:1,background:true}));ch.profile=setup.profile;ch.equipment=setup.equipment;ch.bonds=bonds;ch.backgroundVow={title:setup.backgroundVow.title,rank:setup.backgroundVow.rank,progress:0,status:'active'};ch.vow={title:setup.incitingVow.title,rank:setup.incitingVow.rank,progress:0,status:'active'};ch.worldId=setup.world.id;ch.playId='play-'+safeId(ch.id);ch.updatedAt=new Date().toISOString();ch.notes=[setup.profile&&('人物像・性格・背景\n'+setup.profile),setup.equipment&&('持ち物・装備\n'+setup.equipment)].filter(Boolean).join('\n\n');const saves=readJson(localStorage,SAVES_KEY,{});saves[ch.id]=clone(ch);localStorage.setItem(SAVES_KEY,JSON.stringify(saves));localStorage.setItem(ACTIVE_KEY,ch.id);const notes=readJson(localStorage,NOTES_KEY,{});notes[ch.id]=ch.notes;localStorage.setItem(NOTES_KEY,JSON.stringify(notes));setup.status='complete';setup.updatedAt=ch.updatedAt;sessionStorage.setItem(DRAFT_KEY,JSON.stringify({id:ch.id,character:ch}));sessionStorage.setItem(SETUP_KEY,JSON.stringify(setup))}
async function finish(){saveLocalFinal();next.disabled=true;const s=$('syncStatus');if(s)s.textContent='保存しています…';let result=null;try{result=await syncGithub();if(s)s.textContent=result.ok?'GitHubにも保存しました。':'端末に保存しました。GitHub保存は次のセーブ時に行えます。'}catch(e){if(s)s.textContent='端末には保存しました。GitHub保存だけ失敗しました：'+e.message}sessionStorage.removeItem(SETUP_ACTIVE_KEY);setTimeout(()=>location.href='index.html#game',result&&result.ok?650:1100)}
next.onclick=async()=>{capture();const msg=validate();if(msg){error.textContent=msg;return}if(setup.step<8){setup.step++;writeDraft();render();window.scrollTo(0,0)}else await finish()};
back.onclick=()=>{capture();if(setup.step>1){setup.step--;writeDraft();render();window.scrollTo(0,0)}};
exit.onclick=()=>{if(confirm('作成途中の内容を終了しますか？')){sessionStorage.removeItem(SETUP_ACTIVE_KEY);sessionStorage.removeItem(SETUP_KEY);sessionStorage.removeItem(DRAFT_KEY);location.href='index.html'}};
load();loadWorldIndex();render();
})();
