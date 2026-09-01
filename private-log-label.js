(()=>{'use strict';
const btn=document.getElementById('rogBtn');
if(!btn)return;
btn.addEventListener('click',()=>{
  const kicker=document.getElementById('stageKicker');
  if(kicker)kicker.textContent='LOG';
});
})();
