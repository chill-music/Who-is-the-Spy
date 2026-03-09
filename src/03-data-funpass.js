const FUN_PASS_SEASON_ID = '1';           // 🔧 غيّر هنا لتجديد السيزون
const FUN_PASS_SEASON_NAME_EN = 'Season 1'; // اسم السيزون بالإنجليزي
const FUN_PASS_SEASON_NAME_AR = 'الموسم الأول'; // اسم السيزون بالعربي
const FUN_PASS_SEASON_START = '2025-01-01'; // تاريخ بداية السيزون
const FUN_PASS_SEASON_END   = '2025-03-31'; // تاريخ نهاية السيزون

const FUN_PASS_PRICE = 2000; // Cost in Intel to buy Fun Pass

const FUN_PASS_LEVELS = [
  // level, xpRequired, free reward, premium reward
  // free: {type, icon, name_en, name_ar, amount?, itemId?, rarity?}
  // premium: {type, icon, name_en, name_ar, amount?, itemId?, rarity?}
  { level:1,  xp:0,    free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'200 Intel',name_ar:'200 إنتل',amount:200},                           premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'500 Intel',name_ar:'500 إنتل',amount:500} },
  { level:2,  xp:100,  free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'250 Intel',name_ar:'250 إنتل',amount:250},                           premium:{type:'badge',icon:'🔰',imageUrl:'',name_en:'Rookie Badge',name_ar:'شارة مبتدئ',itemId:'fp_badge_rookie',rarity:'Common', durationDays:null, season:null} },
  { level:3,  xp:250,  free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'300 Intel',name_ar:'300 إنتل',amount:300},                           premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'700 Intel',name_ar:'700 إنتل',amount:700} },
  { level:4,  xp:450,  free:{type:'badge',icon:'⚡',imageUrl:'',name_en:'Speed Badge',name_ar:'شارة السرعة',itemId:'fp_badge_speed',rarity:'Common', durationDays:null, season:null}, premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'900 Intel',name_ar:'900 إنتل',amount:900} },
  { level:5,  xp:700,  free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'400 Intel',name_ar:'400 إنتل',amount:400},                           premium:{type:'frame',icon:'🖼️',imageUrl:'',name_en:'Neon Frame',name_ar:'إطار نيون',itemId:'fp_frame_neon',rarity:'Rare', durationDays:null, season:null} },
  { level:6,  xp:1000, free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'450 Intel',name_ar:'450 إنتل',amount:450},                           premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1000 Intel',name_ar:'1000 إنتل',amount:1000} },
  { level:7,  xp:1400, free:{type:'title',icon:'🕵️',imageUrl:'',name_en:'Agent Title',name_ar:'لقب عميل',itemId:'fp_title_agent',rarity:'Rare', durationDays:null, season:null},  premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1100 Intel',name_ar:'1100 إنتل',amount:1100} },
  { level:8,  xp:1850, free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'500 Intel',name_ar:'500 إنتل',amount:500},                           premium:{type:'badge',icon:'💎',imageUrl:'',name_en:'Diamond Badge',name_ar:'شارة ألماس',itemId:'fp_badge_diamond',rarity:'Epic', durationDays:null, season:null} },
  { level:9,  xp:2350, free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'550 Intel',name_ar:'550 إنتل',amount:550},                           premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1200 Intel',name_ar:'1200 إنتل',amount:1200} },
  { level:10, xp:2900, free:{type:'frame',icon:'🌟',imageUrl:'',name_en:'Star Frame',name_ar:'إطار نجمة',itemId:'fp_frame_star',rarity:'Epic', durationDays:null, season:null},    premium:{type:'title',icon:'🌟',imageUrl:'',name_en:'Star Title',name_ar:'لقب نجمة',itemId:'fp_title_star',rarity:'Epic', durationDays:null, season:null} },
  { level:11, xp:3500, free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'600 Intel',name_ar:'600 إنتل',amount:600},                           premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1300 Intel',name_ar:'1300 إنتل',amount:1300} },
  { level:12, xp:4200, free:{type:'badge',icon:'🔥',imageUrl:'',name_en:'Fire Badge',name_ar:'شارة النار',itemId:'fp_badge_fire',rarity:'Epic', durationDays:null, season:null},   premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1400 Intel',name_ar:'1400 إنتل',amount:1400} },
  { level:13, xp:5000, free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'700 Intel',name_ar:'700 إنتل',amount:700},                           premium:{type:'frame',icon:'💠',imageUrl:'',name_en:'Crystal Frame',name_ar:'إطار كريستال',itemId:'fp_frame_crystal',rarity:'Epic', durationDays:null, season:null} },
  { level:14, xp:5900, free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'750 Intel',name_ar:'750 إنتل',amount:750},                           premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1500 Intel',name_ar:'1500 إنتل',amount:1500} },
  { level:15, xp:6900, free:{type:'title',icon:'⚔️',imageUrl:'',name_en:'Warrior Title',name_ar:'لقب محارب',itemId:'fp_title_warrior',rarity:'Epic', durationDays:null, season:null}, premium:{type:'gift',icon:'🍀',imageUrl:'',name_en:'Lucky Clover Gift',name_ar:'هدية البرسيم المحظوظ',itemId:'gift_fp_lucky',amount:3,rarity:'Epic'} },
  { level:16, xp:8000, free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'800 Intel',name_ar:'800 إنتل',amount:800},                           premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1700 Intel',name_ar:'1700 إنتل',amount:1700} },
  { level:17, xp:9200, free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'850 Intel',name_ar:'850 إنتل',amount:850},                           premium:{type:'frame',icon:'🌀',imageUrl:'',name_en:'Vortex Frame',name_ar:'إطار دوامة',itemId:'fp_frame_vortex',rarity:'Epic', durationDays:null, season:null} },
  { level:18, xp:10500,free:{type:'badge',icon:'🎯',imageUrl:'',name_en:'Sniper Badge',name_ar:'شارة القناص',itemId:'fp_badge_sniper',rarity:'Epic', durationDays:null, season:null}, premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1800 Intel',name_ar:'1800 إنتل',amount:1800} },
  { level:19, xp:12000,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'900 Intel',name_ar:'900 إنتل',amount:900},                           premium:{type:'title',icon:'👁️',imageUrl:'',name_en:'Eye Title',name_ar:'لقب العين',itemId:'fp_title_eye',rarity:'Epic', durationDays:null, season:null} },
  { level:20, xp:13700,free:{type:'frame',icon:'👑',imageUrl:'',name_en:'Gold Frame',name_ar:'إطار ذهبي',itemId:'fp_frame_gold',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'2000 Intel',name_ar:'2000 إنتل',amount:2000} },
  { level:21, xp:15600,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'950 Intel',name_ar:'950 إنتل',amount:950},                           premium:{type:'badge',icon:'⭐',imageUrl:'',name_en:'Legend Badge',name_ar:'شارة أسطورية',itemId:'fp_badge_legend',rarity:'Legendary', durationDays:null, season:null} },
  { level:22, xp:17600,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1000 Intel',name_ar:'1000 إنتل',amount:1000},                        premium:{type:'frame',icon:'🌙',imageUrl:'',name_en:'Moon Frame',name_ar:'إطار القمر',itemId:'fp_frame_moon',rarity:'Legendary', durationDays:null, season:null} },
  { level:23, xp:19800,free:{type:'title',icon:'🌙',imageUrl:'',name_en:'Shadow Title',name_ar:'لقب الظل',itemId:'fp_title_shadow',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'2200 Intel',name_ar:'2200 إنتل',amount:2200} },
  { level:24, xp:22200,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1100 Intel',name_ar:'1100 إنتل',amount:1100},                        premium:{type:'badge',icon:'🌌',imageUrl:'',name_en:'Galaxy Badge',name_ar:'شارة المجرة',itemId:'fp_badge_galaxy',rarity:'Legendary', durationDays:null, season:null} },
  { level:25, xp:24800,free:{type:'badge',icon:'🏅',imageUrl:'',name_en:'Gold Badge',name_ar:'شارة ذهبية',itemId:'fp_badge_gold',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'title',icon:'🏅',imageUrl:'',name_en:'Gold Title',name_ar:'لقب ذهبي',itemId:'fp_title_gold',rarity:'Legendary', durationDays:null, season:null} },
  { level:26, xp:27600,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1200 Intel',name_ar:'1200 إنتل',amount:1200},                        premium:{type:'frame',icon:'🔥',imageUrl:'',name_en:'Inferno Frame',name_ar:'إطار جهنم',itemId:'fp_frame_inferno',rarity:'Legendary', durationDays:null, season:null} },
  { level:27, xp:30600,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1300 Intel',name_ar:'1300 إنتل',amount:1300},                        premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'2500 Intel',name_ar:'2500 إنتل',amount:2500} },
  { level:28, xp:33800,free:{type:'frame',icon:'⚡',imageUrl:'',name_en:'Thunder Frame',name_ar:'إطار الرعد',itemId:'fp_frame_thunder',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'badge',icon:'⚡',imageUrl:'',name_en:'Thunder Badge',name_ar:'شارة الرعد',itemId:'fp_badge_thunder',rarity:'Legendary', durationDays:null, season:null} },
  { level:29, xp:37200,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1400 Intel',name_ar:'1400 إنتل',amount:1400},                        premium:{type:'title',icon:'🌊',imageUrl:'',name_en:'Ocean Title',name_ar:'لقب المحيط',itemId:'fp_title_ocean',rarity:'Legendary', durationDays:null, season:null} },
  { level:30, xp:40800,free:{type:'title',icon:'👑',imageUrl:'',name_en:'King Title',name_ar:'لقب الملك',itemId:'fp_title_king',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'frame',icon:'💀',imageUrl:'',name_en:'Skull Frame',name_ar:'إطار الجمجمة',itemId:'fp_frame_skull',rarity:'Legendary', durationDays:null, season:null} },
  { level:31, xp:44600,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1500 Intel',name_ar:'1500 إنتل',amount:1500},                        premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'2800 Intel',name_ar:'2800 إنتل',amount:2800} },
  { level:32, xp:48600,free:{type:'badge',icon:'🔮',imageUrl:'',name_en:'Mystic Badge',name_ar:'شارة غامضة',itemId:'fp_badge_mystic',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'frame',icon:'🔮',imageUrl:'',name_en:'Mystic Frame',name_ar:'إطار غامض',itemId:'fp_frame_mystic',rarity:'Legendary', durationDays:null, season:null} },
  { level:33, xp:52900,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1600 Intel',name_ar:'1600 إنتل',amount:1600},                        premium:{type:'title',icon:'🔥',imageUrl:'',name_en:'Flame Title',name_ar:'لقب اللهب',itemId:'fp_title_flame',rarity:'Legendary', durationDays:null, season:null} },
  { level:34, xp:57400,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1700 Intel',name_ar:'1700 إنتل',amount:1700},                        premium:{type:'badge',icon:'💥',imageUrl:'',name_en:'Blast Badge',name_ar:'شارة الانفجار',itemId:'fp_badge_blast',rarity:'Legendary', durationDays:null, season:null} },
  { level:35, xp:62200,free:{type:'frame',icon:'🌈',imageUrl:'',name_en:'Rainbow Frame',name_ar:'إطار قوس قزح',itemId:'fp_frame_rainbow',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'title',icon:'🌈',imageUrl:'',name_en:'Rainbow Title',name_ar:'لقب قوس قزح',itemId:'fp_title_rainbow',rarity:'Legendary', durationDays:null, season:null} },
  { level:36, xp:67200,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'1800 Intel',name_ar:'1800 إنتل',amount:1800},                        premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'3000 Intel',name_ar:'3000 إنتل',amount:3000} },
  { level:37, xp:72500,free:{type:'badge',icon:'🌑',imageUrl:'',name_en:'Dark Badge',name_ar:'شارة الظلام',itemId:'fp_badge_dark',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'frame',icon:'🌑',imageUrl:'',name_en:'Dark Frame',name_ar:'إطار الظلام',itemId:'fp_frame_dark',rarity:'Legendary', durationDays:null, season:null} },
  { level:38, xp:78100,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'2000 Intel',name_ar:'2000 إنتل',amount:2000},                        premium:{type:'title',icon:'👁️',imageUrl:'',name_en:'Watcher Title',name_ar:'لقب الراصد',itemId:'fp_title_watcher',rarity:'Legendary', durationDays:null, season:null} },
  { level:39, xp:84000,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'2100 Intel',name_ar:'2100 إنتل',amount:2100},                        premium:{type:'badge',icon:'🏹',imageUrl:'',name_en:'Arrow Badge',name_ar:'شارة السهم',itemId:'fp_badge_arrow',rarity:'Legendary', durationDays:null, season:null} },
  { level:40, xp:90200,free:{type:'title',icon:'🔮',imageUrl:'',name_en:'Mystic Title',name_ar:'لقب الغموض',itemId:'fp_title_mystic',rarity:'Mythic', durationDays:null, season:null}, premium:{type:'frame',icon:'🔮',imageUrl:'',name_en:'Mythic Frame',name_ar:'إطار خرافي',itemId:'fp_frame_mythic',rarity:'Mythic', durationDays:null, season:null} },
  { level:41, xp:96800,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'2200 Intel',name_ar:'2200 إنتل',amount:2200},                        premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'3500 Intel',name_ar:'3500 إنتل',amount:3500} },
  { level:42, xp:103700,free:{type:'badge',icon:'💠',imageUrl:'',name_en:'Prism Badge',name_ar:'شارة المنشور',itemId:'fp_badge_prism',rarity:'Mythic', durationDays:null, season:null}, premium:{type:'frame',icon:'💠',imageUrl:'',name_en:'Prism Frame',name_ar:'إطار المنشور',itemId:'fp_frame_prism',rarity:'Mythic', durationDays:null, season:null} },
  { level:43, xp:110900,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'2400 Intel',name_ar:'2400 إنتل',amount:2400},                       premium:{type:'title',icon:'💠',imageUrl:'',name_en:'Prism Title',name_ar:'لقب المنشور',itemId:'fp_title_prism',rarity:'Mythic', durationDays:null, season:null} },
  { level:44, xp:118500,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'2600 Intel',name_ar:'2600 إنتل',amount:2600},                       premium:{type:'badge',icon:'🌀',imageUrl:'',name_en:'Void Badge',name_ar:'شارة الفراغ',itemId:'fp_badge_void',rarity:'Mythic', durationDays:null, season:null} },
  { level:45, xp:126500,free:{type:'frame',icon:'🌀',imageUrl:'',name_en:'Void Frame',name_ar:'إطار الفراغ',itemId:'fp_frame_void',rarity:'Mythic', durationDays:null, season:null}, premium:{type:'title',icon:'🌀',imageUrl:'',name_en:'Void Title',name_ar:'لقب الفراغ',itemId:'fp_title_void',rarity:'Mythic', durationDays:null, season:null} },
  { level:46, xp:134900,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'2800 Intel',name_ar:'2800 إنتل',amount:2800},                       premium:{type:'currency',icon:'🧠',imageUrl:'',name_en:'4000 Intel',name_ar:'4000 إنتل',amount:4000} },
  { level:47, xp:143700,free:{type:'badge',icon:'🔥',imageUrl:'',name_en:'Phoenix Badge',name_ar:'شارة الفينيكس',itemId:'fp_badge_phoenix',rarity:'Mythic', durationDays:null, season:null}, premium:{type:'frame',icon:'🔥',imageUrl:'',name_en:'Phoenix Frame',name_ar:'إطار الفينيكس',itemId:'fp_frame_phoenix',rarity:'Mythic', durationDays:null, season:null} },
  { level:48, xp:152900,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'3000 Intel',name_ar:'3000 إنتل',amount:3000},                       premium:{type:'title',icon:'🔥',imageUrl:'',name_en:'Phoenix Title',name_ar:'لقب الفينيكس',itemId:'fp_title_phoenix',rarity:'Mythic', durationDays:null, season:null} },
  { level:49, xp:162600,free:{type:'currency',icon:'🧠',imageUrl:'',name_en:'3200 Intel',name_ar:'3200 إنتل',amount:3200},                       premium:{type:'badge',icon:'🌟',imageUrl:'',name_en:'Nova Badge',name_ar:'شارة النجم المتفجر',itemId:'fp_badge_nova',rarity:'Mythic', durationDays:null, season:null} },
  { level:50, xp:172700,free:{type:'frame',icon:'🌟',imageUrl:'',name_en:'Nova Frame',name_ar:'إطار النجم المتفجر',itemId:'fp_frame_nova',rarity:'Mythic', durationDays:null, season:null}, premium:{type:'title',icon:'🔱',imageUrl:'',name_en:'GOD Title',name_ar:'لقب الإله',itemId:'fp_title_god',rarity:'Mythic', durationDays:null, season:null} },
];

