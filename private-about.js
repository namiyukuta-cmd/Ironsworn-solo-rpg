(()=>{'use strict';
const KEY='ironsworn-private-loaded-save-v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let editing=null;

const PRESET_GROUPS=[
 {title:'世界',store:'worldTruths',fields:[
  ['civilization','文明'],
  ['technology','技術'],
  ['supernatural','超常'],
  ['gods','神'],
  ['otherworld','異世界'],
  ['nonhumans','人間以外']
 ]},
 {title:'主人公の周囲',store:'surroundings',fields:[
  ['hometown','故郷'],
  ['parents','両親'],
  ['nearbyTown','近くの街'],
  ['rivalSettlement','対立相手'],
  ['recentProblem','最近の問題']
 ]}
];

const PRESET_CHOICES={
 'worldTruths.civilization':[
  '小さな集落が点在し、大きな国家はない。',
  '領主や氏族が地域ごとに土地を治めている。',
  '王国や都市国家があり、交易や街道でつながっている。'
 ],
 'worldTruths.technology':[
  '鉄器が中心で、火薬はない。',
  '鉄器に加えて水車・風車・攻城兵器などが使われる。',
  '鍛冶・造船・建築技術が発達しているが、火薬はまだ珍しい。'
 ],
 'worldTruths.supernatural':[
  '超常現象は伝承として語られる程度で、実際に遭遇するのは稀。',
  '魔術や怪異は実在するが、一般の人々には恐れられている。',
  '魔術や怪異は広く知られ、生活や争いにも影響している。'
 ],
 'worldTruths.gods':[
  '神々は信仰されているが、実在するかは分からない。',
  '神々の奇跡だとされる出来事が稀に起こる。',
  '神や精霊は実在し、人の世界に干渉する。'
 ],
 'worldTruths.otherworld':[
  '異世界は知られておらず、存在するかも分からない。',
  '異世界は伝承や宗教の中だけで語られている。',
  '異世界へ通じる場所や境界が、稀に存在する。'
 ],
 'worldTruths.nonhumans':[
  '人間以外の知的種族は知られていない。',
  '人間以外の種族は存在するが、非常に珍しい。',
  '複数の種族が存在し、人間と交流や対立をしている。'
 ],
 'surroundings.hometown':[
  '小さな農村や漁村で育った。',
  '街道沿いの町や交易集落で育った。',
  '城下町や大きな都市で育った。'
 ],
 'surroundings.parents':[
  '両親とも健在で、故郷に暮らしている。',
  '片親だけが健在である。',
  '両親とは死別している、または消息が分からない。'
 ],
 'surroundings.nearbyTown':[
  '半日ほどで行ける市場町がある。',
  '一〜二日ほどで行ける町がある。',
  '大きな街へ行くには数日かかる。'
 ],
 'surroundings.rivalSettlement':[
  '特に決まった対立相手はいない。',
  '近隣の集落や氏族と対立している。',
  '領主・盗賊団・宗教勢力などと対立している。'
 ],
 'surroundings.recentProblem':[
  '食糧や物資が不足している。',
  '盗賊・獣・怪物などの脅威が増えている。',
  '病気・争い・失踪など、人々の不安が広がっている。'
 ]
};

function read(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){return null}}
function normalize(save){
 if(!save?.character)return null;
 const c=save.character;
 c.setup=c.setup||{};
 c.setup.world=c.setup.world||{};
 c.bonds=Array.isArray(c.bonds)?c.bonds:[];
 c.aboutFields=Array.isArray(c.aboutFields)?c.aboutFields.filter(x=>x&&typeof x==='object'):[];
 c.worldTruths=c.worldTruths&&typeof c.worldTruths==='object'?c.worldTruths:{};
 delete c.worldTruths.spaceCivilization;
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
function presetEditorHtml(c,id,label){
 const value=presetValue(c,id),choices=PRESET_CHOICES[id]||[];
 const matched=choices.includes(value),mode=matched?value:(value?'__custom__':'');
 const options=['<option value="">候補から選ぶ</option>']
  .concat(choices.map(v=>'<option value="'+esc(v)+'"'+(mode===v?' selected':'')+'>'+esc(v)+'</option>'))
  .concat('<option value="__custom__"'+(mode==='__custom__'?' selected':'')+'>自分で書く</option>')
  .join('');
 const customValue=mode==='__custom__'?value:'';
 return '<div class="about-editor" data-about-editor="1"><div class="about-editor-title">編集</div><div class="about-fixed-label">'+esc(label)+'</div><label>候補<select id="aboutPresetSelect">'+options+'</select></label><label id="aboutCustomWrap"'+(mode==='__custom__'?'':' hidden')+'>自分で書く<textarea id="aboutFieldValue" rows="4" placeholder="自由に書けます。">'+esc(customValue)+'</textarea></label><div class="about-editor-actions"><button id="aboutCancelBtn" type="button">キャンセル</button><button id="aboutSaveBtn" class="primary" type="button">保存</button></div></div>'
}
function editorHtml(c){
 if(!editing)return'';
 let label='',value='',canRename=false;
 if(editing.kind==='add'){canRename=true}
 else if(editing.kind==='custom'){
  const item=c.aboutFields.find(x=>String(x.id)===String(editing.id));
  if(!item){editing=null;return''}
  label=item.label||'';value=item.value||'';canRename=true
 }else if(editing.kind==='preset'){
  const spec=presetSpec(editing.id);if(!spec){editing=null;return''}
  return presetEditorHtml(c,editing.id,spec.label)
 }else{
  const labels={profile:'人物像・背景',world:'世界の概要',start:'開始地点',bonds:'絆'};
  label=labels[editing.id]||editing.id;value=standardValue(c,editing.id)
 }
 return '<div class="about-editor" data-about-editor="1"><div class="about-editor-title">'+(editing.kind==='add'?'項目を追加':'編集')+'</div>'+(canRename?'<label>項目名<input id="aboutFieldLabel" maxlength="40" value="'+esc(label)+'" placeholder="例：家族、宗教、知っているNPC"></label>':'<div class="about-fixed-label">'+esc(label)+'</div>')+'<label>内容<textarea id="aboutFieldValue" rows="4" placeholder="後から決めても大丈夫です。">'+esc(value)+'</textarea></label><div class="about-editor-actions"><button id="aboutCancelBtn" type="button">キャンセル</button><button id="aboutSaveBtn" class="primary" type="button">保存</button></div></div>'
}
function isEditing(kind,id){return !!editing&&editing.kind===kind&&String(editing.id)===String(id)}
function row(c,label,value,kind,id,custom=false){
 let html='<div class="info-row about-info-row" data-about-row="'+esc(id)+'"><div class="about-row-head"><small>'+esc(label)+'</small><div class="about-row-actions"><button type="button" data-about-edit="'+esc(kind)+'" data-about-id="'+esc(id)+'">編集</button>'+(custom?'<button type="button" data-about-delete="'+esc(id)+'">削除</button>':'')+'</div></div><p>'+esc(text(value,'まだ決めていません。'))+'</p></div>';
 if(isEditing(kind,id))html+=editorHtml(c);
 return html
}
function groupHtml(c,group){
 let html='<div class="about-section-title">'+esc(group.title)+'</div>';
 html+=group.fields.map(([key,label])=>row(c,label,text(c[group.store]?.[key],''),'preset',group.store+'.'+key)).join('');
 return html
}
function bindEditor(save,c){
 const select=$('aboutPresetSelect'),customWrap=$('aboutCustomWrap');
 if(select)select.onchange=()=>{
  const custom=select.value==='__custom__';
  if(customWrap)customWrap.hidden=!custom;
  if(custom)setTimeout(()=>$('aboutFieldValue')?.focus(),0)
 };
 const cancel=$('aboutCancelBtn');if(cancel)cancel.onclick=()=>{editing=null;render()};
 const saveBtn=$('aboutSaveBtn');if(saveBtn)saveBtn.onclick=()=>{
  if(!editing)return;
  if(editing.kind==='preset'){
   const chosen=$('aboutPresetSelect')?.value||'';
   const value=chosen==='__custom__'?($('aboutFieldValue')?.value||'').trim():chosen;
   setPreset(c,editing.id,value)
  }else{
   const value=($('aboutFieldValue')?.value||'').trim();
   if(editing.kind==='standard')setStandard(c,editing.id,value);
   else{
    const label=($('aboutFieldLabel')?.value||'').trim();
    if(!label){$('aboutFieldLabel')?.focus();return}
    if(editing.kind==='add')c.aboutFields.push({id:'about-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),label,value});
    else{const item=c.aboutFields.find(x=>String(x.id)===String(editing.id));if(item){item.label=label;item.value=value}}
   }
  }
  editing=null;persist(save)
 };
 if(!select){const input=$('aboutFieldValue')||$('aboutFieldLabel');if(input)setTimeout(()=>input.focus(),0)}
}
function render(){
 const save=read(),c=normalize(save),box=$('aboutContent');if(!c||!box)return;
 const standard=[['人物像・背景',standardValue(c,'profile'),'profile'],['世界の概要',standardValue(c,'world'),'world'],['開始地点',standardValue(c,'start'),'start'],['絆',standardValue(c,'bonds'),'bonds']];
 let html='<h2>'+esc(c.name||save.name||'主人公')+'</h2>';
 html+=standard.map(x=>row(c,x[0],x[1],'standard',x[2])).join('');
 html+=PRESET_GROUPS.map(group=>groupHtml(c,group)).join('');
 if(c.aboutFields.length){html+='<div class="about-section-title">その他</div>'+c.aboutFields.map(x=>row(c,x.label||'名称未設定',x.value||'','custom',x.id,true)).join('')}
 html+='<button id="aboutAddBtn" class="about-add-btn" type="button">＋ 項目を追加</button>';
 if(editing?.kind==='add')html+=editorHtml(c);
 box.innerHTML=html;
 box.querySelectorAll('[data-about-edit]').forEach(b=>b.onclick=()=>{editing={kind:b.dataset.aboutEdit,id:b.dataset.aboutId};render()});
 box.querySelectorAll('[data-about-delete]').forEach(b=>b.onclick=()=>{const item=c.aboutFields.find(x=>String(x.id)===String(b.dataset.aboutDelete));if(!item)return;if(!confirm('「'+(item.label||'この項目')+'」を削除しますか？'))return;c.aboutFields=c.aboutFields.filter(x=>String(x.id)!==String(b.dataset.aboutDelete));editing=null;persist(save)});
 const add=$('aboutAddBtn');if(add)add.onclick=()=>{editing={kind:'add',id:''};render()};
 bindEditor(save,c)
}
window.addEventListener('ironsworn:statechange',render);
setTimeout(render,0);
})();
