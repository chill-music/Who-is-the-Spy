# 📖 دليل المطور — Who is the Spy PWA
> آخر تحديث: 2026-03-31  
> للاستخدام عند بناء ألعاب أو ميزات جديدة

---

## 🏗️ البنية التقنية

| الجانب | التفاصيل |
|--------|---------|
| **Framework** | React 18 (CDN — بدون JSX، بالـ `React.createElement`) |
| **State** | `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo` — كلها من `window.React` |
| **Database** | Firebase Firestore v10 |
| **Auth** | Firebase Authentication (Google + Password) |
| **Storage** | Firebase Storage |
| **Styling** | Vanilla CSS + inline styles |
| **Language support** | ثنائي اللغة `lang = 'ar' | 'en'` |

---

## 🔑 المتغيرات العامة (window.xxx)

```javascript
// ─── CORE ───────────────────────────────────────────
window.React          // React library
window.ReactDOM       // ReactDOM
window.firebase       // Firebase SDK
window.auth           // firebase.auth()
window.db             // firebase.firestore()
window.storage        // firebase.storage()
window.appId          // 'pro_spy_v25_final_fix_complete'

// ─── CURRENT USER ────────────────────────────────────
window.currentUser    // كائن بيانات المستخدم الحالي من Firestore
// الحقول المهمة:
// currentUser.uid          — معرف المستخدم
// currentUser.displayName  — الاسم
// currentUser.photoURL     — رابط الصورة
// currentUser.currency     — رصيد العملة الرئيسية 🧠
// currentUser.lang         — اللغة 'ar' | 'en'
// currentUser.vip.xp       — نقاط VIP XP
// currentUser.isAdmin      — هل admin (boolean)
// currentUser.staffRole    — { role: 'admin'|'moderator' }
// currentUser.inventory    — { frames:[], titles:[], badges:[], gifts:[] }
// currentUser.equipped     — { frame: 'id', title: 'id', ... }
// currentUser.stats        — { wins: 0, losses: 0 }

// ─── HELPERS ─────────────────────────────────────────
window.fmtNum(n)               // 1500 → "1.5K", 2000000 → "2M"
window.fetchMiniProfileData    // async (uid) → userData
window.getVIPLevel(userData)   // → 0-10
window.getVIPConfig(vipLevel)  // → VIP config object
window.TS()                    // → firebase.firestore.FieldValue.serverTimestamp()
window.getFamilySignURL(data)  // → URL | null
window.openLuckyGamesMiniProfile(uid)  // يفتح ميني بروفايل من اللعبة
```

---

## 💰 العملات (Currency System)

| الاسم | المتغير في الكود | الرمز | الاستخدام |
|-------|---------------|-------|----------|
| **العملة الرئيسية** | `userData.currency` | 🧠 | الشراء من المتجر، الألعاب، الإهداء |
| **عملة العائلة** | `userData.familyCoins` | 🏅 | خاص بنظام العائلة |
| **VIP XP** | `userData.vip.xp` | ⚡ | يرتفع بإرسال الهدايا |

### قراءة رصيد المستخدم:
```javascript
var balance = window.currentUser?.currency || 0;
var familyCoins = window.currentUser?.familyCoins || 0;
```

### خصم من الرصيد (الطريقة الصحيحة):
```javascript
usersCollection.doc(uid).update({
    currency: firebase.firestore.FieldValue.increment(-amount)
});
```

---

## 🗃️ مجموعات Firestore (Collections)

### المسار الأساسي:
```
artifacts/pro_spy_v25_final_fix_complete/public/data/{collection}
```

### المجموعات المتاحة:

```javascript
// المتغيرات جاهزة في الكود مباشرة:
usersCollection          // المستخدمين
guestsCollection         // الزوار
roomsCollection          // غرف اللعب
historyCollection        // سجل الألعاب
notificationsCollection  // الإشعارات
giftsLogCollection       // سجل الهدايا
momentsCollection        // المنشورات
familiesCollection       // العائلات (القبائل)
couplesCollection        // الأزواج
groupsCollection         // الشات الجماعي
chatsCollection          // المحادثات الخاصة
publicChatCollection     // الشات العام
redPacketsCollection     // المغلفات الحمراء
bffCollection            // علاقات BFF
botChatsCollection       // البوت
goldLogCollection        // سجل المعاملات المالية
pendingFinancesCollection // المعاملات المعلقة
staffLogCollection       // سجل النشاط الإداري
ticketsCollection        // تذاكر الدعم
helpFaqCollection        // الأسئلة الشائعة
feedbackCollection       // التغذية الراجعة
newsLogCollection        // أخبار العائلة

// ألعاب المحظوظين:
// artifacts/{appId}/public/data/lucky_games_sessions/greedy_cat
```

