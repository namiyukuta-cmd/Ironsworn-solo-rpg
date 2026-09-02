(()=>{
  'use strict';
  const bi=(en,ja)=>`${en}（${ja}）`;
  const themes=[
    bi('Risk','危険'),bi('Ability','能力'),bi('Price','代償'),bi('Ally','味方'),bi('Battle','戦い'),bi('Safety','安全'),bi('Survival','生存'),bi('Weapon','武器'),bi('Wound','傷'),bi('Shelter','避難所'),
    bi('Leader','指導者'),bi('Fear','恐怖'),bi('Time','時間'),bi('Duty','義務'),bi('Secret','秘密'),bi('Innocence','無実／純真'),bi('Renown','名声'),bi('Direction','方向'),bi('Death','死'),bi('Honor','名誉'),
    bi('Labor','労働'),bi('Solution','解決策'),bi('Tool','道具'),bi('Balance','均衡'),bi('Love','愛'),bi('Barrier','障壁'),bi('Creation','創造'),bi('Decay','衰退'),bi('Trade','交易'),bi('Bond','絆'),
    bi('Hope','希望'),bi('Superstition','迷信'),bi('Peace','平和'),bi('Deception','欺瞞'),bi('History','歴史'),bi('World','世界'),bi('Vow','誓い'),bi('Protection','保護'),bi('Nature','自然'),bi('Opinion','意見'),
    bi('Burden','重荷'),bi('Vengeance','報復'),bi('Opportunity','機会'),bi('Faction','勢力'),bi('Danger','危険'),bi('Corruption','腐敗'),bi('Freedom','自由'),bi('Debt','借り／負債'),bi('Hate','憎しみ'),bi('Possession','所有物'),
    bi('Stranger','よそ者'),bi('Passage','通路'),bi('Land','土地'),bi('Creature','生き物'),bi('Disease','病'),bi('Advantage','優位'),bi('Blood','血'),bi('Language','言語'),bi('Rumor','噂'),bi('Weakness','弱点'),
    bi('Greed','強欲'),bi('Family','家族'),bi('Resource','資源'),bi('Structure','建造物'),bi('Dream','夢'),bi('Community','共同体'),bi('War','戦争'),bi('Portent','前兆'),bi('Prize','賞／獲物'),bi('Destiny','運命'),
    bi('Momentum','モメンタム'),bi('Power','力'),bi('Memory','記憶'),bi('Ruin','破滅'),bi('Mysticism','神秘'),bi('Rival','ライバル'),bi('Problem','問題'),bi('Idea','考え'),bi('Revenge','復讐'),bi('Health','健康'),
    bi('Fellowship','仲間／友情'),bi('Enemy','敵'),bi('Religion','宗教'),bi('Spirit','精神'),bi('Fame','評判'),bi('Desolation','荒廃'),bi('Strength','強さ'),bi('Knowledge','知識'),bi('Truth','真実'),bi('Quest','クエスト'),
    bi('Pride','誇り'),bi('Loss','喪失'),bi('Law','法'),bi('Path','道'),bi('Warning','警告'),bi('Relationship','関係'),bi('Wealth','富'),bi('Home','家／故郷'),bi('Strategy','策略'),bi('Supply','物資')
  ];
  window.IRONSWORN_THEME_ORACLE_JA=themes.map((result,index)=>({roll:index+1,result}));
})();
