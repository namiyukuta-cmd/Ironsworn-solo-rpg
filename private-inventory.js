(()=>{'use strict';
const KEY='ironsworn-private-loaded-save-v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let editingIndex=null;
let adding=false;

function read(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){return null}}
function normalize(save){
 if(!save?.character)return null;
 const c=save.character;
 c.inventory=Array.isArray(c.inventory)?c.inventory:[];
 return c
}
function persist(save){
 save.character.updatedAt=new Date().toISOString();
 save.name=save.character.name||save.name;
 sessionStorage.setItem(KEY,JSON.stringify(save));
 window.dispatchEvent(new CustomEvent('ironsworn:statechange'))
}
function itemData(x){
 if(typeof x==='string')return{name:x,qty:'',note:''};
 return{
  name:String(x?.name??''),
  qty:x?.qty==null?'':String(x.qty),
  note:String(x?.note??x?.description??'')
 }
}
function editorHtml(item,index){
 const d=itemData(item||{});
 return '<div class="inventory-editor">'+
  '<label>名前<input id="inventoryName" maxlength="80" value="'+esc(d.name)+'" placeholder="例：草刈り鎌の刃の欠片"></label>'+
  '<label>個数<input id="inventoryQty" inputmode="numeric" maxlength="6" value="'+esc(d.qty)+'" placeholder="空欄でも可"></label>'+
  '<label>メモ<textarea id="inventoryNote" rows="3" placeholder="大きさ、用途、特徴など">'+esc(d.note)+'</textarea></label>'+
  '<div class="inventory-editor-actions"><button id="inventoryCancelBtn" type="button">キャンセル</button><button id="inventorySaveBtn" class="primary" type="button">保存</button></div>'+
  '</div>'
}
function cardHtml(x,index){
 const d=itemData(x);
 const qty=d.qty!==''?' × '+d.qty:'';
 return '<article class="inventory-card inventory-edit-card">'+
  '<div class="inventory-card-head"><strong>'+esc((d.name||'所持品')+qty)+'</strong><div class="inventory-card-actions"><button type="button" data-inventory-edit="'+index+'">編集</button><button type="button" data-inventory-delete="'+index+'">削除</button></div></div>'+
  (d.note?'<p>'+esc(d.note)+'</p>':'')+
  '</article>'+
  (editingIndex===index?editorHtml(x,index):'')
}
function render(){
 const save=read(),c=normalize(save),box=$('inventoryContent');
 if(!c||!box)return;
 let html='<div class="inventory-title-row"><h2>所持品</h2><button id="inventoryAddBtn" class="inventory-add-btn" type="button">＋ 追加</button></div>';
 html+=c.inventory.length?c.inventory.map(cardHtml).join(''):'<div class="empty">所持品はまだありません。</div>';
 if(adding)html+=editorHtml(null,-1);
 box.innerHTML=html;
 const addBtn=$('inventoryAddBtn');if(addBtn)addBtn.onclick=()=>{adding=true;editingIndex=null;render()};
 box.querySelectorAll('[data-inventory-edit]').forEach(b=>b.onclick=()=>{adding=false;editingIndex=Number(b.dataset.inventoryEdit);render()});
 box.querySelectorAll('[data-inventory-delete]').forEach(b=>b.onclick=()=>{
  const i=Number(b.dataset.inventoryDelete);if(!Number.isInteger(i)||!c.inventory[i])return;
  c.inventory.splice(i,1);adding=false;editingIndex=null;persist(save)
 });
 const cancel=$('inventoryCancelBtn');if(cancel)cancel.onclick=()=>{adding=false;editingIndex=null;render()};
 const saveBtn=$('inventorySaveBtn');if(saveBtn)saveBtn.onclick=()=>{
  const name=($('inventoryName')?.value||'').trim();
  if(!name){$('inventoryName')?.focus();return}
  const qtyRaw=($('inventoryQty')?.value||'').trim();
  const note=($('inventoryNote')?.value||'').trim();
  const item={name};
  if(qtyRaw!=='')item.qty=/^-?\d+$/.test(qtyRaw)?Number(qtyRaw):qtyRaw;
  if(note)item.note=note;
  if(adding)c.inventory.push(item);else if(editingIndex!=null)c.inventory[editingIndex]=item;
  adding=false;editingIndex=null;persist(save)
 };
 if(adding||editingIndex!=null)setTimeout(()=>$('inventoryName')?.focus(),0)
}

window.addEventListener('ironsworn:statechange',render);
setTimeout(render,0);
})();