---

## 🎮 إضافة لعبة جديدة

### الخطوة 1 — ملف اللعبة
```javascript
// src/features/lucky-games/MyNewGame.js

(function() {
    var db        = window.db;
    var appId     = window.appId;
    var fmtNum    = window.fmtNum;
    
    var S = {
        currentUser: null,
        // ... state الخاص باللعبة
    };
    
    window.MyNewGame = {
        start: function(userData) {
            S.currentUser = userData;
            // منطق البداية
        },
        stop: function() {
            // تنظيف عند الخروج
        }
    };
})();
```

### الخطوة 2 — قراءة بيانات الجلسة من Firestore
```javascript
var sessionDoc = db.collection('artifacts').doc(appId)
    .collection('public').doc('data')
    .collection('lucky_games_sessions').doc('my_game');

// الاستماع للتحديثات:
sessionDoc.onSnapshot(function(doc) {
    if (!doc.exists) return;
    var data = doc.data();
    // data.winningId, data.endTime, data.roundId ...
});
```

### الخطوة 3 — كتابة فائز
```javascript
// بيكتب تحت subcollection round_winners
sessionDoc.collection('round_winners').add({
    roundId:     currentRoundId,
    uid:         S.currentUser.uid,         // مطلوب في الـ Firestore Rule
    displayName: S.currentUser.displayName,
    photoURL:    S.currentUser.photoURL,
    amount:      winAmount,
    emoji:       '🎉',
    timestamp:   firebase.firestore.FieldValue.serverTimestamp()
}).catch(function() {});
```

---

## 🎨 نظام الـ Z-Index

```javascript
var Z = {
    MODAL:      10000,   // مودالز عادية
    MODAL_HIGH: 12000,   // FunPass, BrowseRooms
    MODAL_TOP:  15000,   // SelfChat, Notifications
    FORCED:     25000,   // تحذير تسجيل الخروج الإجباري
    OVERLAY:    99999,   // Overlays كاملة
    TOOLTIP:    999999,  // Tooltips والـ dropdowns
};
```

---

## 🎨 الألوان والتدرجات الجاهزة

```javascript
var GR = {
    DARK_CARD: 'linear-gradient(135deg, rgba(15,15,35,0.95), rgba(25,25,50,0.95))',
    NEON:      'linear-gradient(135deg, rgba(0,242,255,0.15), rgba(112,0,255,0.15))',
    GOLD:      'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.15))',
    GOLD_SOFT: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,140,0,0.08))',
    CYAN_SOFT: 'linear-gradient(135deg, rgba(0,242,255,0.08), rgba(112,0,255,0.08))',
};
```

---

## 👑 نظام الأدوار

```javascript
// التحقق من الصلاحيات:
var isOwner     = user.uid === 'PfZAViU4swQdbBZOfqJDnPZSs9l2';
var isAdmin     = user.staffRole?.role === 'admin';
var isModerator = user.staffRole?.role === 'moderator';
var isStaff     = isOwner || isAdmin || isModerator;
```

| الدور | الرمز | الصلاحيات |
|------|------|----------|
| Owner | 👑 | كل شيء |
| Admin 🛡️ | يعيّن moderators |
| Moderator 🔰 | إدارة اللاعبين |

---

## 🛒 بنية بيانات المنتجات (SHOP_ITEMS)

