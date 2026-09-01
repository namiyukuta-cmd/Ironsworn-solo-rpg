(()=>{'use strict';
const title=document.getElementById('questTitle');
const button=document.getElementById('generateQuestBtn');
if(!title||!button)return;
if(title.textContent.trim()==='クエストはまだありません')button.click();
})();
