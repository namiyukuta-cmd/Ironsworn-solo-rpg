(()=>{'use strict';
const KEY='ironsworn-private-loaded-save-v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const r=(n)=>Math.floor(Math.random()*n)+1;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const rankOrder=['Troublesome','Dangerous','Formidable','Extreme','Epic'];
const questStep={Troublesome:3,Dangerous:2,Formidable:1,Extreme:.5,Epic:.25};
const xpStrong={Troublesome:1,Dangerous:2,Formidable:3,Extreme:4,Epic:5};
const xpWeak={Troublesome:0,Dangerous:1,Formidable:2,Extreme:3,Epic:4};
let save=read(); if(!save?.character)return; let c=save.character;
function read(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){return null}}
function persist(){save.character=c;c.updatedAt=new Date().toISOString();sessionStorage.setItem(KEY,JSON.stringify(save));syncTop()}
function syncTop(){
 const map=[['healthSelect','health'],['spiritSelect','spirit'],['supplySelect','supply']];
 map.forEach(([id,k])=>{const el=$(id);if(el)el.value=String(clamp(c.tracks?.[k]??5,0,5))});
 const mv=$('momentumValue');if(mv)mv.textContent=String(clamp(c.tracks?.momentum??2,-6,10));
}
function active(){return (c.quests||[]).find(q=>q.status==='active')||null}
function stage(q){return q?.stages?.[clamp(q.stageIndex||0,0,Math.max(0,(q.stages||[]).length-1))]||null}
function actionRoll(stat,add=0){const a=r(6),c1=r(10),c2=r(10),sv=Number(c.stats?.[stat])||0,score=Math.min(10,a+sv+add);return{a,c1,c2,score,stat,add,result:score>c1&&score>c2?'strong':score>c1||score>c2?'weak':'miss',match:c1===c2}}
function progressRoll(score){const c1=r(10),c2=r(10),s=Math.floor(Number(score)||0);return{c1,c2,score:s,result:s>c1&&s>c2?'strong':s>c1||s>c2?'weak':'miss',match:c1===c2}}
function addTrack(k,n){c.tracks=c.tracks||{};const ranges={health:[0,5],spirit:[0,5],supply:[0,5],momentum:[-6,10],xp:[0,99]},rr=ranges[k]||[0,99];c.tracks[k]=clamp((Number(c.tracks[k])||0)+n,rr[0],rr[1])}
function log(text,type='questPlay'){c.log=Array.isArray(c.log)?c.log:[];c.log.push({type,at:new Date().toISOString(),text})}
function diceHtml(x){return `<div class="move-dice"><span>ACTION <b>${x.a??'—'}</b></span><span>SCORE <b>${x.score}</b></span><span>CHALLENGE <b>${x.c1}</b> / <b>${x.c2}</b></span></div>`}
function resultLabel(x){return x==='strong'?'STRONG HIT':x==='weak'?'WEAK HIT':'MISS'}
function priceOne(){
 const n=r(100);let text='',cost=null;
 if(n<=2){text='事態がさらに悪化する。';cost=['momentum',-2]}
 else if(n<=5)text='信頼していた人物や共同体があなたへの信頼を失う、または敵対する。';
 else if(n<=9)text='大切な人物や共同体が危険にさらされる。';
 else if(n<=16)text='何か、または誰かと引き離される。';
 else if(n<=23)text='行動が意図しない結果を招く。';
 else if(n<=32){text='価値あるものを失う、または壊してしまう。';cost=['supply',-1]}
 else if(n<=41)text='現在の状況が悪化する。';
 else if(n<=50)text='新たな危険や敵が現れる。';
 else if(n<=59){text='遅れが生じる、または不利な立場になる。';cost=['momentum',-1]}
 else if(n<=68){text='身体的な損害を受ける。';cost=['health',-1]}
 else if(n<=77){text='精神的な負担を受ける。';cost=['spirit',-1]}
 else if(n<=85)text='予想外の展開がクエストを複雑にする。';
 else if(n<=90){text='資源を浪費する。';cost=['supply',-1]}
 else if(n<=94)text='本意に反する行動を強いられる。';
 else if(n<=98){text='あなた、または味方が危険にさらされる。';cost=['health',-1]}
 else{text='二つの災難が同時に起きる。';cost=['momentum',-2]}
 if(cost)addTrack(cost[0],cost[1]);return{n,text,cost};
}
function payPrice(){const p=priceOne();persist();return p}
function kind(s){const id=s?.id||'';
 if(['last','scene','inspect','ask','learn','motive','truth','entry','prepare'].includes(id))return'investigate';
 if(['trail','follow','track','pursue','find','deep'].includes(id))return'track';
 if(['reach','travel','descend','return','home','arrive','escape'].includes(id))return'travel';
 return'danger';
}
function moveActions(s){switch(kind(s)){
 case'investigate':return[{label:'詳しく調べる',move:'Gather Information',stat:'wits'},{label:'準備して有利を取る',move:'Secure an Advantage',stat:'wits'},{label:'気配を消して踏み込む',move:'Face Danger',stat:'shadow'}];
 case'track':return[{label:'痕跡を追う',move:'Gather Information',stat:'wits'},{label:'素早く追跡する',move:'Face Danger',stat:'edge'},{label:'慎重に先回りする',move:'Secure an Advantage',stat:'wits'}];
 case'travel':return[{label:'危険な道を進む',move:'Undertake a Journey',stat:'wits'},{label:'安全な経路を探す',move:'Secure an Advantage',stat:'wits'},{label:'急いで突破する',move:'Face Danger',stat:'edge'}];
 default:return[{label:'力で突破する',move:'Face Danger',stat:'iron'},{label:'素早く切り抜ける',move:'Face Danger',stat:'edge'},{label:'隠れて回避する',move:'Face Danger',stat:'shadow'}];}}
function setActionArea(html){const box=document.querySelector('.quest-actions');if(box)box.innerHTML=html}
function setQuest(title,text,meta,obj){$('questTitle').textContent=title;$('questText').innerHTML=text;$('questMetaLabel').textContent=meta;$('questObjective').innerHTML=obj}
function offerView(){const q=c.questOffer;if(!q)return;const accept=$('questAcceptBtn');if(!accept)return;accept.textContent='鉄の誓いを立てて受ける';accept.onclick=()=>swear(q);const reroll=$('generateQuestBtn');if(reroll)reroll.textContent='別のクエストを作る';}
function swear(q){const x=actionRoll('heart');
 if(x.result==='strong'){addTrack('momentum',2);accept(q);persist();renderActive();return}
 if(x.result==='weak'){addTrack('momentum',1);accept(q);persist();renderActive();return}
 const p=payPrice();setQuest('鉄の誓い',diceHtml(x)+`<div class="move-result miss"><b>MISS</b><p>誓いを始める前に重大な障害が立ちはだかった。</p><p class="price">Pay the Price ${p.n}: ${esc(p.text)}</p></div>`,'SWEAR AN IRON VOW','それでもこの誓いを引き受けますか？');
 setActionArea('<button id="vowPress" class="quest-play-btn primary">それでも進む（Momentum -2）</button><button id="vowDrop" class="quest-play-btn">今回は受けない</button>');
 $('vowPress').onclick=()=>{addTrack('momentum',-2);accept(q);persist();renderActive()};
 $('vowDrop').onclick=()=>{c.questOffer=null;persist();location.reload()};
}
function accept(q){const stages=JSON.parse(JSON.stringify(q.stages||[]));const a={id:q.id,title:q.title,rank:q.rank||'Dangerous',tags:[...(q.tags||[])],giver:q.giver||'',summary:q.summary||'',description:q.description||'',status:'active',source:'ai-board',stageIndex:0,stages,objectives:stages.map(s=>({id:s.id,text:s.objective,done:false})),progress:0,play:{bonus:0,journeys:{}},startedAt:new Date().toISOString(),questDataVersion:1};c.quests=Array.isArray(c.quests)?c.quests:[];c.quests.push(a);c.questOffer=null;log(`鉄の誓いを立てた：「${a.title}」`,'questAccepted')}
function renderActive(message=''){const q=active();if(!q)return; q.play=q.play||{bonus:0,journeys:{}};q.play.journeys=q.play.journeys||{};const s=stage(q);if(!s)return;
 const p=`進捗 ${Number(q.progress||0).toFixed(Number(q.progress||0)%1?2:0)}/10 ・ ${q.rank}`;
 const intro=`<div class="quest-scene"><b>現在の状況</b><p>${esc(s.objective||'状況を確認する。')}</p>${message?`<div class="move-message">${message}</div>`:''}</div>`;
 setQuest(q.title,intro,p,q.readyToFulfill?'誓いを果たせると思うなら、最後の判定へ。':'どう行動しますか？');
 const acts=moveActions(s).map((a,i)=>`<button class="quest-play-btn" data-act="${i}"><b>${esc(a.label)}</b><small>${a.move} +${a.stat.toUpperCase()}</small></button>`).join('');
 let extra='<button id="oracleBtn" class="quest-play-btn oracle"><b>オラクルに聞く</b><small>状況・手掛かりをランダムに決める</small></button>';
 if(kind(s)==='travel'&&q.play.journeys[s.id]?.progress>0)extra+=`<button id="reachBtn" class="quest-play-btn primary"><b>目的地へ到達する</b><small>Reach Your Destination ・ ${Math.floor(q.play.journeys[s.id].progress)} progress</small></button>`;
 if(q.readyToFulfill)extra='<button id="fulfillBtn" class="quest-play-btn primary"><b>誓いを果たす</b><small>Fulfill Your Vow ・ progress '+Math.floor(q.progress||0)+'</small></button>'+extra;
 setActionArea(`<div class="quest-play-grid">${acts}${extra}</div>`);
 document.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>doMove(q,s,moveActions(s)[Number(b.dataset.act)]));
 const o=$('oracleBtn');if(o)o.onclick=()=>oracle(q,s);const rr=$('reachBtn');if(rr)rr.onclick=()=>reachDestination(q,s);const f=$('fulfillBtn');if(f)f.onclick=()=>fulfill(q);
}
function doMove(q,s,a){const bonus=Number(q.play?.bonus)||0;if(q.play)q.play.bonus=0;const x=actionRoll(a.stat,bonus);log(`${a.move}: ${resultLabel(x.result)} (action ${x.a} + ${a.stat} ${c.stats?.[a.stat]||0}${bonus?` + add ${bonus}`:''} = ${x.score}; challenge ${x.c1}/${x.c2})`,'move');
 if(a.move==='Secure an Advantage')return resolveAdvantage(q,s,x);
 if(a.move==='Undertake a Journey')return resolveJourney(q,s,x);
 if(a.move==='Gather Information')return resolveGather(q,s,x);
 return resolveDanger(q,s,x);
}
function resolveAdvantage(q,s,x){if(x.result==='strong'){setQuest(q.title,diceHtml(x)+`<div class="move-result strong"><b>STRONG HIT</b><p>有利な状況を作りました。</p></div>`,'SECURE AN ADVANTAGE','どちらを取りますか？');setActionArea('<button id="advMom" class="quest-play-btn">Momentum +2</button><button id="advAdd" class="quest-play-btn primary">次のMoveに +1</button>');$('advMom').onclick=()=>{addTrack('momentum',2);persist();renderActive('準備が整った。Momentum +2。')};$('advAdd').onclick=()=>{q.play.bonus=1;persist();renderActive('次のMoveに +1 add。')};return}
 if(x.result==='weak'){addTrack('momentum',1);persist();renderActive(diceHtml(x)+`<div class="move-result weak"><b>WEAK HIT</b><p>少し有利になったが、状況は不安定です。Momentum +1。</p></div>`);return}
 const p=payPrice();renderActive(diceHtml(x)+`<div class="move-result miss"><b>MISS</b><p class="price">Pay the Price ${p.n}: ${esc(p.text)}</p></div>`)}
