(()=>{
  'use strict';

  const numbered=list=>list.map((result,index)=>({roll:index+1,result}));
  const expand=ranges=>{
    const out=[];
    ranges.forEach(([from,to,result])=>{for(let n=from;n<=to;n++)out.push({roll:n,result})});
    return out;
  };
  const bi=(en,ja)=>`${en}（${ja}）`;

  window.IRONSWORN_ACTION_ORACLE_JA=numbered([
    bi('Scheme','策を巡らす'),bi('Clash','衝突する'),bi('Weaken','弱める'),bi('Initiate','開始する'),bi('Create','作り出す'),bi('Swear','誓う'),bi('Avenge','仇を討つ'),bi('Guard','守る'),bi('Defeat','打ち負かす'),bi('Control','支配する'),
    bi('Break','壊す'),bi('Risk','危険を冒す'),bi('Surrender','降伏する'),bi('Inspect','調べる'),bi('Raid','襲撃する'),bi('Evade','逃れる'),bi('Assault','強襲する'),bi('Deflect','そらす'),bi('Threaten','脅す'),bi('Attack','攻撃する'),
    bi('Leave','去る'),bi('Preserve','保つ'),bi('Manipulate','操る'),bi('Remove','取り除く'),bi('Eliminate','排除する'),bi('Withdraw','撤退する'),bi('Abandon','見捨てる'),bi('Investigate','調査する'),bi('Hold','保持する'),bi('Focus','集中する'),
    bi('Uncover','暴く'),bi('Breach','突破する'),bi('Aid','助ける'),bi('Uphold','守り通す'),bi('Falter','しくじる'),bi('Suppress','抑える'),bi('Hunt','狩る'),bi('Share','分かち合う'),bi('Destroy','破壊する'),bi('Avoid','避ける'),
    bi('Reject','拒絶する'),bi('Demand','要求する'),bi('Explore','探索する'),bi('Bolster','力づける'),bi('Seize','奪取する'),bi('Mourn','嘆く'),bi('Reveal','明らかにする'),bi('Gather','集める'),bi('Defy','逆らう'),bi('Transform','変貌させる'),
    bi('Persevere','耐え抜く'),bi('Serve','仕える'),bi('Begin','始める'),bi('Move','動く'),bi('Coordinate','協調する'),bi('Resist','抵抗する'),bi('Await','待つ'),bi('Impress','感銘を与える'),bi('Take','取る'),bi('Oppose','対抗する'),
    bi('Capture','捕らえる'),bi('Overwhelm','圧倒する'),bi('Challenge','挑む'),bi('Acquire','手に入れる'),bi('Protect','守る'),bi('Finish','終わらせる'),bi('Strengthen','強化する'),bi('Restore','回復させる'),bi('Advance','前進する'),bi('Command','命令する'),
    bi('Refuse','拒む'),bi('Find','見つける'),bi('Deliver','届ける'),bi('Hide','隠す'),bi('Fortify','防備を固める'),bi('Betray','裏切る'),bi('Secure','確保する'),bi('Arrive','到着する'),bi('Affect','影響を与える'),bi('Change','変える'),
    bi('Defend','防御する'),bi('Debate','議論する'),bi('Support','支援する'),bi('Follow','追う／従う'),bi('Construct','建てる'),bi('Locate','場所を突き止める'),bi('Endure','耐える'),bi('Release','解放する'),bi('Lose','失う'),bi('Reduce','減らす'),
    bi('Escalate','激化させる'),bi('Distract','気をそらす'),bi('Journey','旅する'),bi('Escort','護送する'),bi('Learn','学ぶ'),bi('Communicate','伝える'),bi('Depart','出発する'),bi('Search','捜す'),bi('Charge','突撃する'),bi('Summon','呼び出す')
  ]);

  window.IRONSWORN_REGION_ORACLE_JA=expand([
    [1,12,bi('Barrier Islands','バリア諸島')],
    [13,24,bi('Ragged Coast','荒々しい海岸')],
    [25,34,bi('Deep Wilds','深き荒野')],
    [35,46,bi('Flooded Lands','水没地')],
    [47,60,bi('Havens','安住の地')],
    [61,72,bi('Hinterlands','内陸辺境')],
    [73,84,bi('Tempest Hills','嵐の丘陵')],
    [85,94,bi('Veiled Mountains','霧に覆われた山脈')],
    [95,99,bi('Shattered Wastes','砕けた荒地')],
    [100,100,bi('Elsewhere','その他の地域')]
  ]);

  window.IRONSWORN_LOCATION_DESCRIPTOR_ORACLE_JA=expand([
    [1,2,bi('High','高い')],[3,4,bi('Remote','人里離れた')],[5,6,bi('Exposed','むき出しの')],[7,8,bi('Small','小さい')],[9,10,bi('Broken','壊れた')],
    [11,12,bi('Diverse','多様な')],[13,14,bi('Rough','荒々しい')],[15,16,bi('Dark','暗い')],[17,18,bi('Shadowy','薄暗い')],[19,20,bi('Contested','争われている')],
    [21,22,bi('Grim','陰惨な')],[23,24,bi('Wild','野生の')],[25,26,bi('Fertile','肥沃な')],[27,28,bi('Blocked','塞がれた')],[29,30,bi('Ancient','古代の')],
    [31,32,bi('Perilous','危険な')],[33,34,bi('Hidden','隠された')],[35,36,bi('Occupied','占拠された')],[37,38,bi('Rich','豊かな')],[39,40,bi('Big','大きい')],
    [41,42,bi('Savage','荒々しい')],[43,44,bi('Defended','防御された')],[45,46,bi('Withered','枯れた')],[47,48,bi('Mystical','神秘的な')],[49,50,bi('Inaccessible','到達困難な')],
    [51,52,bi('Protected','保護された')],[53,54,bi('Abandoned','放棄された')],[55,56,bi('Wide','広い')],[57,58,bi('Foul','汚れた')],[59,60,bi('Dead','死んだ')],
    [61,62,bi('Ruined','荒廃した')],[63,64,bi('Barren','不毛な')],[65,66,bi('Cold','寒い')],[67,68,bi('Blighted','枯れ果てた')],[69,70,bi('Low','低い')],
    [71,72,bi('Beautiful','美しい')],[73,74,bi('Abundant','豊富な')],[75,76,bi('Lush','青々とした')],[77,78,bi('Flooded','水没した')],[79,80,bi('Empty','空っぽの')],
    [81,82,bi('Strange','奇妙な')],[83,84,bi('Corrupted','腐敗した')],[85,86,bi('Peaceful','平穏な')],[87,88,bi('Forgotten','忘れられた')],[89,90,bi('Expansive','広大な')],
    [91,92,bi('Settled','入植された')],[93,94,bi('Dense','密集した')],[95,96,bi('Civilized','文明化された')],[97,98,bi('Desolate','荒涼とした')],[99,100,bi('Isolated','孤立した')]
  ]);

  window.IRONSWORN_SETTLEMENT_ORIGIN_ORACLE_JA=expand([
    [1,15,bi('Landscape feature','地形・自然の特徴')],
    [16,30,bi('Manmade edifice','人工建造物')],
    [31,45,bi('Creature','生き物')],
    [46,60,bi('Historical event','歴史的事件')],
    [61,75,bi('Old World language','旧世界の言葉')],
    [76,90,bi('Season or environmental aspect','季節・環境')],
    [91,100,bi('Other','その他')]
  ]);

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
