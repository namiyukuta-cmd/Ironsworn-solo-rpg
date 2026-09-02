(()=>{'use strict';
const KEY='ironsworn-private-loaded-save-v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let adding=false;

function read(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){return null}}
function write(save,notify=true){
 if(!save?.character)return;
 save.character.updatedAt=new Date().toISOString();
 sessionStorage.setItem(KEY,JSON.stringify(save));
 if(notify)window.dispatchEvent(new CustomEvent('ironsworn:statechange'))
}
function slug(){return 'loc-'+Date.now()+'-'+Math.random().toString(36).slice(2,6)}
function normalize(save){
 if(!save?.character)return null;
 const c=save.character;
 let changed=false;
 if(!c.map||typeof c.map!=='object'){
  c.map={format:'ironsworn-point-map-v1',currentLocationId:null,locations:[],connections:[]};
  changed=true;
 }
 const map=c.map;
 if(map.format!=='ironsworn-point-map-v1'){map.format='ironsworn-point-map-v1';changed=true}
 if(!Array.isArray(map.locations)){map.locations=[];changed=true}
 if(!Array.isArray(map.connections)){map.connections=[];changed=true}
 if(!map.locations.length){
  const start=String(c.setup?.world?.startLocation||'開始地点').trim()||'開始地点';
  map.locations.push({id:'loc-start',name:start,type:'街・集落',notes:'',discovered:true,createdAt:new Date().toISOString()});
  map.currentLocationId='loc-start';
  changed=true;
 }
 if(!map.currentLocationId||!map.locations.some(x=>x.id===map.currentLocationId)){
  map.currentLocationId=map.locations[0]?.id||null;
  changed=true;
 }
 map.locations.forEach(x=>{if(x.discovered==null)x.discovered=true});
 if(changed)write(save,false);
 return map
}
function current(map){return map.locations.find(x=>x.id===map.currentLocationId)||map.locations[0]||null}
function locationById(map,id){return map.locations.find(x=>x.id===id)||null}
function connectionsFor(map,id){return map.connections.filter(x=>x.from===id||x.to===id)}
function otherEnd(conn,id){return conn.from===id?conn.to:conn.from}
function contextObject(save){
 const map=normalize(save);if(!map)return null;
 const here=current(map);
 return {
  currentLocation:here?{id:here.id,name:here.name,type:here.type,notes:here.notes||''}:null,
  locations:map.locations.map(x=>({id:x.id,name:x.name,type:x.type||'',notes:x.notes||'',discovered:x.discovered!==false})),
  connections:map.connections.map(x=>({from:x.from,to:x.to,travel:x.travel||'',notes:x.notes||''}))
 }
}
window.IRONSWORD_POINT_MAP={
 get(){const save=read();return contextObject(save)},
 getCurrent(){const ctx=this.get();return ctx?.currentLocation||null}
};

function mapHtml(map){
 const here=current(map);
 let html='<section class="point-map" id="pointMap"><div class="point-map-head"><div><small>POINT MAP</small><h3>地図</h3></div><button id="mapAddBtn" type="button">＋ 場所</button></div>';
 if(here)html+='<div class="map-current"><small>現在地</small><b>'+esc(here.name)+'</b>'+(here.type?'<span>'+esc(here.type)+'</span>':'')+'</div>';
 html+='<div class="map-locations">';
 for(const loc of map.locations){
  const conns=connectionsFor(map,loc.id);
  const links=conns.length?conns.map(conn=>{const other=locationById(map,otherEnd(conn,loc.id));if(!other)return'';return '<span>'+esc(other.name)+(conn.travel?' ・ '+esc(conn.travel):'')+'</span>'}).filter(Boolean).join(''):'<em>まだ道は記録されていません。</em>';
  html+='<article class="map-location'+(loc.id===map.currentLocationId?' current':'')+'"><div class="map-location-top"><div><strong>'+esc(loc.name)+'</strong><small>'+esc(loc.type||'場所')+'</small></div>'+(loc.id===map.currentLocationId?'<b class="map-here">現在地</b>':'<button type="button" data-map-move="'+esc(loc.id)+'">ここへ移動</button>')+'</div>'+(loc.notes?'<p>'+esc(loc.notes)+'</p>':'')+'<div class="map-links"><small>つながり</small>'+links+'</div></article>';
 }
 html+='</div>';
 if(adding)html+=addFormHtml(map);
 html+='</section>';
 return html
}
function addFormHtml(map){
 const here=current(map);
 const fromOptions=map.locations.map(x=>'<option value="'+esc(x.id)+'"'+(x.id===here?.id?' selected':'')+'>'+esc(x.name)+'</option>').join('');
 return '<div class="map-add-form"><h4>場所を追加</h4><label>場所名<input id="mapName" maxlength="60" placeholder="例：古い鉱山"></label><label>種類<select id="mapType"><option>街・集落</option><option>森・荒野</option><option>山・峠</option><option>遺跡・建物</option><option>その他</option></select></label><label>どこからつながる？<select id="mapFrom"><option value="">まだつながり不明</option>'+fromOptions+'</select></label><label>移動の目安<input id="mapTravel" maxlength="60" placeholder="例：徒歩半日 / 街道で1日"></label><label>メモ<textarea id="mapNotes" rows="3" placeholder="分かっていることだけ"></textarea></label><div class="map-add-actions"><button id="mapAddCancel" type="button">キャンセル</button><button id="mapAddSave" type="button">追加</button></div></div>'
}
function bind(save,map,root){
 const add=$('mapAddBtn');if(add)add.onclick=()=>{adding=!adding;render()};
 const cancel=$('mapAddCancel');if(cancel)cancel.onclick=()=>{adding=false;render()};
 root.querySelectorAll('[data-map-move]').forEach(b=>b.onclick=()=>{map.currentLocationId=b.dataset.mapMove;write(save)});
 const saveBtn=$('mapAddSave');if(saveBtn)saveBtn.onclick=()=>{
  const name=String($('mapName')?.value||'').trim();if(!name){$('mapName')?.focus();return}
  const id=slug(),from=String($('mapFrom')?.value||''),travel=String($('mapTravel')?.value||'').trim();
  map.locations.push({id,name,type:String($('mapType')?.value||'その他'),notes:String($('mapNotes')?.value||'').trim(),discovered:true,createdAt:new Date().toISOString()});
  if(from&&from!==id)map.connections.push({id:'conn-'+Date.now(),from,to:id,travel,notes:''});
  adding=false;write(save)
 };
}
function render(){
 const save=read(),map=normalize(save),road=$('roadContent');if(!save||!map||!road)return;
 const old=$('pointMap');if(old)old.remove();
 road.insertAdjacentHTML('beforeend',mapHtml(map));
 const root=$('pointMap');if(root)bind(save,map,root)
}
window.addEventListener('ironsworn:statechange',render);
setTimeout(render,0);
})();
