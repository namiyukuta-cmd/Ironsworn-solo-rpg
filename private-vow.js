(()=>{
  'use strict';
  const KEY='ironsworn-private-loaded-save-v1';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clamp=n=>Math.max(0,Math.min(10,Number(n)||0));
  const ranks=['Troublesome','Dangerous','Formidable','Extreme','Epic'];
  let editingId='';

  function read(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){return null}}
  function write(state){sessionStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent('ironsworn:statechange'))}
  function validTitle(v){return String(v?.title||'').trim()&&v.title!=='未設定'}
  function ensure(state){
    if(!state?.character)return null;
    const c=state.character;
    if(!Array.isArray(c.vows)){
      c.vows=[];
      if(validTitle(c.vow)){
        c.vows.push({id:'legacy-'+Date.now(),title:String(c.vow.title),rank:c.vow.rank||'Dangerous',progress:clamp(c.vow.progress),background:false});
      }
    }
    c.vows=c.vows.map((v,i)=>({
      id:v?.id||('vow-'+Date.now()+'-'+i),
      title:String(v?.title||'未設定'),
      rank:ranks.includes(v?.rank)?v.rank:'Dangerous',
      progress:clamp(v?.progress),
      background:!!v?.background
    }));

    if(validTitle(c.backgroundVow)){
      const bgTitle=String(c.backgroundVow.title).trim();
      let bg=c.vows.find(v=>v.background||v.id==='background-vow');
      if(!bg)bg=c.vows.find(v=>String(v.title).trim()===bgTitle);
      if(bg){
        bg.background=true;
        if(!bg.title||bg.title==='未設定')bg.title=bgTitle;
        if(!ranks.includes(bg.rank))bg.rank=ranks.includes(c.backgroundVow.rank)?c.backgroundVow.rank:'Extreme';
      }else{
        c.vows.push({
          id:'background-vow',
          title:bgTitle,
          rank:ranks.includes(c.backgroundVow.rank)?c.backgroundVow.rank:'Extreme',
          progress:clamp(c.backgroundVow.progress),
          background:true
        });
      }
    }

    syncBackground(c);
    syncLegacy(c);
    sessionStorage.setItem(KEY,JSON.stringify(state));
    return c;
  }
  function syncBackground(c){
    const bg=Array.isArray(c.vows)?c.vows.find(v=>v.background):null;
    if(!bg){
      c.backgroundVow={title:'',rank:'Extreme',progress:0,status:'removed'};
      return;
    }
    c.backgroundVow={
      ...(c.backgroundVow||{}),
      title:bg.title,
      rank:bg.rank,
      progress:bg.progress,
      status:c.backgroundVow?.status==='removed'?'active':(c.backgroundVow?.status||'active')
    };
  }
  function syncLegacy(c){
    const first=Array.isArray(c.vows)?c.vows.find(v=>!v.background):null;
    c.vow=first?{title:first.title,rank:first.rank,progress:first.progress}:{title:'未設定',rank:'Dangerous',progress:0};
  }
  function rankJa(rank){return({Troublesome:'面倒',Dangerous:'危険',Formidable:'手強い',Extreme:'極限',Epic:'壮大'})[rank]||rank}

  function editCard(v){
    return `<article class="vow-manager-card vow-edit-card" data-vow-id="${esc(v.id)}">
      <label class="vow-edit-field"><span>誓い</span><input id="editVowTitle" type="text" value="${esc(v.title)}"></label>
      <label class="vow-edit-field"><span>ランク</span><select id="editVowRank">${ranks.map(r=>`<option value="${r}" ${r===v.rank?'selected':''}>${r}（${rankJa(r)}）</option>`).join('')}</select></label>
      <div class="vow-edit-actions"><button type="button" data-vow-save="${esc(v.id)}">保存</button><button type="button" data-vow-cancel>キャンセル</button></div>
    </article>`;
  }

  function card(v){
    if(editingId===v.id)return editCard(v);
    return `<article class="vow-manager-card" data-vow-id="${esc(v.id)}">
      <div class="vow-manager-head">
        <div><strong>${esc(v.title)}</strong><small>${v.background?'背景の誓い / ':''}${esc(v.rank)}（${rankJa(v.rank)}）</small></div>
        <div class="vow-card-actions"><button class="vow-edit" type="button" data-vow-edit="${esc(v.id)}">編集</button><button class="vow-delete" type="button" data-vow-delete="${esc(v.id)}">削除</button></div>
      </div>
      <div class="vow-tool-progress"><button type="button" data-vow-step="-1" data-vow-id="${esc(v.id)}">−</button><strong>${v.progress}/10</strong><button type="button" data-vow-step="1" data-vow-id="${esc(v.id)}">＋</button></div>
    </article>`;
  }

  function render(){
    const state=read(),c=ensure(state);
    if(!c)return;
    const body=$('sideToolBody');
    if(!body)return;
    body.innerHTML=`
      <div class="vow-add-box">
        <label>新しい誓い<input id="newVowTitle" type="text" placeholder="例：自分の本当の出自を突き止める"></label>
        <label>ランク<select id="newVowRank">${ranks.map(r=>`<option value="${r}">${r}（${rankJa(r)}）</option>`).join('')}</select></label>
        <button id="addVowBtn" type="button">＋ VOWを追加</button>
      </div>
      <div class="vow-manager-list">${c.vows.length?c.vows.map(card).join(''):'<div class="empty">誓いはまだありません。</div>'}</div>`;

    $('addVowBtn').onclick=()=>{
      const title=String($('newVowTitle')?.value||'').trim();
      if(!title){$('newVowTitle')?.focus();return}
      const s=read(),ch=ensure(s); if(!ch)return;
      ch.vows.push({id:'vow-'+Date.now(),title,rank:$('newVowRank')?.value||'Dangerous',progress:0,background:false});
      syncBackground(ch);syncLegacy(ch);write(s);render();
    };

    body.querySelectorAll('[data-vow-edit]').forEach(btn=>btn.onclick=()=>{
      editingId=btn.dataset.vowEdit||'';
      render();
      $('editVowTitle')?.focus();
    });

    body.querySelectorAll('[data-vow-cancel]').forEach(btn=>btn.onclick=()=>{
      editingId='';
      render();
    });

    body.querySelectorAll('[data-vow-save]').forEach(btn=>btn.onclick=()=>{
      const title=String($('editVowTitle')?.value||'').trim();
      if(!title){$('editVowTitle')?.focus();return}
      const s=read(),ch=ensure(s); if(!ch)return;
      const v=ch.vows.find(x=>x.id===btn.dataset.vowSave); if(!v)return;
      v.title=title;
      v.rank=ranks.includes($('editVowRank')?.value)?$('editVowRank').value:v.rank;
      editingId='';
      syncBackground(ch);syncLegacy(ch);write(s);render();
    });

    body.querySelectorAll('[data-vow-step]').forEach(btn=>btn.onclick=()=>{
      const s=read(),ch=ensure(s); if(!ch)return;
      const v=ch.vows.find(x=>x.id===btn.dataset.vowId); if(!v)return;
      v.progress=clamp(v.progress+Number(btn.dataset.vowStep||0));
      syncBackground(ch);syncLegacy(ch);write(s);render();
    });

    body.querySelectorAll('[data-vow-delete]').forEach(btn=>btn.onclick=()=>{
      const s=read(),ch=ensure(s); if(!ch)return;
      const doomed=ch.vows.find(x=>x.id===btn.dataset.vowDelete); if(!doomed)return;
      ch.vows=ch.vows.filter(x=>x.id!==btn.dataset.vowDelete);
      if(doomed.background)ch.backgroundVow={title:'',rank:'Extreme',progress:0,status:'removed'};
      editingId='';
      syncBackground(ch);syncLegacy(ch);write(s);render();
    });
  }

  function openVows(){
    const modal=$('sideToolModal'),title=$('sideToolTitle');
    if(!modal||!title)return;
    editingId='';
    title.textContent='VOW';
    modal.classList.add('on');
    modal.setAttribute('aria-hidden','false');
    render();
  }

  document.addEventListener('click',e=>{
    const target=e.target instanceof Element?e.target.closest('#vowBtn'):null;
    if(!target)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openVows();
  },true);

  window.IRONSWORN_OPEN_VOWS=openVows;
})();
