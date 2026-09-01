(()=>{'use strict';
const TOKEN_KEY='ironsworn-private-save-token-v1';
const LOADED_KEY='ironsworn-private-loaded-save-v1';
const OWNER='namiyukuta-cmd',REPO='private-game-data',BRANCH='main',ROOT='ironsworn-solo';
const API='https://api.github.com/repos/'+OWNER+'/'+REPO;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let save=null;try{save=JSON.parse(sessionStorage.getItem(LOADED_KEY)||'null')}catch(e){}
if(!save||!save.character){location.replace('continue.html');return}
const c=save.character;c.stats=c.stats||{};c.tracks=c.tracks||{};c.vow=c.vow||{title:'未設定',progress:0};c.assets=Array.isArray(c.assets)?c.assets:[];c.log=Array.isArray(c.log)?c.log:[];
function persistLocal(){c.updatedAt=new Date().toISOString();save.character=c;save.name=c.name||save.name;sessionStorage.setItem(LOADED_KEY,JSON.stringify(save))}
function clamp(n,a,b){return Math.max(a,Math.min(b,Number(n)||0))}
function render(){
 $('charName').textContent=c.name||save.name||'主人公';
 const statKeys=['edge','heart','iron','shadow','wits'];$('stats').innerHTML=statKeys.map(k=>'<div class="stat"><small>'+k.toUpperCase()+'</small><b>'+esc(c.stats[k]??'')+'</b></div>').join('');
 const trackDefs=[['health','体力',0,5],['spirit','気力',0,5],['supply','補給',0,5],['momentum','モメンタム',-6,10],['xp','XP',0,99]];
 $('tracks').innerHTML=trackDefs.map(([k,label,min,max])=>'<div class="track"><small>'+label+'</small><div class="track-row"><button type="button" data-track="'+k+'" data-d="-1" data-min="'+min+'" data-max="'+max+'">−</button><b>'+esc(c.tracks[k]??0)+'</b><button type="button" data-track="'+k+'" data-d="1" data-min="'+min+'" data-max="'+max+'">＋</button></div></div>').join('');
 document.querySelectorAll('[data-track]').forEach(b=>b.onclick=()=>{const k=b.dataset.track;c.tracks[k]=clamp((Number(c.tracks[k])||0)+Number(b.dataset.d),Number(b.dataset.min),Number(b.dataset.max));persistLocal();render()});
 $('vowTitle').textContent=c.vow.title||'未設定';c.vow.progress=clamp(c.vow.progress,0,10);$('vowProgress').textContent=c.vow.progress;$('vowTrack').innerHTML=Array.from({length:10},(_,i)=>'<i class="'+(i<c.vow.progress?'on':'')+'"></i>').join('');
 const setup=c.setup||{},world=setup.world||{};$('openingScene').textContent=setup.openingScene||world.startLocation||'未設定';$('incident').textContent=setup.incitingIncident||'未設定';
 $('assetList').innerHTML=c.assets.length?c.assets.map(a=>'<article class="asset-card"><strong>'+esc(a.name||'アセット')+'</strong><span>'+esc(a.type||'ASSET')+'</span>'+(a.summary?'<p>'+esc(a.summary)+'</p>':'')+'</article>').join(''):'<div class="empty">アセットはありません。</div>';
 $('logList').innerHTML=c.log.length?c.log.slice().reverse().map(x=>'<article class="log-entry"><time>'+esc(x.at?new Date(x.at).toLocaleString('ja-JP'):'')+'</time><p>'+esc(x.text||'')+'</p></article>').join(''):'<div class="empty">記録はまだありません。</div>';
}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('[data-panel]').forEach(p=>p.classList.toggle('on',p.dataset.panel===b.dataset.tab))});
document.querySelectorAll('[data-vow]').forEach(b=>b.onclick=()=>{c.vow.progress=clamp((Number(c.vow.progress)||0)+Number(b.dataset.vow),0,10);persistLocal();render()});
$('addLogBtn').onclick=()=>{const t=$('logText').value.trim();if(!t)return;c.log.push({at:new Date().toISOString(),text:t});$('logText').value='';persistLocal();render()};
$('homeBtn').onclick=()=>location.href='index.html';
function token(){return localStorage.getItem(TOKEN_KEY)||''}
function utf8b64(text){const bytes=new TextEncoder().encode(text);let out='';for(let i=0;i<bytes.length;i+=32768)out+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(out)}
async function request(path,opt={}){const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(opt.headers||{})};if(token())headers.Authorization='Bearer '+token();const r=await fetch(API+path,{...opt,headers,cache:'no-store'});let body=null;try{body=await r.json()}catch(e){}if(!r.ok){const e=new Error((body&&body.message)||('GitHub API '+r.status));e.status=r.status;throw e}return body}
async function getFile(path){const p=path.split('/').map(encodeURIComponent).join('/');try{return await request('/contents/'+p+'?ref='+encodeURIComponent(BRANCH))}catch(e){if(e.status===404)return null;throw e}}
async function readJson(path,fallback){const f=await getFile(path);if(!f)return fallback;const raw=(f.content||'').replace(/\n/g,'');const bytes=Uint8Array.from(atob(raw),x=>x.charCodeAt(0));try{return JSON.parse(new TextDecoder().decode(bytes))}catch(e){return fallback}}
async function putJson(path,obj,message){const old=await getFile(path),p=path.split('/').map(encodeURIComponent).join('/');const payload={message,content:utf8b64(JSON.stringify(obj,null,2)),branch:BRANCH};if(old?.sha)payload.sha=old.sha;return request('/contents/'+p,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})}
$('saveBtn').onclick=async()=>{const status=$('status'),btn=$('saveBtn');if(!token()){status.textContent='Private Game用GitHubトークンがありません。';return}persistLocal();btn.disabled=true;btn.textContent='保存中…';status.textContent='';try{const now=new Date().toISOString();save.savedAt=now;save.name=c.name||save.name;save.character=c;if(!save.path)save.path=ROOT+'/'+String(save.id||c.id||'character').replace(/[^A-Za-z0-9._-]/g,'-')+'/save_0001.json';await putJson(save.path,save,'Update Ironsworn private game: '+(save.name||'character'));const index=await readJson(ROOT+'/index.json',{format:'ironsworn-private-save-index-v1',saves:[]});index.saves=Array.isArray(index.saves)?index.saves:[];const item={id:save.id||c.id,name:save.name,path:save.path,updatedAt:now};const i=index.saves.findIndex(x=>x.id===item.id);if(i>=0)index.saves[i]=item;else index.saves.unshift(item);index.updatedAt=now;await putJson(ROOT+'/index.json',index,'Update Ironsworn private save index');persistLocal();status.textContent='保存しました。';btn.textContent='保存済み';setTimeout(()=>{btn.textContent='SAVE';status.textContent='';btn.disabled=false},1000)}catch(e){status.textContent='保存失敗：'+e.message;btn.textContent='SAVE';btn.disabled=false}};
persistLocal();render();
})();