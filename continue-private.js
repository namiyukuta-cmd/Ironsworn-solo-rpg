(()=>{'use strict';
const TOKEN_KEY='ironsworn-private-save-token-v1';
const LOADED_KEY='ironsworn-private-loaded-save-v1';
const OWNER='namiyukuta-cmd',REPO='private-game-data',BRANCH='main',ROOT='ironsworn-solo';
const API='https://api.github.com/repos/'+OWNER+'/'+REPO;
const $=id=>document.getElementById(id),status=$('status'),list=$('saveList');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function getToken(){return localStorage.getItem(TOKEN_KEY)||''}
function encodePath(path){return String(path||'').split('/').map(encodeURIComponent).join('/')}
function utf8b64(text){const bytes=new TextEncoder().encode(text);let out='';for(let i=0;i<bytes.length;i+=32768)out+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(out)}
async function request(path,opt={}){
  const token=getToken();
  const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(opt.headers||{})};
  if(token)headers.Authorization='Bearer '+token;
  const r=await fetch(API+path,{...opt,headers,cache:'no-store'});
  let body=null;try{body=await r.json()}catch(e){}
  if(!r.ok){const e=new Error((body&&body.message)||('GitHub API '+r.status));e.status=r.status;throw e}
  return body
}
function decode(content){const raw=(content||'').replace(/\n/g,'');const bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));return new TextDecoder().decode(bytes)}
async function getFile(path){try{return await request('/contents/'+encodePath(path)+'?ref='+encodeURIComponent(BRANCH))}catch(e){if(e.status===404)return null;throw e}}
async function readJson(path){const f=await getFile(path);if(!f)throw Object.assign(new Error('ファイルが見つかりません。'),{status:404});return JSON.parse(decode(f.content))}
async function putJson(path,obj,message){
  const old=await getFile(path),payload={message,content:utf8b64(JSON.stringify(obj,null,2)),branch:BRANCH};
  if(old?.sha)payload.sha=old.sha;
  return request('/contents/'+encodePath(path),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
}
async function deleteFile(path,sha,name){
  return request('/contents/'+encodePath(path),{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Delete Ironsworn private game: '+(name||'character'),sha,branch:BRANCH})})
}
async function deleteTree(path,name){
  const node=await request('/contents/'+encodePath(path)+'?ref='+encodeURIComponent(BRANCH));
  if(!Array.isArray(node)){if(node?.sha)await deleteFile(path,node.sha,name);return}
  for(const item of node){
    if(item.type==='dir')await deleteTree(item.path,name);
    else if(item.type==='file'&&item.sha)await deleteFile(item.path,item.sha,name)
  }
}
function clearLoadedIfDeleted(item){
  try{
    const loaded=JSON.parse(sessionStorage.getItem(LOADED_KEY)||'null');
    if(loaded&&(loaded.id===item.id||loaded.path===item.path))sessionStorage.removeItem(LOADED_KEY)
  }catch(e){}
}
function saveCard(s,i){
  return '<article class="save-card"><div><strong>'+esc(s.name||'主人公')+'</strong><span>'+esc(s.updatedAt?new Date(s.updatedAt).toLocaleString('ja-JP'):'')+'</span></div><div class="save-card-actions"><button type="button" data-load="'+i+'">続きから</button><button class="delete-save" type="button" data-delete="'+i+'">削除</button></div></article>'
}
async function loadIndex(){
  if(!getToken()){status.textContent='GitHubトークンを入力してください。';list.innerHTML='';return}
  status.textContent='Private Gameを読み込んでいます…';list.innerHTML='';
  try{
    const index=await readJson(ROOT+'/index.json');
    const saves=Array.isArray(index.saves)?index.saves:[];
    if(!saves.length){status.textContent='Private Gameのセーブはまだありません。';return}
    list.innerHTML=saves.map(saveCard).join('');
    list.querySelectorAll('[data-load]').forEach(btn=>btn.onclick=async()=>{
      const item=saves[Number(btn.dataset.load)];
      btn.disabled=true;btn.textContent='読込中…';status.textContent='セーブを読み込んでいます…';
      try{
        const save=await readJson(item.path);
        sessionStorage.setItem(LOADED_KEY,JSON.stringify(save));
        location.href='private-main.html';
      }catch(e){status.textContent='読み込み失敗：'+e.message;btn.disabled=false;btn.textContent='続きから'}
    });
    list.querySelectorAll('[data-delete]').forEach(btn=>btn.onclick=async()=>{
      const item=saves[Number(btn.dataset.delete)];
      const name=item?.name||'このキャラクター';
      if(!item?.path)return;
      if(!confirm('「'+name+'」を削除します。\nこのキャラクターのセーブと関連データは元に戻せません。\n\n削除しますか？'))return;
      const dir=item.path.split('/').slice(0,-1).join('/');
      if(!dir.startsWith(ROOT+'/')){status.textContent='削除を中止しました：保存先が不正です。';return}
      btn.disabled=true;btn.textContent='削除中…';status.textContent='「'+name+'」を削除しています…';
      try{
        await deleteTree(dir,name);
        const latest=await readJson(ROOT+'/index.json');
        latest.saves=(Array.isArray(latest.saves)?latest.saves:[]).filter(x=>!(x.id===item.id||x.path===item.path));
        latest.updatedAt=new Date().toISOString();
        await putJson(ROOT+'/index.json',latest,'Remove Ironsworn private save: '+name);
        clearLoadedIfDeleted(item);
        status.textContent='「'+name+'」を削除しました。';
        await loadIndex()
      }catch(e){status.textContent='削除失敗：'+e.message;btn.disabled=false;btn.textContent='削除'}
    });
    status.textContent=saves.length+'件のPrivate Gameセーブがあります。';
  }catch(e){status.textContent=e.status===404?'Private Gameのセーブはまだありません。':'読み込み失敗：'+e.message}
}
$('connectBtn').onclick=()=>{const t=$('privateToken').value.trim();if(t){localStorage.setItem(TOKEN_KEY,t);$('privateToken').value=''}loadIndex()};
if(getToken())loadIndex();
})();
