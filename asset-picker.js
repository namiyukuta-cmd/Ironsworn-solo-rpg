const STORE_KEY="ironsworn-characters-v1",ACTIVE_KEY="ironsworn-active-character",DATA_FILES=["assets/custom.json","assets/companions.json","assets/paths-1.json","assets/paths-2.json","assets/combat.json","assets/rituals.json"];
let store={};try{store=JSON.parse(localStorage.getItem(STORE_KEY)||"{}")||{}}catch(e){}const params=new URLSearchParams(location.search),charId=params.get("char")||localStorage.getItem(ACTIVE_KEY),ch=store[charId];if(!ch)location.href="index.html";let data=[],filter="すべて",query="",pending=null,pendingAbility=0;const types=["すべて","相棒","パス","戦闘タレント","儀式","カスタム"];

const TERMS=[
 ["Reach Your Destination","目的地に着いた時の判定"],
 ["Undertake a Journey","旅を進める判定"],
 ["Secure an Advantage","有利な状況を作る判定"],
 ["Gather Information","情報を集める判定"],
 ["Swear an Iron Vow","誓いを立てる判定"],
 ["Fulfill Your Vow","誓いを達成できたか確かめる判定"],
 ["Forge a Bond","相手との絆を結ぶ判定"],
 ["Test Your Bond","相手との絆を試す判定"],
 ["Face Desolation","絶望に耐える判定"],
 ["Face Death","死に直面した時の判定"],
 ["Endure Stress","精神的なダメージに耐える判定"],
 ["Endure Harm","ケガやダメージに耐える判定"],
 ["Enter the Fray","戦闘を始める時の判定"],
 ["Turn the Tide","戦闘中に一度だけ流れを変える行動"],
 ["Face Danger","危険に対処する判定"],
 ["Check Your Gear","必要な装備があるか確かめる判定"],
 ["Aid Your Ally","仲間を助ける判定"],
 ["Make Camp","野営する時"],
 ["Resupply","食料や物資を補給する判定"],
 ["Sojourn","集落で休息・交流・補給する判定"],
 ["Compel","説得・交渉・威圧する判定"],
 ["Draw the Circle","一対一の決闘を始める判定"],
 ["Strike","こちらが主導権を持って攻撃する判定"],
 ["Clash","相手の攻撃に応戦する判定"],
 ["Battle","集団戦の判定"],
 ["Heal","治療する判定"],
 ["Forsake Your Vow","誓いを捨てる"],
 ["Maimed","重傷状態"],
 ["Corrupted","汚染状態"],
 ["Shadow","Shadow（隠密・ずる賢さ）"],
 ["Heart","Heart（勇気・人との関わり）"],
 ["Wits","Wits（知恵・観察力）"],
 ["Iron","Iron（力・頑丈さ）"],
 ["Edge","Edge（素早さ・遠距離）"]
];
function easy(t){let s=String(t||"");TERMS.forEach(([a,b])=>s=s.split(a).join(b));return s}
function plainEffect(t){let s=easy(t);s=s.replace(/を強化。?$/,"で有利になる。").replace(/を補助。?$/,"を使う判定で有利になる。").replace(/に強い。?$/,"で有利になる。");return s}

const count=()=> (ch.assets||[]).length,cost=()=>count()<3?0:3;function save(){store[charId]=ch;ch.updatedAt=new Date().toISOString();localStorage.setItem(STORE_KEY,JSON.stringify(store));localStorage.setItem(ACTIVE_KEY,charId)}function status(){charLabel.textContent=ch.name+"　アセット "+count()+"個";costLabel.textContent=cost()===0?"初期枠 "+count()+" / 3":"追加：3 XP（所持 "+(ch.tracks?.xp??0)+" XP）"}function owned(a){return (ch.assets||[]).some(x=>x.assetId===a.id||x.id===a.id||x.name===a.name)}
function renderFilters(){filters.innerHTML="";types.forEach(t=>{const b=document.createElement("button");b.className="filter"+(t===filter?" on":"");b.textContent=t;b.onclick=()=>{filter=t;renderFilters();renderList()};filters.appendChild(b)})}
function renderList(){list.innerHTML="";const q=query.trim().toLowerCase(),arr=data.filter(a=>(filter==="すべて"||a.type===filter)&&(!q||[a.name,a.type,a.summary,...a.abilities.flatMap(x=>[x.label,x.description])].join(" ").toLowerCase().includes(q)));if(!arr.length){list.innerHTML='<div class="empty">該当するアセットがありません。</div>';return}arr.forEach(a=>{const own=owned(a),c=document.createElement("div");c.className="card"+(own?" owned":"");c.innerHTML=`<div class="card-top"><div class="name">${a.name}</div><div class="type">${a.type}</div></div><div class="summary"><b>ざっくり：</b>${easy(a.summary)}</div>${a.requirement?`<div class="req"><b>取得条件：</b>${easy(a.requirement)}</div>`:""}<div class="what-title">このアセットでできること</div><div class="abilities">${a.abilities.map((x,i)=>`<div class="ability"><div class="ability-name"><span class="num">${i+1}</span><b>${x.label}</b>${i===0&&!a.chooseStartingAbility?'<span class="start-tag">最初から</span>':''}</div><div class="effect"><span class="effect-label">使うと</span><span>${plainEffect(x.description)}</span></div></div>`).join("")}</div><button class="choose" ${own?"disabled":""}>${own?"取得済み":(cost()?"3 XPで取得":"選ぶ")}</button>`;c.querySelector(".choose").onclick=()=>begin(a);list.appendChild(c)})}
function begin(a){if(owned(a))return;if(cost()>0&&(ch.tracks?.xp??0)<3){alert("XPが3必要です。");return}pending=a;pendingAbility=0;modalTitle.textContent=a.name;modalText.textContent=a.chooseStartingAbility?"最初に使える能力を1つ選んでください。":"このアセットを追加します。1番目の能力が最初から使えます。";startAbilities.innerHTML="";if(a.chooseStartingAbility)a.abilities.forEach((x,i)=>{const b=document.createElement("button");b.className="start-ability"+(i===0?" selected":"");b.innerHTML=`<strong>${x.label}</strong><span>${plainEffect(x.description)}</span>`;b.onclick=()=>{pendingAbility=i;startAbilities.querySelectorAll(".start-ability").forEach((z,j)=>z.classList.toggle("selected",j===i))};startAbilities.appendChild(b)});modal.classList.add("open")}
function confirmAsset(){if(!pending)return;const c=cost();if(c>0){if((ch.tracks?.xp??0)<c)return;ch.tracks.xp-=c}ch.assets=ch.assets||[];ch.assets.push({assetId:pending.id,name:pending.name,type:pending.type,abilities:pending.abilities.map((x,i)=>[x.label,i===pendingAbility]),source:"asset-library"});save();location.href="index.html#game"}
backBtn.onclick=()=>location.href="index.html#game";search.oninput=e=>{query=e.target.value;renderList()};cancel.onclick=()=>{pending=null;modal.classList.remove("open")};confirm.onclick=confirmAsset;modal.onclick=e=>{if(e.target===modal)cancel.click()};Promise.all(DATA_FILES.map(f=>fetch(f+"?ts="+Date.now(),{cache:"no-store"}).then(r=>r.json()))).then(parts=>{data=parts.flat();status();renderFilters();renderList()}).catch(()=>list.innerHTML='<div class="empty">アセットデータを読み込めませんでした。</div>');
