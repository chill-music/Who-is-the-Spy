var UN_PASS_SEASON_ID = '2';             // ðŸ”§ ØºÙŠÙ‘Ø± Ù‡Ù†Ø§ Ù„ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø³ÙŠØ²ÙˆÙ†
var UN_PASS_SEASON_NAME_EN = 'Season 2'; // Ø§Ø³Ù… Ø§Ù„Ø³ÙŠØ²ÙˆÙ† Ø¨Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ
var UN_PASS_SEASON_NAME_AR = 'Ø§Ù„Ù…ÙˆØ³Ù… Ø§Ù„Ø«Ø§Ù†ÙŠ'; // Ø§Ø³Ù… Ø§Ù„Ø³ÙŠØ²ÙˆÙ† Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠ
var UN_PASS_SEASON_END   = '2026-06-30'; // ØªØ§Ø±ÙŠØ® Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ø³ÙŠØ²ÙˆÙ†

var UN_PASS_PRICE = 2000; // Cost in Intel to buy Fun Pass

var UN_PASS_LEVELS = [
  // level, xpRequired, free reward, premium reward
  // free: {type, icon, name_en, name_ar, amount?, itemId?, rarity?}
  // premium: {type, icon, name_en, name_ar, amount?, itemId?, rarity?}
  { level:1,  xp:0,    free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'200 Intel',name_ar:'200 Ø¥Ù†ØªÙ„',amount:200},                           premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'500 Intel',name_ar:'500 Ø¥Ù†ØªÙ„',amount:500} },
  { level:2,  xp:100,  free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'250 Intel',name_ar:'250 Ø¥Ù†ØªÙ„',amount:250},                           premium:{type:'badge',icon:'ðŸ”°',imageUrl:'',name_en:'Rookie Badge',name_ar:'Ø´Ø§Ø±Ø© Ù…Ø¨ØªØ¯Ø¦',itemId:'fp_badge_rookie',rarity:'Common', durationDays:null, season:null} },
  { level:3,  xp:250,  free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'300 Intel',name_ar:'300 Ø¥Ù†ØªÙ„',amount:300},                           premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'700 Intel',name_ar:'700 Ø¥Ù†ØªÙ„',amount:700} },
  { level:4,  xp:450,  free:{type:'badge',icon:'âš¡',imageUrl:'',name_en:'Speed Badge',name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ø³Ø±Ø¹Ø©',itemId:'fp_badge_speed',rarity:'Common', durationDays:null, season:null}, premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'900 Intel',name_ar:'900 Ø¥Ù†ØªÙ„',amount:900} },
  { level:5,  xp:700,  free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'400 Intel',name_ar:'400 Ø¥Ù†ØªÙ„',amount:400},                           premium:{type:'frame',icon:'ðŸ–¼ï¸',imageUrl:'',name_en:'Neon Frame',name_ar:'Ø¥Ø·Ø§Ø± Ù†ÙŠÙˆÙ†',itemId:'fp_frame_neon',rarity:'Rare', durationDays:null, season:null} },
  { level:6,  xp:1000, free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'450 Intel',name_ar:'450 Ø¥Ù†ØªÙ„',amount:450},                           premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1000 Intel',name_ar:'1000 Ø¥Ù†ØªÙ„',amount:1000} },
  { level:7,  xp:1400, free:{type:'title',icon:'ðŸ•µï¸',imageUrl:'',name_en:'Agent Title',name_ar:'Ù„Ù‚Ø¨ Ø¹Ù…ÙŠÙ„',itemId:'fp_title_agent',rarity:'Rare', durationDays:null, season:null},  premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1100 Intel',name_ar:'1100 Ø¥Ù†ØªÙ„',amount:1100} },
  { level:8,  xp:1850, free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'500 Intel',name_ar:'500 Ø¥Ù†ØªÙ„',amount:500},                           premium:{type:'badge',icon:'ðŸ’Ž',imageUrl:'',name_en:'Diamond Badge',name_ar:'Ø´Ø§Ø±Ø© Ø£Ù„Ù…Ø§Ø³',itemId:'fp_badge_diamond',rarity:'Epic', durationDays:null, season:null} },
  { level:9,  xp:2350, free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'550 Intel',name_ar:'550 Ø¥Ù†ØªÙ„',amount:550},                           premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1200 Intel',name_ar:'1200 Ø¥Ù†ØªÙ„',amount:1200} },
  { level:10, xp:2900, free:{type:'frame',icon:'ðŸŒŸ',imageUrl:'',name_en:'Star Frame',name_ar:'Ø¥Ø·Ø§Ø± Ù†Ø¬Ù…Ø©',itemId:'fp_frame_star',rarity:'Epic', durationDays:null, season:null},    premium:{type:'title',icon:'ðŸŒŸ',imageUrl:'',name_en:'Star Title',name_ar:'Ù„Ù‚Ø¨ Ù†Ø¬Ù…Ø©',itemId:'fp_title_star',rarity:'Epic', durationDays:null, season:null} },
  { level:11, xp:3500, free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'600 Intel',name_ar:'600 Ø¥Ù†ØªÙ„',amount:600},                           premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1300 Intel',name_ar:'1300 Ø¥Ù†ØªÙ„',amount:1300} },
  { level:12, xp:4200, free:{type:'badge',icon:'ðŸ”¥',imageUrl:'',name_en:'Fire Badge',name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ù†Ø§Ø±',itemId:'fp_badge_fire',rarity:'Epic', durationDays:null, season:null},   premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1400 Intel',name_ar:'1400 Ø¥Ù†ØªÙ„',amount:1400} },
  { level:13, xp:5000, free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'700 Intel',name_ar:'700 Ø¥Ù†ØªÙ„',amount:700},                           premium:{type:'frame',icon:'ðŸ’ ',imageUrl:'',name_en:'Crystal Frame',name_ar:'Ø¥Ø·Ø§Ø± ÙƒØ±ÙŠØ³ØªØ§Ù„',itemId:'fp_frame_crystal',rarity:'Epic', durationDays:null, season:null} },
  { level:14, xp:5900, free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'750 Intel',name_ar:'750 Ø¥Ù†ØªÙ„',amount:750},                           premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1500 Intel',name_ar:'1500 Ø¥Ù†ØªÙ„',amount:1500} },
  { level:15, xp:6900, free:{type:'title',icon:'âš”ï¸',imageUrl:'',name_en:'Warrior Title',name_ar:'Ù„Ù‚Ø¨ Ù…Ø­Ø§Ø±Ø¨',itemId:'fp_title_warrior',rarity:'Epic', durationDays:null, season:null}, premium:{type:'gift',icon:'ðŸ€',imageUrl:'',name_en:'Lucky Clover Gift',name_ar:'Ù‡Ø¯ÙŠØ© Ø§Ù„Ø¨Ø±Ø³ÙŠÙ… Ø§Ù„Ù…Ø­Ø¸ÙˆØ¸',itemId:'gift_fp_lucky',amount:3,rarity:'Epic'} },
  { level:16, xp:8000, free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'800 Intel',name_ar:'800 Ø¥Ù†ØªÙ„',amount:800},                           premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1700 Intel',name_ar:'1700 Ø¥Ù†ØªÙ„',amount:1700} },
  { level:17, xp:9200, free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'850 Intel',name_ar:'850 Ø¥Ù†ØªÙ„',amount:850},                           premium:{type:'frame',icon:'ðŸŒ€',imageUrl:'',name_en:'Vortex Frame',name_ar:'Ø¥Ø·Ø§Ø± Ø¯ÙˆØ§Ù…Ø©',itemId:'fp_frame_vortex',rarity:'Epic', durationDays:null, season:null} },
  { level:18, xp:10500,free:{type:'badge',icon:'ðŸŽ¯',imageUrl:'',name_en:'Sniper Badge',name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ù‚Ù†Ø§Øµ',itemId:'fp_badge_sniper',rarity:'Epic', durationDays:null, season:null}, premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1800 Intel',name_ar:'1800 Ø¥Ù†ØªÙ„',amount:1800} },
  { level:19, xp:12000,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'900 Intel',name_ar:'900 Ø¥Ù†ØªÙ„',amount:900},                           premium:{type:'title',icon:'ðŸ‘ï¸',imageUrl:'',name_en:'Eye Title',name_ar:'Ù„Ù‚Ø¨ Ø§Ù„Ø¹ÙŠÙ†',itemId:'fp_title_eye',rarity:'Epic', durationDays:null, season:null} },
  { level:20, xp:13700,free:{type:'frame',icon:'ðŸ‘‘',imageUrl:'',name_en:'Gold Frame',name_ar:'Ø¥Ø·Ø§Ø± Ø°Ù‡Ø¨ÙŠ',itemId:'fp_frame_gold',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'2000 Intel',name_ar:'2000 Ø¥Ù†ØªÙ„',amount:2000} },
  { level:21, xp:15600,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'950 Intel',name_ar:'950 Ø¥Ù†ØªÙ„',amount:950},                           premium:{type:'badge',icon:'â­',imageUrl:'',name_en:'Legend Badge',name_ar:'Ø´Ø§Ø±Ø© Ø£Ø³Ø·ÙˆØ±ÙŠØ©',itemId:'fp_badge_legend',rarity:'Legendary', durationDays:null, season:null} },
  { level:22, xp:17600,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1000 Intel',name_ar:'1000 Ø¥Ù†ØªÙ„',amount:1000},                        premium:{type:'frame',icon:'ðŸŒ™',imageUrl:'',name_en:'Moon Frame',name_ar:'Ø¥Ø·Ø§Ø± Ø§Ù„Ù‚Ù…Ø±',itemId:'fp_frame_moon',rarity:'Legendary', durationDays:null, season:null} },
  { level:23, xp:19800,free:{type:'title',icon:'ðŸŒ™',imageUrl:'',name_en:'Shadow Title',name_ar:'Ù„Ù‚Ø¨ Ø§Ù„Ø¸Ù„',itemId:'fp_title_shadow',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'2200 Intel',name_ar:'2200 Ø¥Ù†ØªÙ„',amount:2200} },
  { level:24, xp:22200,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1100 Intel',name_ar:'1100 Ø¥Ù†ØªÙ„',amount:1100},                        premium:{type:'badge',icon:'ðŸŒŒ',imageUrl:'',name_en:'Galaxy Badge',name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ù…Ø¬Ø±Ø©',itemId:'fp_badge_galaxy',rarity:'Legendary', durationDays:null, season:null} },
  { level:25, xp:24800,free:{type:'badge',icon:'ðŸ…',imageUrl:'',name_en:'Gold Badge',name_ar:'Ø´Ø§Ø±Ø© Ø°Ù‡Ø¨ÙŠØ©',itemId:'fp_badge_gold',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'title',icon:'ðŸ…',imageUrl:'',name_en:'Gold Title',name_ar:'Ù„Ù‚Ø¨ Ø°Ù‡Ø¨ÙŠ',itemId:'fp_title_gold',rarity:'Legendary', durationDays:null, season:null} },
  { level:26, xp:27600,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1200 Intel',name_ar:'1200 Ø¥Ù†ØªÙ„',amount:1200},                        premium:{type:'frame',icon:'ðŸ”¥',imageUrl:'',name_en:'Inferno Frame',name_ar:'Ø¥Ø·Ø§Ø± Ø¬Ù‡Ù†Ù…',itemId:'fp_frame_inferno',rarity:'Legendary', durationDays:null, season:null} },
  { level:27, xp:30600,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1300 Intel',name_ar:'1300 Ø¥Ù†ØªÙ„',amount:1300},                        premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'2500 Intel',name_ar:'2500 Ø¥Ù†ØªÙ„',amount:2500} },
  { level:28, xp:33800,free:{type:'frame',icon:'âš¡',imageUrl:'',name_en:'Thunder Frame',name_ar:'Ø¥Ø·Ø§Ø± Ø§Ù„Ø±Ø¹Ø¯',itemId:'fp_frame_thunder',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'badge',icon:'âš¡',imageUrl:'',name_en:'Thunder Badge',name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ø±Ø¹Ø¯',itemId:'fp_badge_thunder',rarity:'Legendary', durationDays:null, season:null} },
  { level:29, xp:37200,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1400 Intel',name_ar:'1400 Ø¥Ù†ØªÙ„',amount:1400},                        premium:{type:'title',icon:'ðŸŒŠ',imageUrl:'',name_en:'Ocean Title',name_ar:'Ù„Ù‚Ø¨ Ø§Ù„Ù…Ø­ÙŠØ·',itemId:'fp_title_ocean',rarity:'Legendary', durationDays:null, season:null} },
  { level:30, xp:40800,free:{type:'title',icon:'ðŸ‘‘',imageUrl:'',name_en:'King Title',name_ar:'Ù„Ù‚Ø¨ Ø§Ù„Ù…Ù„Ùƒ',itemId:'fp_title_king',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'frame',icon:'ðŸ’€',imageUrl:'',name_en:'Skull Frame',name_ar:'Ø¥Ø·Ø§Ø± Ø§Ù„Ø¬Ù…Ø¬Ù…Ø©',itemId:'fp_frame_skull',rarity:'Legendary', durationDays:null, season:null} },
  { level:31, xp:44600,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1500 Intel',name_ar:'1500 Ø¥Ù†ØªÙ„',amount:1500},                        premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'2800 Intel',name_ar:'2800 Ø¥Ù†ØªÙ„',amount:2800} },
  { level:32, xp:48600,free:{type:'badge',icon:'ðŸ”®',imageUrl:'',name_en:'Mystic Badge',name_ar:'Ø´Ø§Ø±Ø© ØºØ§Ù…Ø¶Ø©',itemId:'fp_badge_mystic',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'frame',icon:'ðŸ”®',imageUrl:'',name_en:'Mystic Frame',name_ar:'Ø¥Ø·Ø§Ø± ØºØ§Ù…Ø¶',itemId:'fp_frame_mystic',rarity:'Legendary', durationDays:null, season:null} },
  { level:33, xp:52900,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1600 Intel',name_ar:'1600 Ø¥Ù†ØªÙ„',amount:1600},                        premium:{type:'title',icon:'ðŸ”¥',imageUrl:'',name_en:'Flame Title',name_ar:'Ù„Ù‚Ø¨ Ø§Ù„Ù„Ù‡Ø¨',itemId:'fp_title_flame',rarity:'Legendary', durationDays:null, season:null} },
  { level:34, xp:57400,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1700 Intel',name_ar:'1700 Ø¥Ù†ØªÙ„',amount:1700},                        premium:{type:'badge',icon:'ðŸ’¥',imageUrl:'',name_en:'Blast Badge',name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ø§Ù†ÙØ¬Ø§Ø±',itemId:'fp_badge_blast',rarity:'Legendary', durationDays:null, season:null} },
  { level:35, xp:62200,free:{type:'frame',icon:'ðŸŒˆ',imageUrl:'',name_en:'Rainbow Frame',name_ar:'Ø¥Ø·Ø§Ø± Ù‚ÙˆØ³ Ù‚Ø²Ø­',itemId:'fp_frame_rainbow',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'title',icon:'ðŸŒˆ',imageUrl:'',name_en:'Rainbow Title',name_ar:'Ù„Ù‚Ø¨ Ù‚ÙˆØ³ Ù‚Ø²Ø­',itemId:'fp_title_rainbow',rarity:'Legendary', durationDays:null, season:null} },
  { level:36, xp:67200,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'1800 Intel',name_ar:'1800 Ø¥Ù†ØªÙ„',amount:1800},                        premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'3000 Intel',name_ar:'3000 Ø¥Ù†ØªÙ„',amount:3000} },
  { level:37, xp:72500,free:{type:'badge',icon:'ðŸŒ‘',imageUrl:'',name_en:'Dark Badge',name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ø¸Ù„Ø§Ù…',itemId:'fp_badge_dark',rarity:'Legendary', durationDays:null, season:null}, premium:{type:'frame',icon:'ðŸŒ‘',imageUrl:'',name_en:'Dark Frame',name_ar:'Ø¥Ø·Ø§Ø± Ø§Ù„Ø¸Ù„Ø§Ù…',itemId:'fp_frame_dark',rarity:'Legendary', durationDays:null, season:null} },
  { level:38, xp:78100,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'2000 Intel',name_ar:'2000 Ø¥Ù†ØªÙ„',amount:2000},                        premium:{type:'title',icon:'ðŸ‘ï¸',imageUrl:'',name_en:'Watcher Title',name_ar:'Ù„Ù‚Ø¨ Ø§Ù„Ø±Ø§ØµØ¯',itemId:'fp_title_watcher',rarity:'Legendary', durationDays:null, season:null} },
  { level:39, xp:84000,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'2100 Intel',name_ar:'2100 Ø¥Ù†ØªÙ„',amount:2100},                        premium:{type:'badge',icon:'ðŸ¹',imageUrl:'',name_en:'Arrow Badge',name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ø³Ù‡Ù…',itemId:'fp_badge_arrow',rarity:'Legendary', durationDays:null, season:null} },
  { level:40, xp:90200,free:{type:'title',icon:'ðŸ”®',imageUrl:'',name_en:'Mystic Title',name_ar:'Ù„Ù‚Ø¨ Ø§Ù„ØºÙ…ÙˆØ¶',itemId:'fp_title_mystic',rarity:'Mythic', durationDays:null, season:null}, premium:{type:'frame',icon:'ðŸ”®',imageUrl:'',name_en:'Mythic Frame',name_ar:'Ø¥Ø·Ø§Ø± Ø®Ø±Ø§ÙÙŠ',itemId:'fp_frame_mythic',rarity:'Mythic', durationDays:null, season:null} },
  { level:41, xp:96800,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'2200 Intel',name_ar:'2200 Ø¥Ù†ØªÙ„',amount:2200},                        premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'3500 Intel',name_ar:'3500 Ø¥Ù†ØªÙ„',amount:3500} },
  { level:42, xp:103700,free:{type:'badge',icon:'ðŸ’ ',imageUrl:'',name_en:'Prism Badge',name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ù…Ù†Ø´ÙˆØ±',itemId:'fp_badge_prism',rarity:'Mythic', durationDays:null, season:null}, premium:{type:'frame',icon:'ðŸ’ ',imageUrl:'',name_en:'Prism Frame',name_ar:'Ø¥Ø·Ø§Ø± Ø§Ù„Ù…Ù†Ø´ÙˆØ±',itemId:'fp_frame_prism',rarity:'Mythic', durationDays:null, season:null} },
  { level:43, xp:110900,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'2400 Intel',name_ar:'2400 Ø¥Ù†ØªÙ„',amount:2400},                       premium:{type:'title',icon:'ðŸ’ ',imageUrl:'',name_en:'Prism Title',name_ar:'Ù„Ù‚Ø¨ Ø§Ù„Ù…Ù†Ø´ÙˆØ±',itemId:'fp_title_prism',rarity:'Mythic', durationDays:null, season:null} },
  { level:44, xp:118500,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'2600 Intel',name_ar:'2600 Ø¥Ù†ØªÙ„',amount:2600},                       premium:{type:'badge',icon:'ðŸŒ€',imageUrl:'',name_en:'Void Badge',name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„ÙØ±Ø§Øº',itemId:'fp_badge_void',rarity:'Mythic', durationDays:null, season:null} },
  { level:45, xp:126500,free:{type:'frame',icon:'ðŸŒ€',imageUrl:'',name_en:'Void Frame',name_ar:'Ø¥Ø·Ø§Ø± Ø§Ù„ÙØ±Ø§Øº',itemId:'fp_frame_void',rarity:'Mythic', durationDays:null, season:null}, premium:{type:'title',icon:'ðŸŒ€',imageUrl:'',name_en:'Void Title',name_ar:'Ù„Ù‚Ø¨ Ø§Ù„ÙØ±Ø§Øº',itemId:'fp_title_void',rarity:'Mythic', durationDays:null, season:null} },
  { level:46, xp:134900,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'2800 Intel',name_ar:'2800 Ø¥Ù†ØªÙ„',amount:2800},                       premium:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'4000 Intel',name_ar:'4000 Ø¥Ù†ØªÙ„',amount:4000} },
  { level:47, xp:143700,free:{type:'badge',icon:'ðŸ”¥',imageUrl:'',name_en:'Phoenix Badge',name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„ÙÙŠÙ†ÙŠÙƒØ³',itemId:'fp_badge_phoenix',rarity:'Mythic', durationDays:null, season:null}, premium:{type:'frame',icon:'ðŸ”¥',imageUrl:'',name_en:'Phoenix Frame',name_ar:'Ø¥Ø·Ø§Ø± Ø§Ù„ÙÙŠÙ†ÙŠÙƒØ³',itemId:'fp_frame_phoenix',rarity:'Mythic', durationDays:null, season:null} },
  { level:48, xp:152900,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'3000 Intel',name_ar:'3000 Ø¥Ù†ØªÙ„',amount:3000},                       premium:{type:'title',icon:'ðŸ”¥',imageUrl:'',name_en:'Phoenix Title',name_ar:'Ù„Ù‚Ø¨ Ø§Ù„ÙÙŠÙ†ÙŠÙƒØ³',itemId:'fp_title_phoenix',rarity:'Mythic', durationDays:null, season:null} },
  { level:49, xp:162600,free:{type:'currency',icon:'ðŸ§ ',imageUrl:'',name_en:'3200 Intel',name_ar:'3200 Ø¥Ù†ØªÙ„',amount:3200},                       premium:{type:'badge',icon:'ðŸŒŸ',imageUrl:'',name_en:'Nova Badge',name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ù†Ø¬Ù… Ø§Ù„Ù…ØªÙØ¬Ø±',itemId:'fp_badge_nova',rarity:'Mythic', durationDays:null, season:null} },
  { level:50, xp:172700,free:{type:'frame',icon:'ðŸŒŸ',imageUrl:'',name_en:'Nova Frame',name_ar:'Ø¥Ø·Ø§Ø± Ø§Ù„Ù†Ø¬Ù… Ø§Ù„Ù…ØªÙØ¬Ø±',itemId:'fp_frame_nova',rarity:'Mythic', durationDays:null, season:null}, premium:{type:'title',icon:'ðŸ”±',imageUrl:'',name_en:'GOD Title',name_ar:'Ù„Ù‚Ø¨ Ø§Ù„Ø¥Ù„Ù‡',itemId:'fp_title_god',rarity:'Mythic', durationDays:null, season:null} },
];

var UN_PASS_DAILY_MISSIONS = [
  { id:'d1', icon:'ðŸŽ®', imageUrl:'',name_en:'Play 1 game',       name_ar:'Ø§Ù„Ø¹Ø¨ Ù„Ø¹Ø¨Ø© ÙˆØ§Ø­Ø¯Ø©',    xp:30  },
  { id:'d2', icon:'ðŸ†', imageUrl:'',name_en:'Win 1 game',        name_ar:'Ø§Ø±Ø¨Ø­ Ù„Ø¹Ø¨Ø© ÙˆØ§Ø­Ø¯Ø©',    xp:60  },
  { id:'d3', icon:'ðŸ•µï¸', imageUrl:'',name_en:'Play as Spy',      name_ar:'Ø§Ù„Ø¹Ø¨ ÙƒØ¬Ø§Ø³ÙˆØ³',        xp:50  },
  { id:'d4', icon:'ðŸ’¬', imageUrl:'',name_en:'Send a gift',       name_ar:'Ø£Ø±Ø³Ù„ Ù‡Ø¯ÙŠØ©',          xp:40  },
  { id:'d5', icon:'ðŸ‘¥', imageUrl:'',name_en:'Add a friend',      name_ar:'Ø£Ø¶Ù ØµØ¯ÙŠÙ‚',           xp:35  },
  { id:'d6', icon:'ðŸ“¸', imageUrl:'',name_en:'Post a moment',     name_ar:'Ø§Ù†Ø´Ø± Ù„Ø­Ø¸Ø©',          xp:45  },
  { id:'d7', icon:'ðŸ—¨ï¸', imageUrl:'',name_en:'Comment on moment',name_ar:'Ø¹Ù„Ù‚ Ø¹Ù„Ù‰ Ù„Ø­Ø¸Ø©',       xp:25  },
];

var UN_PASS_WEEKLY_MISSIONS = [
  { id:'w1', icon:'ðŸŽ®', imageUrl:'',name_en:'Play 10 games',     name_ar:'Ø§Ù„Ø¹Ø¨ 10 Ø£Ù„Ø¹Ø§Ø¨',      xp:200 },
  { id:'w2', icon:'ðŸ†', imageUrl:'',name_en:'Win 5 games',       name_ar:'Ø§Ø±Ø¨Ø­ 5 Ø£Ù„Ø¹Ø§Ø¨',       xp:300 },
  { id:'w3', icon:'ðŸŽ', imageUrl:'',name_en:'Send 5 gifts',      name_ar:'Ø£Ø±Ø³Ù„ 5 Ù‡Ø¯Ø§ÙŠØ§',       xp:250 },
  { id:'w4', icon:'ðŸ“¸', imageUrl:'',name_en:'Post 3 moments',    name_ar:'Ø§Ù†Ø´Ø± 3 Ù„Ø­Ø¸Ø§Øª',       xp:220 },
  { id:'w5', icon:'ðŸ‘¥', imageUrl:'',name_en:'Chat with 3 friends',name_ar:'ÙƒÙ„Ù… 3 Ø£ØµØ¯Ù‚Ø§Ø¡',     xp:180 },
];

var OGIN_REWARDS = [
    { day: 1, type: 'currency', amount: 100, icon: 'ðŸ§ ', iconUrl: '', name_en: '100 Intel', name_ar: '100 Ø¥Ù†ØªÙ„' },
    { day: 2, type: 'currency', amount: 150, icon: 'ðŸ§ ', iconUrl: '', name_en: '150 Intel', name_ar: '150 Ø¥Ù†ØªÙ„' },
    { day: 3, type: 'currency', amount: 200, icon: 'ðŸ§ ', iconUrl: '', name_en: '200 Intel', name_ar: '200 Ø¥Ù†ØªÙ„' },
    { day: 4, type: 'currency', amount: 250, icon: 'ðŸ§ ', iconUrl: '', name_en: '250 Intel', name_ar: '250 Ø¥Ù†ØªÙ„' },
    { day: 5, type: 'currency', amount: 300, icon: 'ðŸ§ ', iconUrl: '', name_en: '300 Intel', name_ar: '300 Ø¥Ù†ØªÙ„' },
    { day: 6, type: 'currency', amount: 400, icon: 'ðŸ§ ', iconUrl: '', name_en: '400 Intel', name_ar: '400 Ø¥Ù†ØªÙ„' },
    { day: 7, type: 'badge', itemId: 'badge_vip', icon: 'â­', iconUrl: '', name_en: 'VIP Badge', name_ar: 'Ø´Ø§Ø±Ø© VIP', special: true, durationDays: null, season: null },
    { day: 8, type: 'currency', amount: 350, icon: 'ðŸ§ ', iconUrl: '', name_en: '350 Intel', name_ar: '350 Ø¥Ù†ØªÙ„' },
    { day: 9, type: 'currency', amount: 400, icon: 'ðŸ§ ', iconUrl: '', name_en: '400 Intel', name_ar: '400 Ø¥Ù†ØªÙ„' },
    { day: 10, type: 'currency', amount: 450, icon: 'ðŸ§ ', iconUrl: '', name_en: '450 Intel', name_ar: '450 Ø¥Ù†ØªÙ„' },
    { day: 11, type: 'currency', amount: 500, icon: 'ðŸ§ ', iconUrl: '', name_en: '500 Intel', name_ar: '500 Ø¥Ù†ØªÙ„' },
    { day: 12, type: 'currency', amount: 550, icon: 'ðŸ§ ', iconUrl: '', name_en: '550 Intel', name_ar: '550 Ø¥Ù†ØªÙ„' },
    { day: 13, type: 'currency', amount: 600, icon: 'ðŸ§ ', iconUrl: '', name_en: '600 Intel', name_ar: '600 Ø¥Ù†ØªÙ„' },
    { day: 14, type: 'frame', itemId: 'frame_neon', icon: 'ðŸ–¼ï¸', iconUrl: '', name_en: 'Neon Frame', name_ar: 'Ø¥Ø·Ø§Ø± Ù†ÙŠÙˆÙ†', special: true, durationDays: null, season: null },
    { day: 15, type: 'currency', amount: 700, icon: 'ðŸ§ ', iconUrl: '', name_en: '700 Intel', name_ar: '700 Ø¥Ù†ØªÙ„' },
    { day: 16, type: 'currency', amount: 750, icon: 'ðŸ§ ', iconUrl: '', name_en: '750 Intel', name_ar: '750 Ø¥Ù†ØªÙ„' },
    { day: 17, type: 'currency', amount: 800, icon: 'ðŸ§ ', iconUrl: '', name_en: '800 Intel', name_ar: '800 Ø¥Ù†ØªÙ„' },
    { day: 18, type: 'currency', amount: 850, icon: 'ðŸ§ ', iconUrl: '', name_en: '850 Intel', name_ar: '850 Ø¥Ù†ØªÙ„' },
    { day: 19, type: 'currency', amount: 900, icon: 'ðŸ§ ', iconUrl: '', name_en: '900 Intel', name_ar: '900 Ø¥Ù†ØªÙ„' },
    { day: 20, type: 'currency', amount: 950, icon: 'ðŸ§ ', iconUrl: '', name_en: '950 Intel', name_ar: '950 Ø¥Ù†ØªÙ„' },
    { day: 21, type: 'title', itemId: 'title_spy', icon: 'ðŸ•µï¸', iconUrl: '', name_en: 'Mr. Spy Title', name_ar: 'Ù„Ù‚Ø¨ Ø³ÙŠØ¯ Ø¬Ø§Ø³ÙˆØ³', special: true, durationDays: null, season: null },
    { day: 22, type: 'currency', amount: 1000, icon: 'ðŸ§ ', iconUrl: '', name_en: '1000 Intel', name_ar: '1000 Ø¥Ù†ØªÙ„' },
    { day: 23, type: 'currency', amount: 1100, icon: 'ðŸ§ ', iconUrl: '', name_en: '1100 Intel', name_ar: '1100 Ø¥Ù†ØªÙ„' },
    { day: 24, type: 'currency', amount: 1200, icon: 'ðŸ§ ', iconUrl: '', name_en: '1200 Intel', name_ar: '1200 Ø¥Ù†ØªÙ„' },
    { day: 25, type: 'currency', amount: 1300, icon: 'ðŸ§ ', iconUrl: '', name_en: '1300 Intel', name_ar: '1300 Ø¥Ù†ØªÙ„' },
    { day: 26, type: 'currency', amount: 1400, icon: 'ðŸ§ ', iconUrl: '', name_en: '1400 Intel', name_ar: '1400 Ø¥Ù†ØªÙ„' },
    { day: 27, type: 'currency', amount: 1500, icon: 'ðŸ§ ', iconUrl: '', name_en: '1500 Intel', name_ar: '1500 Ø¥Ù†ØªÙ„' },
    { day: 28, type: 'badge', itemId: 'badge_pro', icon: 'ðŸ†', iconUrl: '', name_en: 'Pro Badge', name_ar: 'Ø´Ø§Ø±Ø© Ù…Ø­ØªØ±Ù', special: true, durationDays: null, season: null },
    { day: 29, type: 'currency', amount: 2500, icon: 'ðŸ§ ', iconUrl: '', name_en: '2500 Intel', name_ar: '2500 Ø¥Ù†ØªÙ„' },
    { day: 30, type: 'frame', itemId: 'frame_gold', icon: 'ðŸ‘‘', iconUrl: '', name_en: 'Gold Frame', name_ar: 'Ø¥Ø·Ø§Ø± Ø°Ù‡Ø¨ÙŠ', special: true, final: true, durationDays: null, season: null },
];

var OGIN_REWARDS_CONFIG = {
    autoResetMonthly: true,
};

// âœ… Returns the ACTUAL current month string e.g. '2026-03'
var etCurrentCycleMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// âœ… Returns true ONLY when the user's stored cycleMonth differs from the actual current month
var heckLoginRewardsCycle = (userData) => {
    if (!LOGIN_REWARDS_CONFIG.autoResetMonthly) return false;
    const storedMonth = userData?.loginRewards?.cycleMonth;
    // No stored month means a fresh/legacy user â€” don't reset, just update going forward
    if (!storedMonth) return false;
    const currentMonth = getCurrentCycleMonth();
    return storedMonth !== currentMonth;
};

// ðŸ“¦ DAILY TASKS CONFIG - 8 Boxes (by online time)

