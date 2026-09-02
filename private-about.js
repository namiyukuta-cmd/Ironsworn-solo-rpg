(()=>{'use strict';
const KEY='ironsworn-private-loaded-save-v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let editing=null;

const PRESET_GROUPS=[
 {title:'世界',store:'worldTruths',fields:[
  ['technology','技術'],
  ['supernatural','超常'],
  ['gods','神'],
  ['otherworld','異世界'],
  ['nonhumans','人間以外'],
  ['spaceCivilization','宇宙文明']
 ]},
 {title:'主人公の周囲',store:'surroundings',fields:[
  ['hometown','故郷'],
  ['parents','両親'],
  ['nearbyTown','近くの街'],
  ['north','北'],
  ['south','南'],
  ['west','西'],
  ['east','東'],
  ['rivalSettlement','村と対立'],
  ['recentProblem','最近の問題']
 ]}
];

function read(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){return null}}
function normalize(save){
 if(!save?.character)return null;
 const c=save.character;
 c.setup=c.setup||{};
 c.setup.world=c.setup.world||{};
 c.bonds=Array.isArray(c.bonds)?c.bonds:[];
 c.aboutFields=Array.isArray(c.aboutFields)?c.aboutFields.filter(x=>x&&typeof x==='object'):[];
 c.worldTruths=c.worldTruths&&typeof c.worldTruths==='object'?c.worldTruths:{};
 c.surroundings=c.surroundings&&typeof c.surroundings==='object'?c.surroundings:{};
 return c
}
function bondNames(c){return c.bonds.map(x=>typeof x==='string'?x:(x&&x.name)||'').filter(Boolean)}
function text(v,fallback){const s=String(v??'').trim();return s&&s!=='未設定'?s:fallback}
function standardValue(c,key){
 if(key==='profile')return text(c.profile||c.notes,'');
 if(key==='world')return text(c.setup.world.name,'');
 if(key==='start')return text(c.setup.world.startLocation,'');
 if(key==='bonds')return bondNames(c).join('\n');
 return''
}
function setStandard(c,key,value){
 if(key==='profile'){c.profile=value;return}
 if(key==='world'){c.setup.world.name=value||'未設定';return}
 if(key==='start'){c.setup.world.startLocation=value||'未設定';return}
 if(key==='bonds'){
  const names=value.split(/\n|\/|、|,/).map(x=>x.trim()).filter(Boolean),old=c.bonds;
  c.bonds=names.map(name=>old.find(x=>x&&typeof x==='object'&&x.name===name)||name)
 }
}
function presetSpec(id){
 for(const group of PRESET_GROUPS){
  for(const field of group.fields){if(group.store+'.'+field[0]===id)return{store:group.store,key:field[0],label:field[1],group:group.title}}
 }
 return null
}
function presetValue(c,id){const s=presetSpec(id);return s?text(c[s.store]?.[s.key],''):''}
function setPreset(c,id,value){const s=presetSpec(id);if(!s)return;c[s.store]=c[s.store]&&typeof c[s.store]==='object'?c[s.store]:{};c[s.store][s.key]=value}
function persist(save){
 save.character.updatedAt=new Date().toISOString();
 save.name=save.character.name||save.name;
 sessionStorage.setItem(KEY,JSON.stringify(save));
 window.dispatchEvent(new CustomEvent('ironsworn:statechange'))
}
function row(label,value,kind,id,custom=false){
 return '<div class="info-row about-info-row" data-about-row="'+esc(id)+'"><div class="about-row-head"><small>'+esc(label)+'</small><div class="about-row-actions"><button type="button" data-about-edit="'+esc(kind)+'" data-about-id="'+esc(id)+'">編集</button>'+(custom?'<button type="button" data-about-delete="'+esc(id)+'">削除</button>':'')+'</div></div><p>'+esc(text(value,'まだ決めていません。'))+'</p></div>'
}
function groupHtml(c,group){
 let html='<div class="about-section-title">'+esc(group.title)+'</div>';
 html+=group.fields.map(([key,label])=>row(label,text(c[group.store]?.[key],''),'preset',group.store+'.'+key)).join('');
 return html
}
function editorHtml(c){
 if(!editing)return'';
 let label='',value='',canRename=false;
 if(editing.kind==='add'){label='';value='';canRename=true}
 else if(editing.kind==='custom'){
  const item=c.aboutFields.find(x=>String(x.id)===String(editing.id));
  if(!item){editing=null;return''}
  label=item.label||'';value=item.value||'';canRename=true
 }else if(editing.kind==='preset'){
  const spec=presetSpec(editing.id);if(!spec){editing=null;return''}
  label=spec.label;value=presetValue(c,editing.id)
 }else{
  const labels={profile:'人物像・背景',world:'世界の概要',start:'開始地点',bonds:'絆'};
  label=labels[editing.id]||editing.id;value=standardValue(c,editing.id)
 }
 return '<div class="about-editor"><div class="about-editor-title">'+(editing.kind==='add'?'項目を追加':'編集')+'</div>'+(canRename?'<label>項目名<input id="aboutFieldLabel" maxlength="40" value="'+esc(label)+'" placeholder="例：家族、宗教、知っているNPC"></label>':'<div class="about-fixed-label">'+esc(label)+'</div>')+'<label>内容<textarea id="aboutFieldValue" rows="4" placeholder="後から決めても大丈夫です。">'+esc(value)+'</textarea></label><div class="about-editor-actions"><button id="aboutCancelBtn" type="button">キャンセル</button><button id="aboutSaveBtn" class="primary" type="button">保存</button></div></div>'
}
function render(){
 const save=read(),c=normalize(save),box=$('aboutContent');if(!c||!box)return;
 const standard=[['人物像・背景',standardValue(c,'profile'),'profile'],['世界の概要',standardValue(c,'world'),'world'],['開始地点',standardValue(c,'start'),'start'],['絆',standardValue(c,'bonds'),'bonds']];
 let html='<h2>'+esc(c.name||save.name||'主人公')+'</h2>';
 html+=standard.map(x=>row(x[0],x[1],'standard',x[2])).join('');
 html+=PRESET_GROUPS.map(group=>groupHtml(c,group)).join('');
 if(c.aboutFields.length){html+='<div class="about-section-title">その他</div>'+c.aboutFields.map(x=>row(x.label||'名称未設定',x.value||'','custom',x.id,true)).join('')}
 html+='<button id="aboutAddBtn" class="about-add-btn" type="button">＋ 項目を追加</button>'+editorHtml(c);
 box.innerHTML=html;
 box.querySelectorAll('[data-about-edit]').forEach(b=>b.onclick=()=>{editing={kind:b.dataset.aboutEdit,id:b.dataset.aboutId};render()});
 box.querySelectorAll('[data-about-delete]').forEach(b=>b.onclick=()=>{const item=c.aboutFields.find(x=>String(x.id)===String(b.dataset.aboutDelete));if(!item)return;if(!confirm('「'+(item.label||'この項目')+'」を削除しますか？'))return;c.aboutFields=c.aboutFields.filter(x=>String(x.id)!==String(b.dataset.aboutDelete));editing=null;persist(save)});
 const add=$('aboutAddBtn');if(add)add.onclick=()=>{editing={kind:'add',id:''};render()};
 const cancel=$('aboutCancelBtn');if(cancel)cancel.onclick=()=>{editing=null;render()};
 const saveBtn=$('aboutSaveBtn');if(saveBtn)saveBtn.onclick=()=>{
  const value=($('aboutFieldValue')?.value||'').trim();
  if(editing.kind==='standard')setStandard(c,editing.id,value);
  else if(editing.kind==='preset')setPreset(c,editing.id,value);
  else{
   const label=($('aboutFieldLabel')?.value||'').trim();
   if(!label){$('aboutFieldLabel').focus();return}
   if(editing.kind==='add')c.aboutFields.push({id:'about-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),label,value});
   else{const item=c.aboutFields.find(x=>String(x.id)===String(editing.id));if(item){item.label=label;item.value=value}}
  }
  editing=null;persist(save)
 }
}
window.addEventListener('ironsworn:statechange',render);
setTimeout(render,0);
})();
