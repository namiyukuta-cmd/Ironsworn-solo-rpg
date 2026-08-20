(()=>{'use strict';
const DRAFT_KEY='ironsworn-working-draft-v3';
const SAVES_KEY='ironsworn-saves-v3';
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);const charId=params.get('char')||'shirogane';
function getCharacter(){
  try{const p=JSON.parse(sessionStorage.getItem(DRAFT_KEY)||'null');if(p&&p.id===charId&&p.character)return {kind:'draft',pack:p,character:p.character}}catch(e){}
  try{const s=JSON.parse(localStorage.getItem(SAVES_KEY)||'{}');if(s&&s[charId])return {kind:'save',saves:s,character:s[charId]}}catch(e){}
  return null;
}
function persist(ctx){if(!ctx)return;if(ctx.kind==='draft')sessionStorage.setItem(DRAFT_KEY,JSON.stringify(ctx.pack));else localStorage.setItem(SAVES_KEY,JSON.stringify(ctx.saves))}
function statusText(v){return v==='cool'?'回復中':'使用可能'}
async function init(){
  if(charId!=='shirogane'){$('title').textContent='刺青データなし';$('list').innerHTML='<div class="empty">このページは白金専用です。</div>';return}
  const res=await fetch('saves/characters/shirogane-tattoos.json?v=1');if(!res.ok)throw new Error('刺青データを読み込めませんでした');const data=await res.json();
  const ctx=getCharacter();const states=(ctx&&ctx.character.tattoos)||{};$('title').textContent=data.characterName+'の刺青';const list=$('list');list.innerHTML='';
  data.tattoos.forEach(t=>{const card=document.createElement('article');card.className='tattoo-card';const state=states[t.name]||'ready';card.innerHTML='<div class="tattoo-head"><div><h2>'+t.name+'</h2><span>'+t.part+'</span></div><button type="button" class="state '+(state==='cool'?'cool':'')+'">'+statusText(state)+'</button></div><p>'+t.effect+'</p><dl><dt>対応</dt><dd>'+t.moves+'</dd><dt>使用後</dt><dd>'+t.cost+'</dd><dt>回復目安</dt><dd>'+t.recovery+'</dd></dl>'+(t.note?'<div class="note">'+t.note+'</div>':'');
    const b=card.querySelector('.state');b.onclick=()=>{if(!ctx)return;const now=(ctx.character.tattoos&&ctx.character.tattoos[t.name])||'ready';ctx.character.tattoos=ctx.character.tattoos||{};ctx.character.tattoos[t.name]=now==='cool'?'ready':'cool';persist(ctx);b.textContent=statusText(ctx.character.tattoos[t.name]);b.classList.toggle('cool',ctx.character.tattoos[t.name]==='cool')};list.appendChild(card)});
}
$('back').onclick=()=>{location.href='index.html#game'};init().catch(e=>{$('list').innerHTML='<div class="empty">'+e.message+'</div>'});
})();
