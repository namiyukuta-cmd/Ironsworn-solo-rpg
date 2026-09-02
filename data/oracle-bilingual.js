(()=>{
  'use strict';
  const bi=(en,ja)=>`${en}（${ja}）`;
  const wrap=(table,english)=>{
    if(!Array.isArray(table))return;
    table.forEach((item,i)=>{
      if(!item)return;
      const ja=String(item.result??item.location??'');
      const en=english[i];
      if(en){
        const value=bi(en,ja);
        if('location' in item)item.location=value;else item.result=value;
      }
    });
  };

  const actions=[
    'Scheme','Clash','Weaken','Initiate','Create','Swear','Avenge','Guard','Defeat','Control',
    'Break','Risk','Surrender','Inspect','Raid','Evade','Assault','Deflect','Threaten','Attack',
    'Leave','Preserve','Manipulate','Remove','Eliminate','Withdraw','Abandon','Investigate','Hold','Focus',
    'Uncover','Breach','Aid','Uphold','Falter','Suppress','Hunt','Share','Destroy','Avoid',
    'Reject','Demand','Explore','Bolster','Seize','Mourn','Reveal','Gather','Defy','Transform',
    'Persevere','Serve','Begin','Move','Coordinate','Resist','Await','Impress','Take','Oppose',
    'Capture','Overwhelm','Challenge','Acquire','Protect','Finish','Strengthen','Restore','Advance','Command',
    'Refuse','Find','Deliver','Hide','Fortify','Betray','Secure','Arrive','Affect','Change',
    'Defend','Debate','Support','Follow','Construct','Locate','Endure','Release','Lose','Reduce',
    'Escalate','Distract','Journey','Escort','Learn','Communicate','Depart','Search','Charge','Summon'
  ];

  const themes=[
    'Risk','Ability','Price','Ally','Battle','Safety','Survival','Weapon','Wound','Shelter',
    'Leader','Fear','Time','Duty','Secret','Innocence','Renown','Direction','Death','Honor',
    'Labor','Solution','Tool','Balance','Love','Barrier','Creation','Decay','Trade','Bond',
    'Hope','Superstition','Peace','Deception','History','World','Vow','Protection','Nature','Opinion',
    'Burden','Vengeance','Opportunity','Faction','Danger','Corruption','Freedom','Debt','Hate','Possession',
    'Stranger','Passage','Land','Creature','Disease','Advantage','Blood','Language','Rumor','Weakness',
    'Greed','Family','Resource','Structure','Dream','Community','War','Portent','Prize','Destiny',
    'Momentum','Power','Memory','Ruin','Mysticism','Rival','Problem','Idea','Revenge','Health',
    'Fellowship','Enemy','Religion','Spirit','Fame','Desolation','Strength','Knowledge','Truth','Quest',
    'Pride','Loss','Law','Path','Warning','Relationship','Wealth','Home','Strategy','Supply'
  ];

  const locations=[
    'Hideout','Ancient Ruin','Abandoned Mine','Wasteland','Mystical Sanctuary','Game Trail','Outpost','Crumbling Wall','Ancient Battlefield','Hovel',
    'Spring','Beast Lair','Mountain Fort','Stone Bridge','Camp','Graveyard','Caravan Camp','Waterfall','Cave','Swamp',
    'Fen','Ravine','Old Road','Ancient Tree','Pond','Fields','Marsh','Farmstead','Rapids','Mountain Pass',
    'Forest Glade','Grassland','Ridge','Cliff','Grove','Village','Moor','Thicket','River Ford','Valley',
    'Cove','Foothills','Lake','Riverside','Deep Forest','Coast','Hills','High Mountain','Open Woodland','Frozen Lake',
    'Glacier','Snowfield','Blizzard Pass','Conifer Forest','Deadwood Forest','Burned Ground','Collapsed Mine Tunnel','Abandoned Village','Watchtower','Stone Shrine',
    'Old Temple','Catacombs','Barrow','Forgotten Well','Rope Bridge','Ferry Crossing','Harbor','Fishing Village','Wharf','Wreck',
    'Islet','Reef','Sea Cave','Fjord','Estuary','Bay','Sea Cliff','Lighthouse','Charcoal Burner’s Hut','Logging Site',
    'Hunter’s Cabin','Shepherd’s Pasture','Smithy','Market','Longhouse','Manor House','Palisade Gate','Guard Post','Checkpoint','Trading Post',
    'Pilgrim Road','Old Standing Stone','Fallen Colossus','Giant Ruins','Elven Wood','Cursed Forest','Misty Valley','Underground Spring','Hidden Cave','Unknown Place'
  ];

  const descriptorNames=[
    'High','Remote','Exposed','Small','Broken','Diverse','Rough','Dark','Shadowy','Contested',
    'Grim','Wild','Fertile','Blocked','Ancient','Perilous','Hidden','Occupied','Rich','Big',
    'Savage','Defended','Withered','Mystical','Inaccessible','Protected','Abandoned','Wide','Foul','Dead',
    'Ruined','Barren','Cold','Blighted','Low','Beautiful','Abundant','Lush','Flooded','Empty',
    'Strange','Corrupted','Peaceful','Forgotten','Expansive','Settled','Dense','Civilized','Desolate','Isolated'
  ];

  wrap(window.IRONSWORN_ACTION_ORACLE_JA,actions);
  wrap(window.IRONSWORN_THEME_ORACLE_JA,themes);
  wrap(window.IRONSWORN_LOCATION_ORACLE_JA,locations);

  if(Array.isArray(window.IRONSWORN_REGION_ORACLE_JA)){
    window.IRONSWORN_REGION_ORACLE_JA.forEach(item=>{
      const r=Number(item.roll); let en='';
      if(r<=12)en='Barrier Islands';
      else if(r<=24)en='Ragged Coast';
      else if(r<=34)en='Deep Wilds';
      else if(r<=46)en='Flooded Lands';
      else if(r<=60)en='Havens';
      else if(r<=72)en='Hinterlands';
      else if(r<=84)en='Tempest Hills';
      else if(r<=94)en='Veiled Mountains';
      else if(r<=99)en='Shattered Wastes';
      else en='Elsewhere';
      let ja=String(item.result||'');
      if(en==='Veiled Mountains')ja='霧に覆われた山脈';
      item.result=bi(en,ja);
    });
  }

  if(Array.isArray(window.IRONSWORN_LOCATION_DESCRIPTOR_ORACLE_JA)){
    window.IRONSWORN_LOCATION_DESCRIPTOR_ORACLE_JA.forEach(item=>{
      const r=Number(item.roll)||1;
      const en=descriptorNames[Math.min(49,Math.floor((r-1)/2))];
      item.result=bi(en,String(item.result||''));
    });
  }

  if(Array.isArray(window.IRONSWORN_SETTLEMENT_ORIGIN_ORACLE_JA)){
    window.IRONSWORN_SETTLEMENT_ORIGIN_ORACLE_JA.forEach(item=>{
      const r=Number(item.roll); let en='';
      if(r<=15)en='Landscape feature';
      else if(r<=30)en='Manmade edifice';
      else if(r<=45)en='Creature';
      else if(r<=60)en='Historical event';
      else if(r<=75)en='Old World language';
      else if(r<=90)en='Season or environmental aspect';
      else en='Other';
      item.result=bi(en,String(item.result||''));
    });
  }

  const prefixPairs=[
    ['Bleak','ブリーク'],['Green','グリーン'],['Wolf','ウルフ'],['Raven','レイヴン'],['Gray','グレイ'],
    ['Red','レッド'],['Axe','アックス'],['Great','グレート'],['Wood','ウッド'],['Low','ロウ'],
    ['White','ホワイト'],['Storm','ストーム'],['Black','ブラック'],['Mourn','モーン'],['New','ニュー'],
    ['Stone','ストーン'],['Grim','グリム'],['Lost','ロスト'],['High','ハイ'],['Rock','ロック'],
    ['Shield','シールド'],['Sword','ソード'],['Frost','フロスト'],['Thorn','ソーン'],['Long','ロング']
  ];
  const suffixPairs=[
    ['moor','ムーア'],['ford','フォード'],['crag','クラッグ'],['watch','ウォッチ'],['hope','ホープ'],
    ['wood','ウッド'],['ridge','リッジ'],['stone','ストーン'],['haven','ヘイヴン'],['fall','フォール'],
    ['river','リバー'],['field','フィールド'],['hill','ヒル'],['bridge','ブリッジ'],['mark','マーク'],
    ['cairn','ケアン'],['land','ランド'],['hall','ホール'],['mount','マウント'],['rock','ロック'],
    ['brook','ブルック'],['barrow','バロウ'],['stead','ステッド'],['home','ホーム'],['wick','ウィック']
  ];
  const expand4=pairs=>pairs.flatMap(([en,ja])=>Array.from({length:4},()=>({en,ja})));
  window.IRONSWORN_SETTLEMENT_NAME_ORACLE_JA={prefixes:expand4(prefixPairs),suffixes:expand4(suffixPairs)};
})();
