/* ═══════════════════════════════════════════════════════════════════
   PRO SPY — Service Worker v6
   Split caching strategy:
   - CRITICAL: Installs fast (core files only) → allows PWA install
   - LAZY: Cached in background after SW activates (everything else)
   This fixes Samsung PWA "installed but no icon" issue caused by
   SW install timing out while caching 100+ files.
═══════════════════════════════════════════════════════════════════ */

var CACHE_V       = 'pro-spy-v11';
var CACHE_LAZY_V  = 'pro-spy-lazy-v11';

/* ── Critical files (must cache on install) ───────────────────── */
var CRITICAL = [
  './',
  './index.html',
  './style.css',
  './vip.css',
  './manifest.json',
  './icos/icon-192.png',
  './icos/icon-512.png',
  './icos/icon-144.png',
  './src/01-config.js',
  './src/02-audio.js',
  './src/05-translations.js',
  './src/10-app.js',
  './src/16-main.js',
  './src/app/useAuthState.js',
  './src/app/useAppUIState.js',
];

/* ── Non-critical files (cached lazily after activation) ─────── */
var LAZY = [
  './src/features/profile/ProfileHelpers.js',
  './src/features/pwa/PWAHandler.js',
  './src/03-data-funpass.js',
  './src/04-data-game.js',
  './src/06-components-base.js',
  './src/07-components-gifts.js',
  './src/17-vip.js',
  './src/08-components-shop.js',
  './src/09-components-user.js',
  './src/app/utils/bgAnimation.js',
  './src/app/usePresence.js',
  './src/app/useNotifications.js',
  './src/app/useRoom.js',
  './src/app/useLeaderboards.js',
  './src/app/useSocial.js',
  './src/app/useGameAutomation.js',
  './src/app/useBots.js',
  './src/app/useBanningLogic.js',
  './src/app/useLoginRewards.js',
  './src/app/useOnboarding.js',
  './src/app/hooks/useGameActions.js',
  './src/app/hooks/useUserListeners.js',
  './src/features/app/components/GlobalModals.js',
  './src/features/app/components/BannedScreen.js',
  './src/features/app/components/LobbyView.js',
  './src/features/app/components/RankingView.js',
  './src/features/app/components/RoomView.js',
  './src/11-modal-selfchat.js',
  './src/12-modal-funpass.js',
  './src/13-modal-chat.js',
  './src/components/modals/LoginRewards.js',
  './src/components/modals/BrowseRoomsModal.js',
  './src/components/modals/TutorialModal.js',
  './src/components/modals/SettingsModal.js',
  './src/components/modals/SupportTicketSection.js',
  './src/components/lobby/LobbyPublicChatBox.js',
  './src/components/modals/VIPCenterModal.js',
  './src/components/modals/HelpCenterModal.js',
  './src/components/modals/PublicChatModal.js',
  './src/features/profile/ProfileFamilySignBadge.js',
  './src/features/profile/WinRateCircle.js',
  './src/features/profile/GiftWallDetailModal.js',
  './src/features/profile/GiftWall.js',
  './src/features/profile/ProfileStats.js',
  './src/features/profile/ProfileTabs.js',
  './src/features/profile/AchievementsDisplay.js',
  './src/features/profile/ProfileEffects.js',
  './src/features/profile/ProfileIdentityElements.js',
  './src/features/profile/MomentsSystem.js',
  './src/features/profile/ProfileFriendsSection.js',
  './src/features/profile/ProfileAdmin.js',
  './src/features/profile/ProfileHeader.js',
  './src/features/profile/ProfileIdentity.js',
  './src/features/profile/ProfileV11.js',
  './src/features/onboarding/OnboardingFlow.js',
  './src/features/chat/ChatManager.js',
  './src/features/groups/GroupConfig.js',
  './src/features/groups/GroupsList.js',
  './src/features/groups/GroupsSection.js',
  './src/features/groups/GroupChatModal.js',
  './src/features/groups/GroupDetailsModal.js',
  './src/features/tasks/DailyTasksPanel.js',
  './src/features/room/RoomState.js',
  './src/features/bff/BFFService.js',
  './src/features/bff/BFFModal.js',
  './src/features/bff/BFFCardModal.js',
  './src/features/bff/BFFProfileListModal.js',
  './src/features/bff/BFFRequestItem.js',
  './src/features/bff/BFFStripProfile.js',
  './src/features/bff/BotChatModal.js',
  './src/features/couples/CoupleConfig.js',
  './src/features/couples/CoupleService.js',
  './src/features/couples/CoupleUIComponents.js',
  './src/features/couples/CoupleCardModal.js',
  './src/features/couples/IncomingProposalModal.js',
  './src/features/couples/ProposalModal.js',
  './src/features/couples/RingsShopSection.js',
  './src/features/couples/WeddingHallModal.js',
  './src/features/family/FamilyConstants.js',
  './src/features/family/FamilyUtils.js',
  './src/features/family/FamilyService.js',
  './src/features/family/components/FamilyRoleBadge.js',
  './src/features/family/components/FamilyShared.js',
  './src/features/family/components/RedPacketCard.js',
  './src/features/family/components/FamilyChatModal.js',
  './src/features/family/components/FamilyTreasury.js',
  './src/features/family/components/FamilyGacha.js',
  './src/features/family/components/FamilyMembers.js',
  './src/features/family/components/FamilyProfile.js',
  './src/features/family/components/FamilyTasks.js',
  './src/features/family/components/FamilyShop.js',
  './src/features/family/components/FamilyManagement.js',
  './src/features/family/components/FamilyRanking.js',
  './src/features/family/components/FamilyRankingInline.js',
  './src/features/family/components/FamilyNews.js',
  './src/features/family/components/FamilySearch.js',
  './src/features/family/components/FriendsMomentsModal.js',
  './src/features/family/components/FamilyMemberQuickCard.js',
  './src/features/family/components/FamilySignBadge.js',
  './src/components/admin/AdminUtils.js',
  './src/components/admin/AdminStatCard.js',
  './src/components/admin/AdminOverview.js',
  './src/components/admin/StaffManagementSection.js',
  './src/components/admin/UserManagementSection.js',
  './src/components/admin/BroadcastSection.js',
  './src/components/admin/ActivityLogSection.js',
  './src/components/admin/BanPanelInline.js',
  './src/components/admin/ReportsSection.js',
  './src/components/admin/TicketsSection.js',
  './src/components/admin/MomentsModerationSection.js',
  './src/components/admin/FinancialLogSection.js',
  './src/components/admin/FAQManagementSection.js',
  './src/components/admin/FeedbackInboxSection.js',
  './src/components/admin/FakeProfilesSection.js',
  './src/18-admin-panel.js',
  './src/19-family.js',
  './src/20-couples.js',
  './src/21-bff.js',
  './src/features/lucky-games/lucky-fruit.css',
  './src/features/lucky-games/LuckyFruitGame.js',
  './src/features/lucky-games/Super777Game.js',
  './src/features/lucky-games/LuckyGamesHub.js',
  './src/features/lucky-games/GreedyCatGame.js',
  './src/features/lucky-games/greedy-cat.css',
  './src/features/lucky-games/SoccerStarGame.js',
  './src/features/lucky-games/soccer-star.css',
  './src/features/lucky-games/super777.css',
  './src/app/AppHooks.js',
  './src/features/game/GameLogic.js',
  './icos/icon-48.png',
  './icos/icon-72.png',
  './icos/icon-96.png',
];

