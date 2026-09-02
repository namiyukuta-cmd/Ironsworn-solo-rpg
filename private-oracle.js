(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const pad=n=>String(n===100?0:n).padStart(2,'0');
  let current='location';

  const categories=[
    ['action','行動'],
    ['scene','シーン'],
    ['region','地域'],
    ['location','ロケーション'],
    ['descriptor','場所の特徴'],
    ['origin','名前の由来'],
    ['settlement','集落名']
  ];

  function random100(){return Math.floor(Math.random()*100)+1}
  function byRoll(table,roll){
    if(!Array.isArray(table)||!table.length)return null;
    return table.find(x=>Number(x.roll)===roll)||table[roll-1]||null
  }
  function rollSimple(table){
    const roll=random100(),item=byRoll(table,roll);
    return{roll:pad(roll),result:item?.result||item?.location||'表を読み込めませんでした'}
  }
  function rollSettlement(){
    const table=window.IRONSWORN_SETTLEMENT_NAME_ORACLE_JA;
    if(!table?.prefixes?.length||!table?.suffixes?.length)return{roll:'—',result:'集落名表を読み込めませんでした'};
    const a=random100(),b=random100();
    const prefix=table.prefixes[a-1],suffix=table.suffixes[b-1];
    return{roll:pad(a)+' + '+pad(b),result:prefix+suffix}
  }
  function rollCategory(key){
    if(key==='action')return rollSimple(window.IRONSWORN_ACTION_ORACLE_JA);
    if(key==='scene')return rollSimple(window.IRONSWORN_SCENE_ORACLE_JA);
    if(key==='region')return rollSimple(window.IRONSWORN_REGION_ORACLE_JA);
    if(key==='location')return rollSimple(window.IRONSWORN_LOCATION_ORACLE_JA);
    if(key==='descriptor')return rollSimple(window.IRONSWORN_LOCATION_DESCRIPTOR_ORACLE_JA);
    if(key==='origin')return rollSimple(window.IRONSWORN_SETTLEMENT_ORIGIN_ORACLE_JA);
    if(key==='settlement')return rollSettlement();
    return{roll:'—',result:'—'}
  }
  function labelFor(key){return(categories.find(x=>x[0]===key)||['','オラクル'])[1]}

  function drawResult(){
    const r=rollCategory(current);
    const kind=$('oracleKind'),roll=$('oracleMultiRoll'),result=$('oracleMultiResult');
    if(kind)kind.textContent=(current==='settlement'?'d100 × 2 ':'d100 ')+labelFor(current);
    if(roll)roll.textContent=r.roll;
    if(result)result.textContent=r.result;
    document.querySelectorAll('.oracle-category-btn').forEach(b=>b.classList.toggle('on',b.dataset.oracleCategory===current))
  }

  function openOracle(){
    const modal=$('sideToolModal');
    if(!modal)return;
    $('sideToolTitle').textContent='オラクル';
    $('sideToolBody').innerHTML=`
      <div class="oracle-category-grid">
        ${categories.map(([key,label])=>`<button class="oracle-category-btn" type="button" data-oracle-category="${key}">${label}</button>`).join('')}
      </div>
      <div class="oracle-result oracle-multi-result">
        <small id="oracleKind"></small>
        <b id="oracleMultiRoll">—</b>
        <strong id="oracleMultiResult">—</strong>
      </div>
      <button id="oracleMultiReroll" class="oracle-roll-btn" type="button">もう一度振る</button>
      <p class="oracle-note">「シーン」はこのゲーム用に追加した100個のシーン表です。その他はIronswornのオラクルを日本語化・実装しています。</p>`;
    modal.classList.add('on');
    modal.setAttribute('aria-hidden','false');
    document.querySelectorAll('.oracle-category-btn').forEach(b=>b.onclick=()=>{current=b.dataset.oracleCategory;drawResult()});
    $('oracleMultiReroll').onclick=drawResult;
    drawResult()
  }

  const oracleBtn=$('oracleBtn');
  if(oracleBtn)oracleBtn.onclick=openOracle;
})();