function completeStage(q,s,note){const i=q.stageIndex||0;if(q.objectives?.[i])q.objectives[i].done=true;q.progress=Math.min(10,(Number(q.progress)||0)+(questStep[q.rank]||1));log(`Reach a Milestone：「${s.objective}」 ${note||''}`,'questProgress');if(i<(q.stages||[]).length-1)q.stageIndex=i+1;else q.readyToFulfill=true;persist();renderActive(`<div class="milestone"><b>REACH A MILESTONE</b><p>${esc(note||'重要な進展を得た。')}　進捗を記録しました。</p></div>`)}
function resolveGather(q,s,x){if(x.result==='strong'){addTrack('momentum',2);persist();return completeStage(q,s,'役立つ具体的な手掛かりを得た。Momentum +2。')}
 if(x.result==='weak'){addTrack('momentum',1);const p=priceOne();persist();return completeStage(q,s,`手掛かりは得たが、新しい問題が見えた。Momentum +1。 ${p.text}`)}
 const p=payPrice();renderActive(diceHtml(x)+`<div class="move-result miss"><b>MISS</b><p>調査は不吉な真実を暴きました。</p><p class="price">Pay the Price ${p.n}: ${esc(p.text)}</p></div>`)}
function resolveDanger(q,s,x){if(x.result==='strong'){addTrack('momentum',1);persist();return completeStage(q,s,'危険を切り抜けた。Momentum +1。')}
 if(x.result==='weak'){setQuest(q.title,diceHtml(x)+`<div class="move-result weak"><b>WEAK HIT</b><p>成功しましたが、代償が必要です。</p></div>`,'FACE DANGER','代償を選んでください。');setActionArea('<button class="quest-play-btn" data-cost="momentum">遅延・不利（Momentum -1）</button><button class="quest-play-btn" data-cost="health">疲労・負傷（Health -1）</button><button class="quest-play-btn" data-cost="spirit">恐怖・消耗（Spirit -1）</button><button class="quest-play-btn" data-cost="supply">資源を失う（Supply -1）</button>');document.querySelectorAll('[data-cost]').forEach(b=>b.onclick=()=>{addTrack(b.dataset.cost,-1);persist();completeStage(q,s,'代償を払いながら突破した。')});return}
 const p=payPrice();renderActive(diceHtml(x)+`<div class="move-result miss"><b>MISS</b><p class="price">Pay the Price ${p.n}: ${esc(p.text)}</p></div>`)}
