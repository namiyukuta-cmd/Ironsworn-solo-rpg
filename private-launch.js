(()=>{'use strict';
const LOADED_KEY='ironsworn-private-loaded-save-v1';
const page=location.pathname.split('/').pop();
if(page==='continue.html'){
  const original=sessionStorage.setItem.bind(sessionStorage);
  sessionStorage.setItem=(key,value)=>{original(key,value);if(key===LOADED_KEY)setTimeout(()=>location.href='private-main.html',0)};
  return;
}
if(page==='new.html'){
  let pendingSave=null;
  const originalFetch=window.fetch.bind(window);
  window.fetch=async function(input,init={}){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    const method=String(init.method||'GET').toUpperCase();
    if(method==='PUT'&&url.includes('api.github.com/repos/namiyukuta-cmd/private-game-data/contents/ironsworn-solo/')&&init.body){
      try{
        const payload=JSON.parse(init.body);
        if(payload&&payload.content){
          const raw=atob(payload.content);const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));const obj=JSON.parse(new TextDecoder().decode(bytes));
          if(obj&&obj.format==='ironsworn-private-save-v1'&&obj.character)pendingSave=obj;
        }
      }catch(e){}
    }
    return originalFetch(input,init);
  };
  const go=()=>{if(!pendingSave||!document.querySelector('.saved'))return;sessionStorage.setItem(LOADED_KEY,JSON.stringify(pendingSave));setTimeout(()=>location.href='private-main.html',120)};
  new MutationObserver(go).observe(document.documentElement,{childList:true,subtree:true});
}
})();