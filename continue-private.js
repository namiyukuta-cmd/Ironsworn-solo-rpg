(()=>{'use strict';
const TOKEN_KEY='ironsworn-private-save-token-v1';
const LOADED_KEY='ironsworn-private-loaded-save-v1';
const OWNER='namiyukuta-cmd',REPO='private-game-data',BRANCH='main',ROOT='ironsworn-solo';
const API='https://api.github.com/repos/'+OWNER+'/'+REPO;
const $=id=>document.getElementById(id),status=$('status'),list=$('saveList');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function getToken(){return localStorage.getItem(TOKEN_KEY)||''}
async function request(path){const token=getToken();const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};if(token)headers.Authorization='Bearer '+token;const r=await fetch(API+path,{headers,cache:'no-store'});let body=null;try{body=await r.json()}catch(e){}if(!r.ok){const e=new Error((body&&body.message)||('GitHub API '+r.status));e.status=r.status;throw e}return body}
function decode(content){const raw=(content||'').replace(/\n/g,'');const bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));return new TextDecoder().decode(bytes)}
async function readJson(path){const p=path.split('/').map(encodeURIComponent).join('/');const f=await request('/contents/'+p+'?ref='+encodeURIComponent(BRANCH));return JSON.parse(decode(f.content))}
async function loadIndex(){
  if(!getToken()){status.textContent='GitHubトークンを入力してください。';list.innerHTML='';return}
  status.textContent='Private Gameを読み込んでいます…';list.innerHTML='';
  try{
    const index=await readJson(ROOT+'/index.json');
    const saves=Array.isArray(index.saves)?index.saves:[];
    if(!saves.length){status.textContent='Private Gameのセーブはまだありません。';return}
    list.innerHTML=saves.map((s,i)=>'<article class="save-card"><div><strong>'+esc(s.name||'主人公')+'</strong><span>'+esc(s.updatedAt?new Date(s.updatedAt).toLocaleString('ja-JP'):'')+'</span></div><button type="button" data-load="'+i+'">続きから</button></article>').join('');
    list.querySelectorAll('[data-load]').forEach(btn=>btn.onclick=async()=>{
      const item=saves[Number(btn.dataset.load)];
      btn.disabled=true;btn.textContent='読込中…';status.textContent='セーブを読み込んでいます…';
      try{
        const save=await readJson(item.path);
        sessionStorage.setItem(LOADED_KEY,JSON.stringify(save));
        location.href='private-main.html';
      }catch(e){status.textContent='読み込み失敗：'+e.message;btn.disabled=false;btn.textContent='続きから'}
    });
    status.textContent=saves.length+'件のPrivate Gameセーブがあります。';
  }catch(e){status.textContent=e.status===404?'Private Gameのセーブはまだありません。':'読み込み失敗：'+e.message}
}
$('connectBtn').onclick=()=>{const t=$('privateToken').value.trim();if(t){localStorage.setItem(TOKEN_KEY,t);$('privateToken').value=''}loadIndex()};
if(getToken())loadIndex();
})();
