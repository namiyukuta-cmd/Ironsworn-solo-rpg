(()=>{'use strict';
const OWNER='namiyukuta-cmd',REPO='Ironsworn-solo-rpg',BRANCH='main';
const TOKEN_SESSION_KEY='ironsworn-github-token-session-v1',TOKEN_LOCAL_KEY='ironsworn-github-token-local-v1';
const API='https://api.github.com/repos/'+OWNER+'/'+REPO;
function token(){return sessionStorage.getItem(TOKEN_SESSION_KEY)||localStorage.getItem(TOKEN_LOCAL_KEY)||''}
function safe(s){return String(s||'item').replace(/[^A-Za-z0-9._-]/g,'-')}
function b64(text){const bytes=new TextEncoder().encode(text);let b='';for(let i=0;i<bytes.length;i+=0x8000)b+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(b)}
async function api(path,opt={},t=token()){const h={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(opt.headers||{})};if(t)h.Authorization='Bearer '+t;const r=await fetch(API+path,{...opt,headers:h});let j=null;try{j=await r.json()}catch(e){}if(!r.ok){const e=new Error(j?.message||('GitHub API '+r.status));e.status=r.status;throw e}return j}
async function get(path,t){const p=path.split('/').map(encodeURIComponent).join('/');try{const f=await api('/contents/'+p+'?ref='+BRANCH,{},t);const raw=(f.content||'').replace(/\n/g,'');const bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));return {data:JSON.parse(new TextDecoder().decode(bytes)),sha:f.sha}}catch(e){if(e.status===404)return {data:null,sha:null};throw e}}
async function put(path,data,t,msg){const p=path.split('/').map(encodeURIComponent).join('/');for(let attempt=0;attempt<2;attempt++){const cur=await get(path,t);const payload={message:msg,branch:BRANCH,content:b64(JSON.stringify(data,null,2)+'\n')};if(cur.sha)payload.sha=cur.sha;try{return await api('/contents/'+p,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)},t)}catch(e){if((e.status===409||e.status===422)&&attempt===0)continue;throw e}}}
async function sync(t=token()){
  if(!t||typeof draft==='undefined'||!draft||!draft.setup?.complete)return false;
  const s=draft.setup;if(s.syncedAt&&!s.needsSync)return false;
  const id=draft.id,worldId=s.worldId,playId=s.playId||('play-'+id),now=new Date().toISOString();if(!worldId)return false;
  if(s.worldMode==='new'){
    const world={format:'ironsworn-world-v1',id:worldId,name:s.worldName,truths:s.worldTruths||'',startingLocation:s.startLocation||'',status:'active',createdByCharacterId:id,updatedAt:now};
    const state={format:'ironsworn-world-state-v1',worldId,updatedAt:now,status:'campaign_started',currentLocation:s.startLocation||'',currentFacts:[],characterImpacts:[]};
    await put('worlds/'+safe(worldId)+'/world.json',world,t,'Save world: '+s.worldName);await put('worlds/'+safe(worldId)+'/state.json',state,t,'Initialize world state');
  }
  const wi=await get('worlds/index.json',t);const worlds=wi.data&&Array.isArray(wi.data.worlds)?wi.data:{format:'ironsworn-world-index-v1',worlds:[]};let we=worlds.worlds.find(x=>x.id===worldId);if(!we){we={id:worldId,name:s.worldName||worldId,status:'active',path:'worlds/'+safe(worldId)+'/world.json',statePath:'worlds/'+safe(worldId)+'/state.json',characterIds:[],playIds:[]};worlds.worlds.push(we)}we.characterIds=Array.from(new Set([...(we.characterIds||[]),id]));we.playIds=Array.from(new Set([...(we.playIds||[]),playId]));worlds.updatedAt=now;await put('worlds/index.json',worlds,t,'Link character to world');
  const setupDoc={format:'ironsworn-character-setup-v1',characterId:id,name:draft.name,updatedAt:now,concept:s.concept||'',equipment:s.equipment||'',worldId,worldName:s.worldName||'',startLocation:s.startLocation||'',backgroundBonds:(s.bonds||[]).filter(Boolean),backgroundVow:{title:s.backgroundVow,rank:s.backgroundVowRank},incitingIncident:s.incitingIncident,startMode:s.startMode,openingScene:s.openingScene,initialVow:{title:s.initialVow,rank:s.initialVowRank,progress:0}};
  await put('saves/setup/'+safe(id)+'.json',setupDoc,t,'Save campaign setup: '+draft.name);
  const noteDoc={format:'ironsworn-character-note-v1',characterId:id,name:draft.name,updatedAt:now,text:draft.notes||''};await put('saves/notes/'+safe(id)+'.json',noteDoc,t,'Initialize character note: '+draft.name);
  const current={format:'ironsworn-play-state-v1',id:playId,characterId:id,worldId,status:'ready_to_start',updatedAt:now,startLocation:s.startLocation,concept:s.concept||'',equipment:s.equipment||'',backgroundBonds:(s.bonds||[]).filter(Boolean),backgroundVow:{title:s.backgroundVow,rank:s.backgroundVowRank},incitingIncident:s.incitingIncident,startMode:s.startMode,openingScene:s.openingScene,initialVow:{title:s.initialVow,rank:s.initialVowRank,progress:0},pendingMove:'Swear an Iron Vow',next:'Resolve the opening vow, then continue from its outcome.'};
  const playDir=safe(id);const currentPath='plays/'+playDir+'/current.json';await put(currentPath,current,t,'Initialize play: '+draft.name);
  const history={format:'ironsworn-play-history-v1',playId,events:[{at:now,type:'campaign_setup',text:'キャラクター作成とキャンペーン準備を完了。最初の誓いを立てる場面から開始。'}]};const historyPath='plays/'+playDir+'/history.json';await put(historyPath,history,t,'Initialize play history: '+draft.name);
  const pi=await get('plays/index.json',t);const plays=pi.data&&Array.isArray(pi.data.plays)?pi.data:{format:'ironsworn-play-index-v1',plays:[]};const pe={id:playId,name:draft.name+'のプレイ',characterId:id,worldId,status:'ready_to_start',currentPath,historyPath};const pos=plays.plays.findIndex(x=>x.id===playId);if(pos>=0)plays.plays[pos]={...plays.plays[pos],...pe};else plays.plays.push(pe);plays.updatedAt=now;await put('plays/index.json',plays,t,'Register new play');
  s.syncedAt=now;s.needsSync=false;if(typeof writeDraft==='function')writeDraft();if(typeof formalSave==='function')formalSave();return true;
}
const save=document.getElementById('openSave');if(save)save.addEventListener('click',()=>setTimeout(()=>sync().catch(e=>console.warn('setup sync failed',e)),1000));
document.addEventListener('click',e=>{if(e.target?.id==='githubSyncConnect')setTimeout(()=>sync().catch(err=>console.warn('setup sync failed',err)),1500)});
window.IronswornSetupSync={sync};
})();