```javascript
// الأنواع المتاحة في SHOP_ITEMS:
SHOP_ITEMS.frames          // إطارات الأفاتار
SHOP_ITEMS.titles          // الألقاب
SHOP_ITEMS.badges          // الشارات
SHOP_ITEMS.gifts           // الهدايا العادية
SHOP_ITEMS.gifts_vip       // هدايا VIP
SHOP_ITEMS.gifts_family    // هدايا العائلة
SHOP_ITEMS.gifts_special   // هدايا خاصة
SHOP_ITEMS.profileEffects  // تأثيرات البروفايل

// بنية أي منتج:
{
    id: 'unique_id',
    name_ar: 'الاسم',
    name_en: 'Name',
    cost: 500,          // بالعملة الرئيسية 🧠
    type: 'frames',     // نوع المنتج
    preview: '🪄',      // عرض مبدئي (emoji أو gradient)
    imageUrl: null,     // رابط صورة (اختياري)
    hidden: false,      // هل مخفي من المتجر
}
```

---

## 🖼️ نظام الأفاتار فريم — خريطة كاملة

> **القاعدة الذهبية**: كل مكان جديد يعمل فريم خاص بيه مستقل — لا يعتمد على `AvatarWithFrame` الرئيسي حتى لو تغيّر ما يتأثرش.

---

### خريطة الأماكن الحالية

| المكان | الملف | النمط | يتأثر بتغيير المكان الآخر؟ |
|--------|-------|-------|--------------------------|
| **معظم الموقع** (لوبي، شات، أصدقاء، غرف) | `src/06-components-base.js` line 118 | React Component | ❌ مستقل |
| **صفحة البروفايل** | `src/features/profile/ProfileIdentityElements.js` line 85 | React Component (V11) | ❌ مستقل |
| **لعبة Greedy Cat** | `src/features/lucky-games/GreedyCatGame.js` line 762 | Plain `<img>` مستقل | ❌ مستقل |
| **لعبة Lucky Fruit** | `src/features/lucky-games/LuckyFruitGame.js` line 895 | يستخدم AvatarWithFrameV11 | ⚠️ يتأثر بالبروفايل |
| **لعبة Super777** | `src/features/lucky-games/Super777Game.js` line 284 | CSS داخلي + `<img>` | ❌ مستقل |

---

### نمط اللعبة المستقلة (Template جاهز لأي مكان جديد)

هذا النمط **مستقل 100%** — أي تغيير في أي مكان آخر لا يأثر عليه أبداً:

**CSS (في ملف CSS الخاص باللعبة):**
```css
/* ── AVATAR FRAME — مستقل لهذه اللعبة فقط ── */
#mygame-avatar-box {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  /* الحلقة الذهبية — غيّر الألوان حسب تصميم اللعبة */
  background: conic-gradient(from 0deg, #FFD700, #FFF9C4, #FFA500, #FFD700, #FFFDE7, #FFD700);
  box-shadow: 0 0 12px rgba(255,200,0,0.55), 0 2px 8px rgba(0,0,0,0.3);
  cursor: pointer;
  overflow: visible;
  flex-shrink: 0;
}

#mygame-avatar-mount {
  position: absolute;
  inset: 3px;          /* سماكة الحلقة = 3px */
  border-radius: 50%;
  overflow: hidden;
  background: transparent;
}

#mygame-avatar-mount img {
  width: 100% !important;
  height: 100% !important;
  border-radius: 50% !important;
  object-fit: cover !important;
  display: block;
}
```

**HTML (داخل buildHTML في اللعبة):**
```html
<div id="mygame-avatar-box">
  <div id="mygame-avatar-mount"></div>
</div>
```

**JS (لتعبئة الصورة):**
```javascript
function renderAvatar(userData) {
  var mount = document.getElementById('mygame-avatar-mount');
  if (!mount) return;
  var photo = userData && userData.photoURL ? userData.photoURL : '';
  /* Plain <img> — لا تستخدم AvatarWithFrame Component هنا */
  mount.innerHTML = photo
    ? '<img src="' + photo.replace(/"/g, '&quot;') + '" '
    +   'style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;" '
    +   'onerror="this.src=\'https://ui-avatars.com/api/?name=U&background=6366f1&color=fff\'" />'
    : '<div style="width:100%;height:100%;border-radius:50%;'
    +   'background:linear-gradient(135deg,#6366f1,#8b5cf6);'
    +   'display:flex;align-items:center;justify-content:center;font-size:20px;">😺</div>';
}
```

---

### لماذا لا نستخدم `AvatarWithFrame` Component في الألعاب؟

