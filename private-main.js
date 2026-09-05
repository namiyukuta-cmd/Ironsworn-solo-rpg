(()=>{'use strict';
const TOKEN_KEY='ironsworn-private-save-token-v1';
const LOADED_KEY='ironsworn-private-loaded-save-v1';
const OWNER='namiyukuta-cmd',REPO='private-game-data',BRANCH='main',ROOT='ironsworn-solo';
const API='https://api.github.com/repos/'+OWNER+'/'+REPO;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
let save=read();
if(!save?.character){location.replace('continue.html');return}
let c=save.character;

function read(){try{return JSON.parse(sessionStorage.getItem(LOADED_KEY)||'null')}catch(e){return null}}
function refreshState(){const latest=read();if(latest?.character){save=latest;c=save.character}normalizeState()}
function normalizeState(){
 c.stats=c.stats||{};
 c.tracks=c.tracks||{};
 c.vow=c.vow||{title:'未設定',progress:0};
 c.assets=Array.isArray(c.assets)?c.assets:[];
 c.log=Array.isArray(c.log)?c.log:[];
 c.inventory=Array.isArray(c.inventory)?c.inventory:[];
 c.quests=Array.isArray(c.quests)?c.quests:[];
}
function persistLocal(){normalizeState();c.updatedAt=new Date().toISOString();save.character=c;save.name=c.name||save.name;sessionStorage.setItem(LOADED_KEY,JSON.stringify(save))}
function textOr(v,fallback='未設定'){const s=String(v??'').trim();return s&&s!=='未設定'?s:fallback}
function meter(el,count,on){if(!el)return;el.innerHTML=Array.from({length:count},(_,i)=>'<i class="'+(i<on?'on':'')+'"></i>').join('')}
function bondNames(){return(Array.isArray(c.bonds)?c.bonds:[]).map(x=>typeof x==='string'?x:(x&&x.name)||'').filter(Boolean)}
function abilityHtml(a){const abilities=Array.isArray(a.abilities)?a.abilities:[];return abilities.map(x=>{const label=Array.isArray(x)?x[0]:(x.label||'能力');const active=Array.isArray(x)?!!x[1]:!!x.active;const desc=Array.isArray(x)?x[2]:(x.description||'');return'<div class="ability">'+(active?'● ':'○ ')+'<b>'+esc(label)+'</b>'+(desc?'<div>'+esc(desc)+'</div>':'')+'</div>'}).join('')}

function renderStats(){const labels={edge:'EDGE',heart:'HEART',iron:'IRON',shadow:'SHADOW',wits:'WITS'};$('stats').innerHTML=['edge','heart','iron','shadow','wits'].map(k=>'<div class="stat"><small>'+labels[k]+'</small><b>'+esc(c.stats[k]??'')+'</b></div>').join('')}
function renderResources(){
 c.tracks.health=clamp(c.tracks.health??5,0,5);
 c.tracks.spirit=clamp(c.tracks.spirit??5,0,5);
 c.tracks.momentum=clamp(c.tracks.momentum??2,-6,10);
 $('healthValue').textContent=c.tracks.health+'/5';
 $('spiritValue').textContent=c.tracks.spirit+'/5';
 if($('healthSelect'))$('healthSelect').value=String(c.tracks.health);
 if($('spiritSelect'))$('spiritSelect').value=String(c.tracks.spirit);
 if($('healthBar'))$('healthBar').style.width=(c.tracks.health/5*100)+'%';
 if($('spiritBar'))$('spiritBar').style.width=(c.tracks.spirit/5*100)+'%';
 $('momentumValue').textContent=c.tracks.momentum;
 if($('momentumBar'))$('momentumBar').style.width=((c.tracks.momentum+6)/16*100)+'%';
}
function renderVow(){
 c.vow.progress=clamp(c.vow.progress,0,10);
 const progress=$('vowProgress'),vowMeter=$('vowMeter');
 if(progress)progress.textContent=c.vow.progress+'/10';
 if(vowMeter)meter(vowMeter,10,c.vow.progress)
}
function renderAbout(){const setup=c.setup||{},world=setup.world||{},bonds=bondNames();$('aboutContent').innerHTML='<h2>'+esc(c.name||save.name||'主人公')+'</h2><div class="info-row"><small>人物像・背景</small><p>'+esc(textOr(c.profile||c.notes,'まだ決めていません。'))+'</p></div><div class="info-row"><small>世界</small><p>'+esc(textOr(world.name,'まだ決めていません。'))+'</p></div><div class="info-row"><small>開始地点</small><p>'+esc(textOr(world.startLocation,'まだ決めていません。'))+'</p></div><div class="info-row"><small>絆</small><p>'+esc(bonds.length?bonds.join(' / '):'まだありません。')+'</p></div>'}
function renderEquipment(){$('equipmentContent').innerHTML='<h2>装備</h2><div class="info-row"><p>'+esc(textOr(c.equipment,'まだ登録されていません。'))+'</p></div>'}
function renderInventory(){$('inventoryContent').innerHTML='<h2>所持品</h2>'+(c.inventory.length?c.inventory.map(x=>{const name=typeof x==='string'?x:(x.name||'所持品');const qty=typeof x==='object'&&x.qty!=null?' × '+x.qty:'';return'<div class="inventory-card"><strong>'+esc(name+qty)+'</strong></div>'}).join(''):'<div class="empty">所持品はまだありません。</div>')}
function renderSkills(){$('skillList').innerHTML='<h2>スキル / アセット</h2>'+(c.assets.length?c.assets.map(a=>'<article class="asset-card"><strong>'+esc(a.name||'アセット')+'</strong><span>'+esc(a.type||'ASSET')+'</span>'+(a.summary?'<p>'+esc(a.summary)+'</p>':'')+abilityHtml(a)+'</article>').join(''):'<div class="empty">スキルはまだありません。</div>')}
function renderRoad(){const setup=c.setup||{},world=setup.world||{};$('roadContent').innerHTML='<h2>ROAD</h2><div class="info-row"><small>現在地 / 開始地点</small><p>'+esc(textOr(world.startLocation,'未設定'))+'</p></div><div class="info-row"><small>開始場面</small><p>'+esc(textOr(setup.openingScene,'未設定'))+'</p></div><div class="info-row"><small>発端事件</small><p>'+esc(textOr(setup.incitingIncident,'未設定'))+'</p></div>'}
function renderLog(){$('logList').innerHTML=c.log.length?c.log.slice().reverse().map(x=>'<article class="log-entry"><time>'+esc(x.at?new Date(x.at).toLocaleString('ja-JP'):'')+'</time><p>'+esc(x.text||'')+'</p></article>').join(''):'<div class="empty">記録はまだありません。</div>'}
function renderAll(){
 refreshState();
 $('charName').textContent=c.name||save.name||'主人公';
 const rawLevel=Number(c.level??c.tracks.level??1);
 $('levelValue').textContent=Number.isFinite(rawLevel)&&rawLevel>0?Math.floor(rawLevel):1;
 renderStats();renderResources();renderVow();renderAbout();renderEquipment();renderInventory();renderSkills();renderRoad();renderLog()
}

function openPanel(name){
 document.querySelectorAll('[data-panel]').forEach(p=>p.classList.toggle('on',p.dataset.panel===name));
 document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===name));
 const labels={quest:['AI QUEST','クエスト'],about:['PROFILE','自分について'],equipment:['EQUIPMENT','装備'],inventory:['ITEM','所持品'],skills:['SKILL','スキル'],road:['ROAD','道のり'],log:['LOG','記録']};
 const label=labels[name]||labels.quest;
 $('stageKicker').textContent=label[0];
 $('stageTitle').textContent=label[1];
 if(name==='quest')window.dispatchEvent(new CustomEvent('ironsworn:questopen'))
}

