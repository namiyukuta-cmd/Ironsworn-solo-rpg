(()=>{'use strict';
const NOTES_LOCAL_KEY='ironsworn-character-notes-v1';
const TOKEN_SESSION_KEY='ironsworn-github-token-session-v1';
const TOKEN_LOCAL_KEY='ironsworn-github-token-local-v1';
const OWNER='namiyukuta-cmd';
const REPO='Ironsworn-solo-rpg';
const BRANCH='main';
const API='https://api.github.com/repos/'+OWNER+'/'+REPO;
const $=id=>document.getElementById(id);

function loadNoteMap(){try{return JSON.parse(localStorage.getItem(NOTES_LOCAL_KEY)||'{}')||{}}catch(e){return {}}}
function saveNoteMap(map){localStorage.setItem(NOTES_LOCAL_KEY,JSON.stringify(map))}
function currentId(){return (typeof draft!=='undefined'&&draft&&(draft.id||''))||(typeof activeId!=='undefined'&&activeId)||''}
function currentName(){return (typeof draft!=='undefined'&&draft&&draft.name)||''}
function getNote(){
  if(typeof draft!=='undefined'&&draft&&typeof draft.notes==='string')return draft.notes;
  return loadNoteMap()[currentId()]||'';
}
function setNote(value){
  const id=currentId();if(!id)return;
  if(typeof draft!=='undefined'&&draft){draft.notes=value;if(typeof writeDraft==='function')writeDraft()}
  const map=loadNoteMap();map[id]=value;saveNoteMap(map);
}
function escapeId(id){return String(id||'character').replace(/[^A-Za-z0-9._-]/g,'-')||'character'}
function getToken(){return sessionStorage.getItem(TOKEN_SESSION_KEY)||localStorage.getItem(TOKEN_LOCAL_KEY)||''}
function utf8ToBase64(text){const bytes=new TextEncoder().encode(text);let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(binary)}
async function api(path,options={},token=getToken()){
  const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(options.headers||{})};
  if(token)headers.Authorization='Bearer '+token;
  const res=await fetch(API+path,{...options,headers});let body=null;try{body=await res.json()}catch(e){}
  if(!res.ok){const err=new Error((body&&body.message)||('GitHub API '+res.status));err.status=res.status;throw err}return body;
}
async function remote(path,token){
  const p=path.split('/').map(encodeURIComponent).join('/');
  try{const f=await api('/contents/'+p+'?ref='+encodeURIComponent(BRANCH),{},token);return {sha:f.sha||null}}catch(e){if(e.status===404)return {sha:null};throw e}
}
async function put(path,data,token,message){
  const p=path.split('/').map(encodeURIComponent).join('/');
  const cur=await remote(path,token);const payload={message,branch:BRANCH,content:utf8ToBase64(JSON.stringify(data,null,2)+'\n')};if(cur.sha)payload.sha=cur.sha;
  return api('/contents/'+p,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)},token);
}
async function syncNote(){
  const token=getToken(),id=currentId();if(!token||!id)return;
  const doc={format:'ironsworn-character-note-v1',characterId:id,name:currentName(),updatedAt:new Date().toISOString(),text:getNote()};
  try{await put('saves/notes/'+escapeId(id)+'.json',doc,token,'Save character note: '+(doc.name||id));}catch(e){console.warn('note sync failed',e)}
}
function openTattooPage(){if(typeof writeDraft==='function')writeDraft();location.href='tattoos.html?char='+encodeURIComponent(currentId())}
function renderMemoPanel(){
  const h=$('tattoos'),hint=$('tattooHint');if(!h||!hint||typeof draft==='undefined'||!draft)return;
  const panel=h.closest('.panel');const title=panel&&panel.querySelector('.ptitle h2');if(title)title.textContent='メモ';hint.textContent='自由記入';
  h.className='free-notes';h.innerHTML='';
  const ta=document.createElement('textarea');ta.className='free-notes-text';ta.placeholder='持ち物、特性、性格など自由に書けます';ta.value=getNote();
  ta.addEventListener('input',()=>setNote(ta.value));h.appendChild(ta);
  if(currentId()==='shirogane'){
    const b=document.createElement('button');b.type='button';b.className='tattoo-link';b.textContent='刺青を見る';b.onclick=openTattooPage;h.appendChild(b);
  }
}
if(typeof window.renderTattoos==='function')window.renderTattoos=renderMemoPanel;
if(typeof draft!=='undefined'&&draft){if(typeof draft.notes!=='string')draft.notes=loadNoteMap()[currentId()]||'';renderMemoPanel()}
const save=$('openSave');if(save)save.addEventListener('click',()=>setTimeout(syncNote,250));
document.addEventListener('click',e=>{if(e.target&&e.target.id==='githubSyncConnect')setTimeout(syncNote,900)});
window.IronswornCharacterNotes={render:renderMemoPanel,sync:syncNote};
})();
