var CACHE_NAME = 'pro-spy-v3';
var ASSETS = [
  './',
  './index.html',
  './style.css',
  './vip.css',
  './manifest.json',
  
  // Core Config & Drivers
  './src/01-config.js',
  './src/features/profile/ProfileHelpers.js',
  './src/features/pwa/PWAHandler.js',
  './src/02-audio.js',
  './src/03-data-funpass.js',
  './src/04-data-game.js',
  './src/05-translations.js',
  
  // UI Components & VIP
  './src/06-components-base.js',
  './src/07-components-gifts.js',
  './src/17-vip.js',
  './src/08-components-shop.js',
  './src/09-components-user.js',
  
  // App Logic & Hooks
  './src/app/useAuthState.js',
  './src/app/usePresence.js',
  './src/app/useNotifications.js',
  './src/app/useRoom.js',
  './src/app/useLeaderboards.js',
  './src/app/useSocial.js',
  './src/app/useGameAutomation.js',
  './src/app/useBots.js',
  './src/10-app.js',
  
  // Modals
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
  
  // Profile Feature
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
  
  // Family System
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
  
  // Admin & Other
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
  './src/16-main.js',
  
  // Icons
  './icos/icon-192.png',
  './icos/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use a more resilient caching strategy to avoid failing the whole SW on one missing file
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(err => {
            console.warn(`[SW] Failed to cache: ${url}`, err);
        }))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});