function setMenu(open){
 const menu=$('mainMenu'),btn=$('menuBtn');
 if(!menu||!btn)return;
 menu.classList.toggle('on',!!open);
 menu.setAttribute('aria-hidden',open?'false':'true');
 btn.setAttribute('aria-expanded',open?'true':'false')
}

function openSideTool(title,html){
 const modal=$('sideToolModal');
 $('sideToolTitle').textContent=title;
 $('sideToolBody').innerHTML=html;
 modal.classList.add('on');
 modal.setAttribute('aria-hidden','false')
}
function closeSideTool(){
 const modal=$('sideToolModal');
 modal.classList.remove('on');
 modal.setAttribute('aria-hidden','true')
}
function openVowTool(){
 refreshState();
 c.vow.progress=clamp(c.vow.progress,0,10);
 openSideTool('VOW','<div class="vow-tool-title">'+esc(textOr(c.vow.title,'現在の誓い'))+'</div><div class="vow-tool-progress"><button id="vowMinus" type="button">−</button><strong id="vowToolValue">'+c.vow.progress+'/10</strong><button id="vowPlus" type="button">＋</button></div>');
 const change=d=>{refreshState();c.vow.progress=clamp((Number(c.vow.progress)||0)+d,0,10);persistLocal();renderVow();$('vowToolValue').textContent=c.vow.progress+'/10'};
 $('vowMinus').onclick=()=>change(-1);
 $('vowPlus').onclick=()=>change(1)
}
function rollLocationOracle(){
 const table=Array.isArray(window.IRONSWORN_LOCATION_ORACLE_JA)?window.IRONSWORN_LOCATION_ORACLE_JA:[];
 if(!table.length)return{roll:'—',location:'ロケーション表を読み込めませんでした'};
 return table[Math.floor(Math.random()*table.length)]
}
function updateOracleResult(){
 const result=rollLocationOracle(),roll=$('oracleRoll'),location=$('oracleLocation');
 if(roll)roll.textContent=String(result.roll).padStart(2,'0');
 if(location)location.textContent=result.location
}
function openOracleTool(){
 openSideTool('オラクル','<div class="oracle-result"><small>d100 ロケーション</small><b id="oracleRoll">—</b><strong id="oracleLocation">—</strong></div><button id="oracleReroll" class="oracle-roll-btn" type="button">ロケーションを振る</button><p class="oracle-note">100個の日本語ロケーションから1つ選びます。</p>');
 $('oracleReroll').onclick=updateOracleResult;
 updateOracleResult()
}

