(()=>{'use strict';

const OWNER='namiyukuta-cmd';
const REPO='Ironsworn-solo-rpg';
const BRANCH='main';
const TOKEN_SESSION_KEY='ironsworn-github-token-session-v1';
const TOKEN_LOCAL_KEY='ironsworn-github-token-local-v1';
const API='https://api.github.com/repos/'+OWNER+'/'+REPO;

const $=id=>document.getElementById(id);
const saveButton=$('openSave');
if(!saveButton)return;

function addStyles(){
  if(document.getElementById('githubSyncStyles'))return;
  const s=document.createElement('style');
  s.id='githubSyncStyles';
  s.textContent=`
  .ghs-backdrop{position:fixed;inset:0;z-index:9999;background:rgba(42,28,27,.36);display:none;align-items:center;justify-content:center;padding:18px}
  .ghs-backdrop.open{display:flex}
  .ghs-card{width:min(440px,100%);max-height:88dvh;overflow:auto;background:#fffaf8;border:1px solid #d9c1bc;border-radius:18px;padding:18px;box-shadow:0 18px 50px rgba(72,43,39,.18);font-family:inherit;color:#4a3532}
  .ghs-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
  .ghs-head h2{font-size:20px;margin:0}
  .ghs-close{border:0;background:transparent;font-size:26px;line-height:1;color:#6f5550;padding:0 4px}
  .ghs-note{font-size:13px;line-height:1.55;margin:8px 0}
  .ghs-steps{font-size:12px;line-height:1.55;background:#fff2ef;border-radius:12px;padding:10px 12px;margin:10px 0}
  .ghs-link{display:inline-block;margin-top:4px;color:#7a4e49;text-decoration:underline;font-weight:700}
  .ghs-label{display:block;font-size:12px;font-weight:700;margin:12px 0 5px}
  .ghs-token{width:100%;box-sizing:border-box;border:1px solid #cdb4af;border-radius:10px;background:white;padding:10px 11px;font:inherit;font-size:14px}
  .ghs-remember{display:flex;gap:8px;align-items:flex-start;font-size:12px;line-height:1.4;margin:10px 0}
  .ghs-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
  .ghs-btn{border:1px solid #cdb4af;background:#fff;border-radius:11px;padding:10px;font:inherit;font-weight:700;color:#5e413d}
  .ghs-btn.primary{background:#7e514c;color:#fff;border-color:#7e514c}
  .ghs-status{min-height:1.4em;font-size:12px;line-height:1.4;margin-top:10px;overflow-wrap:anywhere}
  .ghs-security{font-size:11px;line-height:1.45;color:#7b6662;margin-top:10px}
  `;
  document.head.appendChild(s);
}

function createModal(){
  if($('githubSyncModal'))return;
  addStyles();
  const wrap=document.createElement('div');
  wrap.id='githubSyncModal';
  wrap.className='ghs-backdrop';
  wrap.innerHTML=`
    <div class="ghs-card" role="dialog" aria-modal="true" aria-labelledby="githubSyncTitle">
      <div class="ghs-head"><h2 id="githubSyncTitle">GitHubセーブ連携</h2><button type="button" id="githubSyncClose" class="ghs-close">×</button></div>
      <p id="githubSyncNote" class="ghs-note">端末には保存済みです。GitHubにも自動保存するには、初回だけGitHubの連携用トークンを設定します。</p>
      <div class="ghs-steps">
        GitHubで Fine-grained personal access token を作り、<b>${REPO}</b> だけを選択して、<b>Contents: Read and write</b> を許可してください。<br>
        <a class="ghs-link" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">GitHubでトークンを作る</a>
      </div>
      <label class="ghs-label" for="githubSyncToken">トークン</label>
      <input id="githubSyncToken" class="ghs-token" type="password" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="github_pat_...">
      <label class="ghs-remember"><input id="githubSyncRemember" type="checkbox"> <span>このiPhoneに保存する（次回から入力不要）。オフの場合は、このタブを閉じるまでだけ保持します。</span></label>
      <div class="ghs-actions">
        <button type="button" id="githubSyncDisconnect" class="ghs-btn">連携解除</button>
        <button type="button" id="githubSyncConnect" class="ghs-btn primary">連携して今すぐ保存</button>
      </div>
      <div id="githubSyncStatus" class="ghs-status"></div>
      <div class="ghs-security">トークンはキャラクターデータには入れず、GitHubにもコミットしません。保存先は <b>saves/characters/</b> です。</div>
    </div>`;
  document.body.appendChild(wrap);
  $('githubSyncClose').onclick=()=>wrap.classList.remove('open');
  wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open')});
  $('githubSyncDisconnect').onclick=()=>{
    sessionStorage.removeItem(TOKEN_SESSION_KEY);
    localStorage.removeItem(TOKEN_LOCAL_KEY);
    $('githubSyncToken').value='';
    $('githubSyncRemember').checked=false;
    $('githubSyncStatus').textContent='GitHub連携を解除しました。端末保存はそのまま残ります。';
  };
  $('githubSyncConnect').onclick=connectAndSync;
}

function getToken(){
  return sessionStorage.getItem(TOKEN_SESSION_KEY)||localStorage.getItem(TOKEN_LOCAL_KEY)||'';
}

function storeToken(token,persist){
  sessionStorage.removeItem(TOKEN_SESSION_KEY);
  localStorage.removeItem(TOKEN_LOCAL_KEY);
  if(persist)localStorage.setItem(TOKEN_LOCAL_KEY,token);
  else sessionStorage.setItem(TOKEN_SESSION_KEY,token);
}

function showSetup(message=''){
  createModal();
  $('githubSyncStatus').textContent=message;
  $('githubSyncToken').value='';
  $('githubSyncRemember').checked=!!localStorage.getItem(TOKEN_LOCAL_KEY);
  $('githubSyncModal').classList.add('open');
}

function utf8ToBase64(text){
  const bytes=new TextEncoder().encode(text);
  let binary='';
  const step=0x8000;
  for(let i=0;i<bytes.length;i+=step){
    binary+=String.fromCharCode(...bytes.subarray(i,i+step));
  }
  return btoa(binary);
}

async function apiRequest(path,options={},token=getToken()){
  const headers={
    'Accept':'application/vnd.github+json',
    'X-GitHub-Api-Version':'2022-11-28',
    ...(options.headers||{})
  };
  if(token)headers.Authorization='Bearer '+token;
  const res=await fetch(API+path,{...options,headers});
  let body=null;
  try{body=await res.json()}catch(e){}
  if(!res.ok){
    const err=new Error((body&&body.message)||('GitHub API '+res.status));
    err.status=res.status;
    err.body=body;
    throw err;
  }
  return body;
}

async function getRemoteJson(path,token){
  const encodedPath=path.split('/').map(encodeURIComponent).join('/');
  try{
    const file=await apiRequest('/contents/'+encodedPath+'?ref='+encodeURIComponent(BRANCH),{},token);
    if(!file||file.type!=='file')return {data:null,sha:null};
    const raw=(file.content||'').replace(/\n/g,'');
    const bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));
    const text=new TextDecoder().decode(bytes);
    return {data:JSON.parse(text),sha:file.sha||null};
  }catch(e){
    if(e.status===404)return {data:null,sha:null};
    throw e;
  }
}

