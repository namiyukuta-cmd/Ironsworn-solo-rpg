(()=>{
  'use strict';
  const KEY='ironsworn-private-loaded-save-v1';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clamp=n=>Math.max(0,Math.min(10,Number(n)||0));
  const ranks=['Troublesome','Dangerous','Formidable','Extreme','Epic'];

  function read(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){return null}}
  function write(state){sessionStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent('ironsworn:statechange'))}
  function ensure(state){
    if(!state?.character)return null;
    const c=state.character;
    if(!Array.isArray(c.vows)){
      c.vows=[];
      if(c.vow&&String(c.vow.title||'').trim()&&c.vow.title!=='未設定'){
        c.vows.push({id:'legacy-'+Date.now(),title:String(c.vow.title),rank:c.vow.rank||'Extreme',progress:clamp(c.vow.progress)});
      }
    }
    c.vows=c.vows.map((v,i)=>({
      id:v?.id||('vow-'+Date.now()+'-'+i),
      title:String(v?.title||'未設定'),
      rank:ranks.includes(v?.rank)?v.rank:'Dangerous',
      progress:clamp(v?.progress)
    }));
    syncLegacy(c);
    return c;
  }
  function syncLegacy(c){
    const first=Array.isArray(c.vows)&&c.vows.length?c.vows[0]:null;
    c.vow=first?{title:first.title,rank:first.rank,progress:first.progress}:{title:'未設定',rank:'Dangerous',progress:0};
  }
  function rankJa(rank){return({Troublesome:'面倒',Dangerous:'危険',Formidable:'手強い',Extreme:'極限',Epic:'壮大'})[rank]||rank}

  function card(v){
    return `<article class="vow-manager-card" data-vow-id="${esc(v.id)}">
      <div class="vow-manager-head"><div><strong>${esc(v.title)}</strong><small>${esc(v.rank)}（${rankJa(v.rank)}）</small></div><button class="vow-delete" type="button" data-vow-delete="${esc(v.id)}">削除</button></div>
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
      ch.vows.push({id:'vow-'+Date.now(),title,rank:$('newVowRank')?.value||'Dangerous',progress:0});
      syncLegacy(ch);write(s);render();
    };

    body.querySelectorAll('[data-vow-step]').forEach(btn=>btn.onclick=()=>{
      const s=read(),ch=ensure(s); if(!ch)return;
      const v=ch.vows.find(x=>x.id===btn.dataset.vowId); if(!v)return;
      v.progress=clamp(v.progress+Number(btn.dataset.vowStep||0));
      syncLegacy(ch);write(s);render();
    });

    body.querySelectorAll('[data-vow-delete]').forEach(btn=>btn.onclick=()=>{
      const s=read(),ch=ensure(s); if(!ch)return;
      ch.vows=ch.vows.filter(x=>x.id!==btn.dataset.vowDelete);
      syncLegacy(ch);write(s);render();
    });
  }

  function openVows(){
    const modal=$('sideToolModal'),title=$('sideToolTitle');
    if(!modal||!title)return;
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
