(()=>{'use strict';
const FILES=['assets/custom.json','assets/companions.json','assets/paths-1.json','assets/paths-2.json','assets/combat.json','assets/rituals.json'];
let library=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function parts(x){
  if(Array.isArray(x))return{label:x[0]||'能力',active:!!x[1],description:x[2]||''};
  return{label:x?.label||'能力',active:!!x?.active,description:x?.description||''};
}
function enrich(a){
  if(!a)return a;
  const ref=library.find(x=>(a.assetId&&x.id===a.assetId)||x.name===a.name);
  if(!ref)return a;
  if(!a.summary||a.summary==='説明なし')a.summary=ref.summary||'';
  const current=Array.isArray(a.abilities)?a.abilities:[];
  a.abilities=(ref.abilities||[]).map((r,i)=>{
    const old=current.find(x=>parts(x).label===r.label)||current[i];
    const p=parts(old||{});
    return [r.label,p.active,r.description||p.description||''];
  });
  return a;
}
function detailedRenderAssets(){
  if(typeof draft==='undefined'||!draft)return;
  const h=document.getElementById('assets');if(!h)return;
  draft.assets=Array.isArray(draft.assets)?draft.assets:[];
  draft.assets.forEach(enrich);
  if(typeof writeDraft==='function')writeDraft();
  h.innerHTML='';
  const count=document.getElementById('assetCount');if(count)count.textContent=draft.assets.length+'個';
  const add=document.getElementById('assetAddTop');
  if(add){add.textContent=draft.assets.length<3?'＋初期 '+draft.assets.length+'/3':'＋追加 3XP';add.onclick=()=>openAssetPicker();}
  const visible=draft.assets.length>3?draft.assets.slice(0,2):draft.assets.slice(0,3);
  visible.forEach((a,i)=>{
    const abs=(a.abilities||[]).map(parts);
    const d=document.createElement('button');
    d.type='button';d.className='asset asset-edit asset-detailed';
    d.innerHTML='<div class="asset-card-head"><div class="aname"><strong>'+esc(a.name)+'</strong><small>'+esc(a.type||'ASSET')+'　<span class="asset-edit-tag">詳細</span></small></div></div>'+
      '<div class="asset-summary">'+esc(a.summary||'説明なし')+'</div>'+
      '<div class="asset-ability-list">'+abs.map(x=>'<div class="asset-ability-row '+(x.active?'on':'')+'"><div class="asset-ability-name">'+(x.active?'● ':'○ ')+esc(x.label)+'</div><div class="asset-ability-desc">'+esc(x.description||'説明なし')+'</div></div>').join('')+'</div>';
    d.onclick=()=>openAssetDetail(i);
    h.appendChild(d);
  });
  if(draft.assets.length<3){
    for(let i=draft.assets.length;i<3;i++){
      const b=document.createElement('button');b.type='button';b.className='asset-add';
      b.innerHTML='＋ アセットを追加<br><small>初期枠 '+draft.assets.length+' / 3</small>';
      b.onclick=()=>openAssetPicker();h.appendChild(b);
    }
  }else if(draft.assets.length>3){
    const b=document.createElement('button');b.type='button';b.className='asset-more';
    b.innerHTML='ほか '+(draft.assets.length-2)+'個<br>一覧・追加';b.onclick=()=>openAssetPicker();h.appendChild(b);
  }
}
window.renderAssets=detailedRenderAssets;
Promise.all(FILES.map(f=>fetch(f+'?v=indexdetails1',{cache:'no-store'}).then(r=>r.ok?r.json():[]))).then(partsList=>{
  library=partsList.flat();
  if(typeof draft!=='undefined'&&draft)detailedRenderAssets();
}).catch(()=>{});
})();
