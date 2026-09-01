(()=>{'use strict';
const specs=[
  {key:'health',select:'healthSelect',legacy:'healthValue'},
  {key:'spirit',select:'spiritSelect',legacy:'spiritValue'},
  {key:'supply',select:'supplySelect',legacy:'supplyValue'}
];
for(const spec of specs){
  const select=document.getElementById(spec.select);
  const legacy=document.getElementById(spec.legacy);
  if(!select||!legacy)continue;
  const resource=select.closest('.resource');
  const minus=resource?.querySelector(`button[data-track="${spec.key}"][data-d="-1"]`);
  const plus=resource?.querySelector(`button[data-track="${spec.key}"][data-d="1"]`);
  const sync=()=>{
    const current=Number(String(legacy.textContent||'5').split('/')[0]);
    if(Number.isFinite(current))select.value=String(Math.max(0,Math.min(5,current)));
  };
  sync();
  select.addEventListener('change',()=>{
    const current=Number(String(legacy.textContent||'5').split('/')[0]);
    const next=Number(select.value);
    if(!Number.isFinite(current)||!Number.isFinite(next))return;
    const button=next>current?plus:minus;
    for(let i=0;i<Math.abs(next-current);i++)button?.click();
    sync();
  });
  new MutationObserver(sync).observe(legacy,{childList:true,subtree:true,characterData:true});
}
})();