const FUN_PASS_DAILY_MISSIONS = [
  { id:'d1', icon:'🎮', imageUrl:'',name_en:'Play 1 game',       name_ar:'العب لعبة واحدة',    xp:30  },
  { id:'d2', icon:'🏆', imageUrl:'',name_en:'Win 1 game',        name_ar:'اربح لعبة واحدة',    xp:60  },
  { id:'d3', icon:'🕵️', imageUrl:'',name_en:'Play as Spy',      name_ar:'العب كجاسوس',        xp:50  },
  { id:'d4', icon:'💬', imageUrl:'',name_en:'Send a gift',       name_ar:'أرسل هدية',          xp:40  },
  { id:'d5', icon:'👥', imageUrl:'',name_en:'Add a friend',      name_ar:'أضف صديق',           xp:35  },
  { id:'d6', icon:'📸', imageUrl:'',name_en:'Post a moment',     name_ar:'انشر لحظة',          xp:45  },
  { id:'d7', icon:'🗨️', imageUrl:'',name_en:'Comment on moment',name_ar:'علق على لحظة',       xp:25  },
];

const FUN_PASS_WEEKLY_MISSIONS = [
  { id:'w1', icon:'🎮', imageUrl:'',name_en:'Play 10 games',     name_ar:'العب 10 ألعاب',      xp:200 },
  { id:'w2', icon:'🏆', imageUrl:'',name_en:'Win 5 games',       name_ar:'اربح 5 ألعاب',       xp:300 },
  { id:'w3', icon:'🎁', imageUrl:'',name_en:'Send 5 gifts',      name_ar:'أرسل 5 هدايا',       xp:250 },
  { id:'w4', icon:'📸', imageUrl:'',name_en:'Post 3 moments',    name_ar:'انشر 3 لحظات',       xp:220 },
  { id:'w5', icon:'👥', imageUrl:'',name_en:'Chat with 3 friends',name_ar:'كلم 3 أصدقاء',     xp:180 },
];