/* ── INSTALL: cache only critical files (fast) ──────────────── */
self.addEventListener('install', function(event) {
  /* Wait for the next natural page navigation to activate the new SW */
  event.waitUntil(
    caches.open(CACHE_V).then(function(cache) {
      return Promise.allSettled(
        CRITICAL.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('[SW] Critical cache miss:', url, err);
          });
        })
      );
    })
  );
});

/* ── ACTIVATE: take control + lazy-cache non-critical ────────── */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    Promise.all([
      /* 1. (clients.claim removed - wait for natural navigation) */

      /* 2. Delete old cache versions */
      caches.keys().then(function(keys) {
        return Promise.all(
          keys.filter(function(k) {
            return k !== CACHE_V && k !== CACHE_LAZY_V;
          }).map(function(k) { return caches.delete(k); })
        );
      }),

      /* 3. Lazy-cache non-critical files in background */
      caches.open(CACHE_LAZY_V).then(function(cache) {
        return Promise.allSettled(
          LAZY.map(function(url) {
            return cache.add(url).catch(function() {});
          })
        );
      })
    ])
  );
});

/* ── FETCH: serve from cache, fallback to network ────────────── */
self.addEventListener('fetch', function(event) {
  /* Skip non-GET and cross-origin requests */
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  var isHtml = event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html');

  if (isHtml) {
    /* ── NETWORK-FIRST FOR HTML (ALWAYS GET LATEST VERSION) ── */
    var htmlUrl = new URL(event.request.url);
    htmlUrl.searchParams.set('cv', CACHE_V); /* Ultimate Cache Buster */
    
    event.respondWith(
      fetch(htmlUrl.toString(), { cache: 'no-store' }).then(function(response) {
        var toCache = response.clone();
        caches.open(CACHE_V).then(function(cache) {
          cache.put(event.request, toCache);
        });
        return response;
      }).catch(function() {
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  /* ── CACHE-FIRST FOR ASSETS (CSS, JS, IMAGES) ── */
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      
      /* Not in cache — fetch from network and store in lazy cache */
      /* ⚡ Superweapon cache-buster: force network to ignore Chrome's disk cache */
      var assetUrl = new URL(event.request.url);
      assetUrl.searchParams.set('cv', CACHE_V);
      
      return fetch(assetUrl.toString(), { cache: 'no-store' }).then(function(response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var toCache = response.clone();
        caches.open(CACHE_LAZY_V).then(function(cache) {
          cache.put(event.request, toCache);
        });
        return response;
      }).catch(function() {
        // Fallback for failed asset requests (ignore)
      });
    })
  );
});