document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>openPanel(b.dataset.tab));
document.querySelectorAll('[data-track]').forEach(b=>b.onclick=()=>{refreshState();const k=b.dataset.track,d=Number(b.dataset.d),ranges={health:[0,5],spirit:[0,5],momentum:[-6,10],xp:[0,99]},rr=ranges[k]||[0,99];c.tracks[k]=clamp((Number(c.tracks[k])||0)+d,rr[0],rr[1]);persistLocal();renderResources()});
document.querySelectorAll('[data-vow]').forEach(b=>b.onclick=()=>{refreshState();c.vow.progress=clamp((Number(c.vow.progress)||0)+Number(b.dataset.vow),0,10);persistLocal();renderVow()});
$('addLogBtn').onclick=()=>{refreshState();const t=$('logText').value.trim();if(!t)return;c.log.push({type:'note',at:new Date().toISOString(),text:t});$('logText').value='';persistLocal();renderLog()};
if($('vowBtn'))$('vowBtn').onclick=openVowTool;
if($('oracleBtn'))$('oracleBtn').onclick=openOracleTool;
if($('sideToolClose'))$('sideToolClose').onclick=closeSideTool;
if($('sideToolModal'))$('sideToolModal').onclick=e=>{if(e.target===$('sideToolModal'))closeSideTool()};
if($('menuBtn'))$('menuBtn').onclick=e=>{e.stopPropagation();setMenu(!$('mainMenu').classList.contains('on'))};
if($('menuHomeBtn'))$('menuHomeBtn').onclick=()=>location.href='index.html';
if($('menuLogBtn'))$('menuLogBtn').onclick=()=>{openPanel('log');setMenu(false)};
if($('menuRoadBtn'))$('menuRoadBtn').onclick=()=>{openPanel('road');setMenu(false)};
if($('menuLoadBtn'))$('menuLoadBtn').onclick=()=>location.href='continue.html';
document.addEventListener('click',e=>{const menu=$('mainMenu'),btn=$('menuBtn');if(menu?.classList.contains('on')&&!menu.contains(e.target)&&e.target!==btn)setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSideTool();setMenu(false)}});