```
AvatarWithFrame يعمل:
  wrapper-div (48px)         ← حجم ثابت من sizeConfig
    ├── frame-img (48×48)    ← صورة الفريم من SHOP_ITEMS
    ├── mask-div  (42×42)    ← يخفي وسط صورة الفريم
    └── photo-img (42×42)    ← صورة المستخدم

لو حطيته جوا div حجمه 44px (مثل mount بـ inset:3px):
  ← الـ wrapper (48px) يكون أكبر من الحاوية = overflow + قطع في الصورة
```

**الحل البسيط:** الفريم الملوّن ييجي من CSS فقط (conic-gradient على الـ box)، والصورة `<img width:100%>` تملأ الـ mount بالضبط. **بدون أي Component**.

---

### إذا أردت إظهار فريم المستخدم المشترى من المتجر في لعبتك

```javascript
function renderAvatarWithShopFrame(userData) {
  var mount = document.getElementById('mygame-avatar-mount');
  var box   = document.getElementById('mygame-avatar-box');
  if (!mount || !box) return;

  /* جلب الفريم المجهز من المتجر */
  var frameId   = userData && userData.equipped && userData.equipped.frames;
  var frameItem = frameId && typeof SHOP_ITEMS !== 'undefined'
    ? (SHOP_ITEMS.frames || []).find(function(f) { return f.id === frameId; })
    : null;
  var frameUrl  = frameItem && (frameItem.imageUrl || frameItem.preview);

  /* الحلقة: لو عنده فريم من المتجر (صورة) نعرضها، لو لأ نعرض الذهبي */
  if (frameUrl && (frameUrl.startsWith('http') || frameUrl.startsWith('/'))) {
    box.style.background = 'none';
    box.style.boxShadow  = 'none';
    /* صورة الفريم كـ pseudo-background خلف الصورة */
    box.style.backgroundImage = 'url(' + frameUrl + ')';
    box.style.backgroundSize  = 'cover';
  } else {
    /* fallback: الحلقة الذهبية */
    box.style.background  = 'conic-gradient(from 0deg, #FFD700, #FFF9C4, #FFA500, #FFD700)';
    box.style.boxShadow   = '0 0 12px rgba(255,200,0,0.55)';
  }

  var photo = userData && userData.photoURL ? userData.photoURL : '';
  mount.innerHTML = photo
    ? '<img src="' + photo.replace(/"/g, '&quot;') + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;" onerror="this.src=\'https://ui-avatars.com/api/?name=U&background=6366f1&color=fff\'" />'
    : '<div style="width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:20px;">😺</div>';
}
```

---

## 🔔 إرسال إشعار

```javascript
notificationsCollection.add({
    toUserId: targetUid,
    fromUid:  senderUid,
    type:     'gift',       // gift | system | family | ...
    message:  'النص',
    timestamp: TS(),
    read: false
});
```

---

## 🏅 إضافة مغلف أحمر (Red Packet)

```javascript
redPacketsCollection.add({
    senderId:  uid,
    senderName: displayName,
    amount:    totalAmount,
    maxClaims: 5,
    claims:    [],
    timestamp: TS(),
    expiresAt: firebase.firestore.Timestamp.fromMillis(Date.now() + 86400000)
});
```

---

## ⚠️ ملاحظات مهمة للمطور الجديد

1. **لا تستخدم `Set-Content` أو `Out-File` في PowerShell** مع الملفات — تخرب الـ UTF-8 العربي. استخدم دائماً:
   ```powershell
   $utf8 = New-Object System.Text.UTF8Encoding $false
   [System.IO.File]::WriteAllText($file, $content, $utf8)
   ```

2. **بدون JSX** — الكود يستخدم `React.createElement` مباشرة بدل JSX لأن لا Webpack.

3. **لا تدمج الملفات** — كل feature في ملف منفصل، تحميلهم متسلسل في `index.html`.

4. **Firestore Rules** — أي collection جديد يحتاج rule في `firebase.txt` ثم نشر في Firebase Console.

5. **أي لعبة جديدة** تكتب في:
   - `src/features/lucky-games/MyGame.js`
   - `src/features/lucky-games/my-game.css`
   - وتُضاف في `LuckyGamesHub.js`