function journeyState(q,s){const j=q.play.journeys[s.id]||(q.play.journeys[s.id]={rank:'Troublesome',progress:0});return j}
function resolveJourney(q,s,x){const j=journeyState(q,s),step=questStep[j.rank]||3;if(x.result==='strong'){setQuest(q.title,diceHtml(x)+`<div class="move-result strong"><b>STRONG HIT</b><p>ウェイポイントへ到達しました。</p></div>`,'UNDERTAKE A JOURNEY',`旅の進捗 ${j.progress}/10`);setActionArea('<button id="journeySafe" class="quest-play-btn">資源を温存して進む</button><button id="journeyFast" class="quest-play-btn primary">急ぐ（Momentum +1 / Supply -1）</button>');$('journeySafe').onclick=()=>{j.progress=Math.min(10,j.progress+step);persist();renderActive('ウェイポイントへ到達。旅の進捗を記録。')};$('journeyFast').onclick=()=>{j.progress=Math.min(10,j.progress+step);addTrack('momentum',1);addTrack('supply',-1);persist();renderActive('急いで進んだ。旅の進捗、Momentum +1、Supply -1。')};return}
 if(x.result==='weak'){j.progress=Math.min(10,j.progress+step);addTrack('supply',-1);persist();renderActive(diceHtml(x)+`<div class="move-result weak"><b>WEAK HIT</b><p>ウェイポイントへ到達。旅の進捗を記録し、Supply -1。</p></div>`);return}
 const p=payPrice();renderActive(diceHtml(x)+`<div class="move-result miss"><b>MISS</b><p>道中で危険に阻まれました。</p><p class="price">Pay the Price ${p.n}: ${esc(p.text)}</p></div>`)}
