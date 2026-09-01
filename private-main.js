(()=>{'use strict';
const TOKEN_KEY='ironsworn-private-save-token-v1';
const LOADED_KEY='ironsworn-private-loaded-save-v1';
const OWNER='namiyukuta-cmd',REPO='private-game-data',BRANCH='main',ROOT='ironsworn-solo';
const API='https://api.github.com/repos/'+OWNER+'/'+REPO;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let save=null;try{save=JSON.parse(sessionStorage.getItem(LOADED_KEY)||'null')}catch(e){}
if(!save||!save.character){location.replace('continue.html');return}
const c=save.character;
c.stats=c.stats||{};
c.tracks=c.tracks||{};
c.vow=c.vow||{title:'未設定',progress:0};
c.assets=Array.isArray(c.assets)?c.assets:[];
c.log=Array.isArray(c.log)?c.log:[];
c.inventory=Array.isArray(c.inventory)?c.inventory:[];
const setup=c.setup||{};
const world=setup.world||{};
function persistLocal(){c.updatedAt=new Date().toISOString();save.character=c;save.name=c.name||save.name;sessionStorage.setItem(LOADED_KEY,JSON.stringify(save))}
function clamp(n,a,b){return Math.max(a,Math.min(b,Number(n)||0))}
function textOr(v,fallback='未設定'){const s=String(v??'').trim();return s&&s!=='未設定'?s:fallback}
function bondNames(){return (Array.isArray(c.bonds)?c.bonds:[]).map(x=>typeof x==='string'?x:(x&&x.name)||'').filter(Boolean)}
function meter(el,count,on){if(!el)return;el.innerHTML=Array.from({length:count},(_,i)=>'<i class="'+(i<on?'on':'')+'"></i>').join('')}
function abilityHtml(a){const abilities=Array.isArray(a.abilities)?a.abilities:[];if(!abilities.length)return'';return abilities.map(x=>{const label=Array.isArray(x)?x[0]:(x.label||'能力');const active=Array.isArray(x)?!!x[1]:!!x.active;const desc=Array.isArray(x)?x[2]:(x.description||'');return '<div class="ability">'+(active?'● ':'○ ')+'<b>'+esc(label)+'</b>'+(desc?'<div>'+esc(desc)+'</div>':'')+'</div>'}).join('')}
function currentQuest(){const q=c.aiQuest||c.quest||null;if(q&&typeof q==='object')return{title:textOr(q.title,c.vow.title||'現在のクエスト'),text:textOr(q.text||q.description,setup.incitingIncident||setup.openingScene||c.vow.title||'まだクエストはありません。')};return{title:textOr(c.vow.title,'現在のクエスト'),text:textOr(setup.incitingIncident||setup.openingScene||c.vow.title,'まだクエストはありません。')}}
function renderStats(){const labels={edge:'EDGE',heart:'HEART',iron:'IRON',shadow:'SHADOW',wits:'WITS'};$('stats').innerHTML=['edge','heart','iron','shadow','wits'].map(k=>'<div class="stat"><small>'+labels[k]+'</small><b>'+esc(c.stats[k]??'')+'</b></div>').join('')}
function renderResources(){c.tracks.health=clamp(c.tracks.health??5,0,5);c.tracks.spirit=clamp(c.tracks.spirit??5,0,5);c.tracks.supply=clamp(c.tracks.supply??5,0,5);c.tracks.momentum=clamp(c.tracks.momentum??2,-6,10);$('healthValue').textContent=c.tracks.health+'/5';$('spiritValue').textContent=c.tracks.spirit+'/5';$('supplyValue').textContent=c.tracks.supply+'/5';$('momentumValue').textContent=c.tracks.momentum;meter($('momentumMeter'),16,c.tracks.momentum+6)}
function renderVow(){c.vow.progress=clamp(c.vow.progress,0,10);$('vowProgress').textContent=c.vow.progress+'/10';$('vowTitleInline').textContent=textOr(c.vow.title);meter($('vowMeter'),10,c.vow.progress)}
function renderQuest(){const q=currentQuest();$('questTitle').textContent=q.title;$('questText').textContent=q.text}
function renderAbout(){const bonds=bondNames();$('aboutContent').innerHTML='<h2>'+esc(c.name||save.name||'主人公')+'</h2>'+
  '<div class="info-row"><small>人物像・背景</small><p>'+esc(textOr(c.profile||c.notes,'まだ決めていません。'))+'</p></div>'+
  '<div class="info-row"><small>世界</small><p>'+esc(textOr(world.name,'まだ決めていません。'))+'</p></div>'+
  '<div class="info-row"><small>開始地点</small><p>'+esc(textOr(world.startLocation,'まだ決めていません。'))+'</p></div>'+
  '<div class="info-row"><small>絆</small><p>'+esc(bonds.length?bonds.join(' / '):'まだありません。')+'</p></div>'}
function renderEquipment(){$('equipmentContent').innerHTML='<h2>装備</h2><div class="info-row"><p>'+esc(textOr(c.equipment,'まだ登録されていません。'))+'</p></div>'}
function renderInventory(){$('inventoryContent').innerHTML='<h2>所持品</h2>'+(c.inventory.length?c.inventory.map(x=>{const name=typeof x==='string'?x:(x.name||'所持品');const qty=typeof x==='object'&&x.qty!=null?' × '+x.qty:'';return '<div class="inventory-card"><strong>'+esc(name+qty)+'</strong></div>'}).join(''):'<div class="empty">所持品はまだありません。</div>')}
function renderSkills(){$('skillList').innerHTML='<h2>スキル / アセット</h2>'+(c.assets.length?c.assets.map(a=>'<article class="asset-card"><strong>'+esc(a.name||'アセット')+'</strong><span>'+esc(a.type||'ASSET')+'</span>'+(a.summary?'<p>'+esc(a.summary)+'</p>':'')+abilityHtml(a)+'</article>').join(''):'<div class="empty">スキルはまだありません。</div>')}
function renderRoad(){$('roadContent').innerHTML='<h2>ROAD</h2>'+
  '<div class="info-row"><small>現在地 / 開始地点</small><p>'+esc(textOr(world.startLocation,'未設定'))+'</p></div>'+
  '<div class="info-row"><small>開始場面</small><p>'+esc(textOr(setup.openingScene,'未設定'))+'</p></div>'+
  '<div class="info-row"><small>発端事件</small><p>'+esc(textOr(setup.incitingIncident,'未設定'))+'</p></div>'}
function renderLog(){$('logList').innerHTML=c.log.length?c.log.slice().reverse().map(x=>'<article class="log-entry"><time>'+esc(x.at?new Date(x.at).toLocaleString('ja-JP'):'')+'</time><p>'+esc(x.text||'')+'</p></article>').join(''):'<div class="empty">記録はまだありません。</div>'}
function renderAll(){$('charName').textContent=c.name||save.name||'主人公';renderStats();renderResources();renderVow();renderQuest();renderAbout();renderEquipment();renderInventory();renderSkills();renderRoad();renderLog()}
function openPanel(name){document.querySelectorAll('[data-panel]').forEach(p=>p.classList.toggle('on',p.dataset.panel===name));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===name));const labels={quest:['AI QUEST','クエスト'],about:['PROFILE','自分について'],equipment:['EQUIPMENT','装備'],inventory:['ITEM','所持品'],skills:['SKILL','スキル'],road:['ROAD','道のり'],log:['RoG','記録']};const label=labels[name]||labels.quest;$('stageKicker').textContent=label[0];$('stageTitle').textContent=label[1]}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>openPanel(b.dataset.tab));
document.querySelectorAll('[data-track]').forEach(b=>b.onclick=()=>{const k=b.dataset.track,d=Number(b.dataset.d);const ranges={health:[0,5],spirit:[0,5],supply:[0,5],momentum:[-6,10],xp:[0,99]};const r=ranges[k]||[0,99];c.tracks[k]=clamp((Number(c.tracks[k])||0)+d,r[0],r[1]);persistLocal();renderResources()});
document.querySelectorAll('[data-vow]').forEach(b=>b.onclick=()=>{c.vow.progress=clamp((Number(c.vow.progress)||0)+Number(b.dataset.vow),0,10);persistLocal();renderVow()});
$('roadBtn').onclick=()=>openPanel('road');
$('rogBtn').onclick=()=>openPanel('log');
$('addLogBtn').onclick=()=>{const t=$('logText').value.trim();if(!t)return;c.log.push({at:new Date().toISOString(),text:t});$('logText').value='';persistLocal();renderLog()};
$('homeBtn').onclick=()=>location.href='index.html';
function token(){return localStorage.getItem(TOKEN_KEY)||''}
function utf8b64(text){const bytes=new TextEncoder().encode(text);let out='';for(let i=0;i<bytes.length;i+=32768)out+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(out)}
async function request(path,opt={}){const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(opt.headers||{})};if(token())headers.Authorization='Bearer '+token();const r=await fetch(API+path,{...opt,headers,cache:'no-store'});let body=null;try{body=await r.json()}catch(e){}if(!r.ok){const e=new Error((body&&body.message)||('GitHub API '+r.status));e.status=r.status;throw e}return body}
async function getFile(path){const p=path.split('/').map(encodeURIComponent).join('/');try{return await request('/contents/'+p+'?ref='+encodeURIComponent(BRANCH))}catch(e){if(e.status===404)return null;throw e}}
async function readJson(path,fallback){const f=await getFile(path);if(!f)return fallback;const raw=(f.content||'').replace(/\n/g,'');const bytes=Uint8Array.from(atob(raw),x=>x.charCodeAt(0));try{return JSON.parse(new TextDecoder().decode(bytes))}catch(e){return fallback}}
async function putJson(path,obj,message){const old=await getFile(path),p=path.split('/').map(encodeURIComponent).join('/');const payload={message,content:utf8b64(JSON.stringify(obj,null,2)),branch:BRANCH};if(old?.sha)payload.sha=old.sha;return request('/contents/'+p,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})}
$('saveBtn').onclick=async()=>{const status=$('status'),btn=$('saveBtn');if(!token()){status.textContent='Private Game用GitHubトークンがありません。';return}persistLocal();btn.disabled=true;btn.textContent='…';status.textContent='';try{const now=new Date().toISOString();save.savedAt=now;save.name=c.name||save.name;save.character=c;if(!save.path)save.path=ROOT+'/'+String(save.id||c.id||'character').replace(/[^A-Za-z0-9._-]/g,'-')+'/save_0001.json';await putJson(save.path,save,'Update Ironsworn private game: '+(save.name||'character'));const index=await readJson(ROOT+'/index.json',{format:'ironsworn-private-save-index-v1',saves:[]});index.saves=Array.isArray(index.saves)?index.saves:[];const item={id:save.id||c.id,name:save.name,path:save.path,updatedAt:now};const i=index.saves.findIndex(x=>x.id===item.id);if(i>=0)index.saves[i]=item;else index.saves.unshift(item);index.updatedAt=now;await putJson(ROOT+'/index.json',index,'Update Ironsworn private save index');persistLocal();status.textContent='保存しました';btn.textContent='OK';setTimeout(()=>{btn.textContent='SAVE';status.textContent='';btn.disabled=false},900)}catch(e){status.textContent='保存失敗：'+e.message;btn.textContent='SAVE';btn.disabled=false}};
persistLocal();renderAll();openPanel('quest');
})();