async function putRemoteJson(path,data,token,message){
  const encodedPath=path.split('/').map(encodeURIComponent).join('/');
  const payloadBase={message,branch:BRANCH,content:utf8ToBase64(JSON.stringify(data,null,2)+'\n')};
  for(let attempt=0;attempt<2;attempt++){
    const current=await getRemoteJson(path,token);
    const payload={...payloadBase};
    if(current.sha)payload.sha=current.sha;
    try{
      return await apiRequest('/contents/'+encodedPath,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)},token);
    }catch(e){
      if((e.status===409||e.status===422)&&attempt===0)continue;
      throw e;
    }
  }
}

function buildCharacterDocument(){
  if(typeof draft==='undefined'||!draft)return null;
  return {
    format:'ironsworn-character-save-v1',
    id:draft.id||activeId||'',
    name:draft.name||'',
    updatedAt:draft.updatedAt||new Date().toISOString(),
    character:JSON.parse(JSON.stringify({
      stats:draft.stats||{},
      tracks:draft.tracks||{},
      vow:draft.vow||{title:'未設定',progress:0},
      assets:draft.assets||[],
      tattoos:draft.tattoos||{},
      createdAt:draft.createdAt||null
    }))
  };
}

function cleanId(id){
  const safe=String(id||'character').replace(/[^A-Za-z0-9._-]/g,'-');
  return safe||'character';
}

