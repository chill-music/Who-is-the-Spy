(function() {
    // ── Group Level System ──
    var GROUP_LEVEL_CONFIG = [
        { level:1,  xp:0,    icon:'🌱', name_en:'Seed',    name_ar:'بذرة',   color:'#4ade80' },
        { level:2,  xp:50,   icon:'🌿', name_en:'Sprout',  name_ar:'نبتة',   color:'#22d3ee' },
        { level:3,  xp:150,  icon:'🌳', name_en:'Tree',    name_ar:'شجرة',   color:'#34d399' },
        { level:4,  xp:300,  icon:'⭐', name_en:'Star',    name_ar:'نجمة',   color:'#fbbf24' },
        { level:5,  xp:500,  icon:'💎', name_en:'Diamond', name_ar:'ماسة',   color:'#60a5fa' },
        { level:6,  xp:800,  icon:'👑', name_en:'Crown',   name_ar:'تاج',    color:'#ffd700' },
        { level:7,  xp:1200, icon:'🔥', name_en:'Flame',   name_ar:'لهب',    color:'#f97316' },
        { level:8,  xp:2000, icon:'⚡', name_en:'Thunder', name_ar:'رعد',    color:'#a78bfa' },
        { level:9,  xp:3500, icon:'🌌', name_en:'Galaxy',  name_ar:'مجرة',   color:'#818cf8' },
        { level:10, xp:5000, icon:'🏆', name_en:'Legend',  name_ar:'أسطورة', color:'#00d4ff' },
    ];

    var getGroupLevel = (xp = 0) => {
        var cfg = GROUP_LEVEL_CONFIG[0];
        for (var i = GROUP_LEVEL_CONFIG.length - 1; i >= 0; i--) {
            if (xp >= GROUP_LEVEL_CONFIG[i].xp) { cfg = GROUP_LEVEL_CONFIG[i]; break; }
        }
        return cfg;
    };

    window.GROUP_LEVEL_CONFIG = GROUP_LEVEL_CONFIG;
    window.getGroupLevel = getGroupLevel;
})();