function reachDestination(q,s){const j=journeyState(q,s),x=progressRoll(j.progress);log(`Reach Your Destination: ${resultLabel(x.result)} (progress ${x.score}; challenge ${x.c1}/${x.c2})`,'move');if(x.result==='strong'){addTrack('momentum',1);persist();return completeStage(q,s,'目的地へ有利な状況で到着した。Momentum +1。')}
 if(x.result==='weak'){const p=priceOne();persist();return completeStage(q,s,`目的地へ着いたが、予想外の問題が待っていた。 ${p.text}`)}
 const idx=rankOrder.indexOf(j.rank);j.progress=1;if(idx>=0&&idx<rankOrder.length-1)j.rank=rankOrder[idx+1];persist();renderActive(`<div class="move-result miss">${diceHtml(x)}<b>MISS</b><p>道を大きく誤りました。旅の進捗を1へ戻し、ランクを${j.rank}へ上げます。</p></div>`)}
function oracle(q,s){const n=r(100),prompts=['思いがけない痕跡が見つかる','誰かがこちらを見ている','天候が急変する','古い足跡が新しい手掛かりにつながる','助けを求める声が聞こえる','危険の正体は予想と違う','近道には代償がある','誰かが重要な事実を隠している','失われた物が別の場所で見つかる','時間が残されていない'];const text=prompts[Math.floor((n-1)/10)];log(`Ask the Oracle ${n}: ${text}`,'oracle');persist();renderActive(`<div class="oracle-result"><b>ASK THE ORACLE　${n}</b><p>${esc(text)}</p></div>`)}
function fulfill(q){const x=progressRoll(q.progress);log(`Fulfill Your Vow: ${resultLabel(x.result)} (progress ${x.score}; challenge ${x.c1}/${x.c2})`,'move');if(x.result==='strong')return finishQuest(q,xpStrong[q.rank]||0,'誓いを果たした。');if(x.result==='weak')return finishQuest(q,xpWeak[q.rank]||0,'誓いは果たしたが、さらに対処すべき真実が明らかになった。');setQuest(q.title,`<div class="move-result miss">${diceHtml(x)}<b>MISS</b><p>誓いはまだ果たされていません。</p></div>`,'FULFILL YOUR VOW','どうしますか？');setActionArea('<button id="recommitBtn" class="quest-play-btn primary">誓い直す</button><button id="forsakeBtn" class="quest-play-btn">誓いを断念する</button>');$('recommitBtn').onclick=()=>{const idx=rankOrder.indexOf(q.rank);q.progress=1;if(idx>=0&&idx<rankOrder.length-1)q.rank=rankOrder[idx+1];q.readyToFulfill=false;q.stages.push({id:'recommit-'+Date.now(),objective:'誓いを阻む新たな重大な障害を乗り越える。'});q.objectives.push({id:q.stages.at(-1).id,text:q.stages.at(-1).objective,done:false});q.stageIndex=q.stages.length-1;persist();renderActive('誓い直した。新たな障害を越えなければならない。')};$('forsakeBtn').onclick=()=>{q.status='forsaken';q.completedAt=new Date().toISOString();log(`Forsake Your Vow：「${q.title}」`,'questForsaken');persist();location.reload()}}
function finishQuest(q,xp,note){q.status='completed';q.completedAt=new Date().toISOString();addTrack('xp',xp);c.questBoard=c.questBoard||{};c.questBoard.completedNotice={title:q.title,rank:q.rank,at:q.completedAt};log(`${note} XP +${xp}`,'questCompleted');persist();setQuest('クエスト完了',`<div class="move-result strong"><b>${esc(note)}</b><p>XP +${xp}</p></div>`,'FULFILL YOUR VOW','次のクエストへ進めます。');setActionArea('<button id="nextQuestBtn" class="quest-play-btn primary">次のクエストを作る</button>');$('nextQuestBtn').onclick=()=>{c.questBoard.completedNotice=null;persist();location.reload()}}
function boot(){save=read();if(!save?.character)return;c=save.character;c.tracks=c.tracks||{};c.quests=Array.isArray(c.quests)?c.quests:[];if(active())renderActive();else offerView();const accept=$('questAcceptBtn');if(accept)accept.addEventListener('click',()=>setTimeout(boot,0));}
setTimeout(boot,0);
})();