async function syncCurrentCharacter(token=getToken()){
  const doc=buildCharacterDocument();
  if(!doc)throw new Error('保存するキャラクターがありません。');
  const id=cleanId(doc.id);
  const characterPath='saves/characters/'+id+'.json';

  await putRemoteJson(characterPath,doc,token,'Save character: '+doc.name);

  const indexPath='saves/characters/index.json';
  const remote=await getRemoteJson(indexPath,token);
  const index=(remote.data&&Array.isArray(remote.data.characters))?remote.data:{format:'ironsworn-character-index-v1',characters:[]};
  const entry={id:doc.id,name:doc.name,path:characterPath,updatedAt:doc.updatedAt};
  const pos=index.characters.findIndex(x=>x&&x.id===doc.id);
  if(pos>=0)index.characters[pos]=entry;else index.characters.push(entry);
  index.characters.sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
  index.latestCharacterId=doc.id;
  index.latestPath=characterPath;
  index.updatedAt=doc.updatedAt;
  await putRemoteJson(indexPath,index,token,'Update character save index');

  await putRemoteJson('saves/characters/latest.json',doc,token,'Update latest character save');
  return {doc,path:characterPath};
}

async function connectAndSync(){
  const token=$('githubSyncToken').value.trim();
  const status=$('githubSyncStatus');
  if(!token){status.textContent='トークンを入力してください。';return}
  const button=$('githubSyncConnect');
  button.disabled=true;status.textContent='GitHubへ保存しています…';
  try{
    storeToken(token,$('githubSyncRemember').checked);
    const result=await syncCurrentCharacter(token);
    status.textContent='GitHubに保存しました：'+result.doc.name;
    saveButton.textContent='保存済み';
    setTimeout(()=>{saveButton.textContent='セーブ'},1100);
    setTimeout(()=>$('githubSyncModal').classList.remove('open'),900);
  }catch(e){
    if(e.status===401||e.status===403){
      sessionStorage.removeItem(TOKEN_SESSION_KEY);
      localStorage.removeItem(TOKEN_LOCAL_KEY);
      status.textContent='GitHubの認証に失敗しました。トークンと Contents: Read and write の権限を確認してください。端末には保存済みです。';
    }else{
      status.textContent='GitHub保存に失敗しました：'+e.message+'（端末には保存済みです）';
    }
  }finally{button.disabled=false}
}

let saving=false;
saveButton.onclick=async()=>{
  if(saving)return;
  if(typeof formalSave!=='function'||!formalSave())return;
  const token=getToken();
  if(!token){
    saveButton.textContent='端末保存済み';
    setTimeout(()=>{saveButton.textContent='セーブ'},1200);
    showSetup('端末には保存済みです。GitHub連携を設定すると、このキャラクターも今すぐGitHubへ保存します。');
    return;
  }
  saving=true;
  saveButton.disabled=true;
  saveButton.textContent='GitHub保存中…';
  try{
    const result=await syncCurrentCharacter(token);
    saveButton.textContent='保存済み';
    saveButton.title='GitHub: '+result.path;
  }catch(e){
    saveButton.textContent='端末保存済み';
    if(e.status===401||e.status===403){
      sessionStorage.removeItem(TOKEN_SESSION_KEY);
      localStorage.removeItem(TOKEN_LOCAL_KEY);
      showSetup('GitHub認証が切れています。端末には保存済みです。トークンを設定し直してください。');
    }else{
      showSetup('GitHub保存に失敗しました：'+e.message+'。端末には保存済みです。');
    }
  }finally{
    setTimeout(()=>{saveButton.textContent='セーブ';saveButton.disabled=false},1400);
    saving=false;
  }
};

window.IronswornGithubSync={syncCurrentCharacter,showSetup};
})();