const LOGIN_REWARDS = [
    { day: 1, type: 'currency', amount: 100, icon: '🧠', iconUrl: '', name_en: '100 Intel', name_ar: '100 إنتل' },
    { day: 2, type: 'currency', amount: 150, icon: '🧠', iconUrl: '', name_en: '150 Intel', name_ar: '150 إنتل' },
    { day: 3, type: 'currency', amount: 200, icon: '🧠', iconUrl: '', name_en: '200 Intel', name_ar: '200 إنتل' },
    { day: 4, type: 'currency', amount: 250, icon: '🧠', iconUrl: '', name_en: '250 Intel', name_ar: '250 إنتل' },
    { day: 5, type: 'currency', amount: 300, icon: '🧠', iconUrl: '', name_en: '300 Intel', name_ar: '300 إنتل' },
    { day: 6, type: 'currency', amount: 400, icon: '🧠', iconUrl: '', name_en: '400 Intel', name_ar: '400 إنتل' },
    { day: 7, type: 'badge', itemId: 'badge_vip', icon: '⭐', iconUrl: '', name_en: 'VIP Badge', name_ar: 'شارة VIP', special: true, durationDays: null, season: null },
    { day: 8, type: 'currency', amount: 350, icon: '🧠', iconUrl: '', name_en: '350 Intel', name_ar: '350 إنتل' },
    { day: 9, type: 'currency', amount: 400, icon: '🧠', iconUrl: '', name_en: '400 Intel', name_ar: '400 إنتل' },
    { day: 10, type: 'currency', amount: 450, icon: '🧠', iconUrl: '', name_en: '450 Intel', name_ar: '450 إنتل' },
    { day: 11, type: 'currency', amount: 500, icon: '🧠', iconUrl: '', name_en: '500 Intel', name_ar: '500 إنتل' },
    { day: 12, type: 'currency', amount: 550, icon: '🧠', iconUrl: '', name_en: '550 Intel', name_ar: '550 إنتل' },
    { day: 13, type: 'currency', amount: 600, icon: '🧠', iconUrl: '', name_en: '600 Intel', name_ar: '600 إنتل' },
    { day: 14, type: 'frame', itemId: 'frame_neon', icon: '🖼️', iconUrl: '', name_en: 'Neon Frame', name_ar: 'إطار نيون', special: true, durationDays: null, season: null },
    { day: 15, type: 'currency', amount: 700, icon: '🧠', iconUrl: '', name_en: '700 Intel', name_ar: '700 إنتل' },
    { day: 16, type: 'currency', amount: 750, icon: '🧠', iconUrl: '', name_en: '750 Intel', name_ar: '750 إنتل' },
    { day: 17, type: 'currency', amount: 800, icon: '🧠', iconUrl: '', name_en: '800 Intel', name_ar: '800 إنتل' },
    { day: 18, type: 'currency', amount: 850, icon: '🧠', iconUrl: '', name_en: '850 Intel', name_ar: '850 إنتل' },
    { day: 19, type: 'currency', amount: 900, icon: '🧠', iconUrl: '', name_en: '900 Intel', name_ar: '900 إنتل' },
    { day: 20, type: 'currency', amount: 950, icon: '🧠', iconUrl: '', name_en: '950 Intel', name_ar: '950 إنتل' },
    { day: 21, type: 'title', itemId: 'title_spy', icon: '🕵️', iconUrl: '', name_en: 'Mr. Spy Title', name_ar: 'لقب سيد جاسوس', special: true, durationDays: null, season: null },
    { day: 22, type: 'currency', amount: 1000, icon: '🧠', iconUrl: '', name_en: '1000 Intel', name_ar: '1000 إنتل' },
    { day: 23, type: 'currency', amount: 1100, icon: '🧠', iconUrl: '', name_en: '1100 Intel', name_ar: '1100 إنتل' },
    { day: 24, type: 'currency', amount: 1200, icon: '🧠', iconUrl: '', name_en: '1200 Intel', name_ar: '1200 إنتل' },
    { day: 25, type: 'currency', amount: 1300, icon: '🧠', iconUrl: '', name_en: '1300 Intel', name_ar: '1300 إنتل' },
    { day: 26, type: 'currency', amount: 1400, icon: '🧠', iconUrl: '', name_en: '1400 Intel', name_ar: '1400 إنتل' },
    { day: 27, type: 'currency', amount: 1500, icon: '🧠', iconUrl: '', name_en: '1500 Intel', name_ar: '1500 إنتل' },
    { day: 28, type: 'badge', itemId: 'badge_pro', icon: '🏆', iconUrl: '', name_en: 'Pro Badge', name_ar: 'شارة محترف', special: true, durationDays: null, season: null },
    { day: 29, type: 'currency', amount: 2500, icon: '🧠', iconUrl: '', name_en: '2500 Intel', name_ar: '2500 إنتل' },
    { day: 30, type: 'frame', itemId: 'frame_gold', icon: '👑', iconUrl: '', name_en: 'Gold Frame', name_ar: 'إطار ذهبي', special: true, final: true, durationDays: null, season: null },
];

const LOGIN_REWARDS_CONFIG = {
    currentCycleStart: '2025-01',
    autoResetMonthly: true,
};

const checkLoginRewardsCycle = (userData) => {
    const config = LOGIN_REWARDS_CONFIG;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (config.autoResetMonthly) {
        const cycleStartMonth = config.currentCycleStart;
        if (currentMonth !== cycleStartMonth) {
            LOGIN_REWARDS_CONFIG.currentCycleStart = currentMonth;
            return true;
        }
    }
    const lastClaimDate = userData?.loginRewards?.lastClaimDate?.toDate?.() || new Date(userData?.loginRewards?.lastClaimDate || 0);
    const lastClaimMonth = `${lastClaimDate.getFullYear()}-${String(lastClaimDate.getMonth() + 1).padStart(2, '0')}`;
    if (currentMonth !== lastClaimMonth && config.autoResetMonthly) return true;
    return false;
};

const getCurrentCycleMonth = () => LOGIN_REWARDS_CONFIG.currentCycleStart;

// 📦 DAILY TASKS CONFIG - 8 Boxes (by online time)