function token(){return localStorage.getItem(TOKEN_KEY)||''}
function utf8b64(text){const bytes=new TextEncoder().encode(text);let out='';for(let i=0;i<bytes.length;i+=32768)out+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(out)}
async function request(path,opt={}){const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(opt.headers||{})};if(token())headers.Authorization='Bearer '+token();const r=await fetch(API+path,{...opt,headers,cache:'no-store'});let body=null;try{body=await r.json()}catch(e){}if(!r.ok){const e=new Error((body&&body.message)||('GitHub API '+r.status));e.status=r.status;throw e}return body}
async function getFile(path){const p=path.split('/').map(encodeURIComponent).join('/');try{return await request('/contents/'+p+'?ref='+encodeURIComponent(BRANCH))}catch(e){if(e.status===404)return null;throw e}}
async function readJson(path,fallback){const f=await getFile(path);if(!f)return fallback;const raw=(f.content||'').replace(/\n/g,'');const bytes=Uint8Array.from(atob(raw),x=>x.charCodeAt(0));try{return JSON.parse(new TextDecoder().decode(bytes))}catch(e){return fallback}}
async function putJson(path,obj,message){const old=await getFile(path),p=path.split('/').map(encodeURIComponent).join('/');const payload={message,content:utf8b64(JSON.stringify(obj,null,2)),branch:BRANCH};if(old?.sha)payload.sha=old.sha;return request('/contents/'+p,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})}

async function saveCurrent(){
 const status=$('status'),btn=$('menuSaveBtn');
 if(!token()){status.textContent='Private Game用GitHubトークンがありません。';setMenu(false);return}
 refreshState();persistLocal();btn.disabled=true;btn.textContent='保存中…';status.textContent='';
 try{
  const now=new Date().toISOString();
  save.savedAt=now;save.name=c.name||save.name;save.character=c;
  if(!save.path)save.path=ROOT+'/'+String(save.id||c.id||'character').replace(/[^A-Za-z0-9._-]/g,'-')+'/save_0001.json';
  await putJson(save.path,save,'Update Ironsworn private game: '+(save.name||'character'));
  const index=await readJson(ROOT+'/index.json',{format:'ironsworn-private-save-index-v1',saves:[]});
  index.saves=Array.isArray(index.saves)?index.saves:[];
  const item={id:save.id||c.id,name:save.name,path:save.path,updatedAt:now};
  const i=index.saves.findIndex(x=>x.id===item.id);
  if(i>=0)index.saves[i]=item;else index.saves.unshift(item);
  index.updatedAt=now;
  await putJson(ROOT+'/index.json',index,'Update Ironsworn private save index');
  persistLocal();status.textContent='保存しました';btn.textContent='保存済み';
  setMenu(false);
  setTimeout(()=>{btn.textContent='SAVE';status.textContent='';btn.disabled=false},900)
 }catch(e){status.textContent='保存失敗：'+e.message;btn.textContent='SAVE';btn.disabled=false;setMenu(false)}
}
if($('menuSaveBtn'))$('menuSaveBtn').onclick=saveCurrent;

window.addEventListener('ironsworn:statechange',()=>{renderAll()});
normalizeState();persistLocal();renderAll();openPanel('road');
})();
