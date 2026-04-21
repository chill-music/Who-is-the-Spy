'use strict';

/* ═══════════════════════════════════════════════════════════════
   WHO IS THE SPY — game.config.js
   Global configuration, constants, word banks
   ═══════════════════════════════════════════════════════════════ */

window.SPY_CONFIG = (function () {


  /* ─── Game Modes ───────────────────────────────────────────── */
  var GAME_MODES = {
    DESCRIPTION : 'description',
    QUESTION    : 'question'
  };

  /* ─── Player Roles ─────────────────────────────────────────── */
  var ROLES = {
    VILLAGER : 'villager',
    SPY      : 'spy'
  };

  /* ─── Game Phases ──────────────────────────────────────────── */
  var PHASES = {
    LOBBY       : 'lobby',
    ROLE_REVEAL : 'role_reveal',
    SPEAKING    : 'speaking',
    FREE_QA     : 'free_qa',
    VOTING      : 'voting',
    TIE_VOTE    : 'tie_vote',
    SPY_GUESS   : 'spy_guess',
    RESULTS     : 'results'
  };

  /* ─── Timers (seconds) ─────────────────────────────────────── */
  var TIMERS = {
    SPEAKING     : 30,
    FREE_QA      : 60,
    VOTING       : 60,
    SPY_GUESS    : 15,
    ROLE_REVEAL  : 8,
    ROUND_PAUSE  : 3
  };

  /* ─── Spy Count Rules ──────────────────────────────────────── */
  var SPY_COUNT = { 4:1, 5:1, 6:1, 7:1, 8:1, 9:2, 10:2, 11:2, 12:2 };

  /* ─── Player Limits ────────────────────────────────────────── */
  var MIN_PLAYERS = 4;
  var MAX_PLAYERS = 12;

  /* ─── Word Categories ──────────────────────────────────────── */
  var CATEGORIES = {
    animals: {
      id   : 'animals',
      name : 'Animals',
      nameAr: 'حيوانات',
      icon : '🐾',
      words: [
        'Cat','Dog','Lion','Tiger','Elephant','Giraffe','Zebra',
        'Penguin','Dolphin','Wolf','Fox','Bear','Eagle','Shark',
        'Crocodile','Camel','Rabbit','Horse','Monkey','Parrot',
        'Cheetah','Gorilla','Kangaroo','Panda','Rhino'
      ]
    },
    fruits: {
      id   : 'fruits',
      name : 'Fruits',
      nameAr: 'فواكه',
      icon : '🍎',
      words: [
        'Apple','Mango','Banana','Orange','Strawberry','Watermelon',
        'Grape','Pineapple','Cherry','Lemon','Peach','Kiwi',
        'Coconut','Pomegranate','Fig','Date','Avocado','Papaya',
        'Blueberry','Raspberry'
      ]
    },
    jobs: {
      id   : 'jobs',
      name : 'Jobs',
      nameAr: 'وظائف ومهن',
      icon : '💼',
      words: [
        'Doctor','Engineer','Teacher','Pilot','Chef','Artist',
        'Lawyer','Nurse','Architect','Police','Firefighter',
        'Journalist','Programmer','Actor','Singer','Dentist',
        'Pharmacist','Judge','Soldier','Astronaut'
      ]
    },
    football: {
      id   : 'football',
      name : 'Football Stars',
      nameAr: 'نجوم كرة القدم',
      icon : '⚽',
      words: [
        'Messi','Ronaldo','Neymar','Mbappe','Salah','Benzema',
        'De Bruyne','Lewandowski','Kane','Modric','Ramos',
        'Haaland','Son','Vinicius','Bellingham','Kroos',
        'Alisson','Courtois','Pedri','Camavinga'
      ]
    },
    drinks: {
      id   : 'drinks',
      name : 'Drinks',
      nameAr: 'مشروبات',
      icon : '🥤',
      words: [
        'Coffee','Tea','Juice','Water','Milk','Soda','Lemonade',
        'Smoothie','Cappuccino','Espresso','Hot Chocolate',
        'Energy Drink','Milkshake','Coconut Water','Green Tea',
        'Matcha','Chai','Americano','Iced Tea'
      ]
    },
    anime: {
      id   : 'anime',
      name : 'Anime',
      nameAr: 'أنمي',
      icon : '🎌',
      words: [
        'Naruto','Goku','Luffy','Ichigo','Sasuke','Light Yagami',
        'Eren Yeager','Levi','Gojo','Deku','Killua','Zoro',
        'Saitama','Tanjiro','Itachi','Meliodas','Rimuru',
        'Kirito','Natsu','Edward Elric'
      ]
    },
    places: {
      id   : 'places',
      name : 'Places',
      nameAr: 'أماكن',
      icon : '🌍',
      words: [
        'Beach','Mountain','Desert','Forest','Stadium','Hospital',
        'School','Airport','Museum','Restaurant','Library',
        'Hotel','Park','Market','Cinema','Castle','Lighthouse',
        'Farm','Cave','Island'
      ]
    },
    random: {
      id   : 'random',
      name : 'Random',
      nameAr: 'عشوائي',
      icon : '🎲',
      words: []           /* filled at runtime */
    }
  };

  /* ─── Avatar Palette ───────────────────────────────────────── */
  var AVATAR_COLORS = [
    '#4a90e2','#e24a4a','#4ae24a','#e2c44a','#9b4ae2',
    '#4ae2c4','#e24ac4','#c4e24a','#4a9be2','#e29b4a',
    '#4ae29b','#e24a9b'
  ];

  /* ─── App version ──────────────────────────────────────────── */
  var VERSION = '1.0.0';

  /* ─── Public ───────────────────────────────────────────────── */
  return {
    FIREBASE_CONFIG : null,
    GAME_MODES      : GAME_MODES,
    ROLES           : ROLES,
    PHASES          : PHASES,
    TIMERS          : TIMERS,
    SPY_COUNT       : SPY_COUNT,
    MIN_PLAYERS     : MIN_PLAYERS,
    MAX_PLAYERS     : MAX_PLAYERS,
    CATEGORIES      : CATEGORIES,
    AVATAR_COLORS   : AVATAR_COLORS,
    VERSION         : VERSION
  };

}());
