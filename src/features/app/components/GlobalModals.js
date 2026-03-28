(function() {
    /**
     * GlobalModals — Container for various app-level modals.
     */
    window.GlobalModals = function(props) {
        var {
            lang, t, currentUserData, user,
            showSetupModal, setShowSetupModal,
            showMyAccount, setShowMyAccount,
            showShop, setShowShop,
            showInventory, setShowInventory,
            showSettings, setShowSettings,
            showFamilyModal, setShowFamilyModal,
            viewFamilyId, setViewFamilyId,
            showUserProfile, setShowUserProfile,
            targetProfileUID, setTargetProfileUID,
            handleCreateGame, setNotification, openProfile
        } = props;

        return (
            <div className="global-modals-container relative z-[9999]">
                {/* 🛠️ Setup Room Modal */}
                {showSetupModal && (
                    <window.SetupRoomModal
                        lang={lang}
                        t={t}
                        onClose={() => setShowSetupModal(false)}
                        onSubmit={handleCreateGame}
                        requireVip={(type) => { console.log('VIP required for', type); }}
                    />
                )}

                {/* 👤 My Account Modal */}
                {showMyAccount && (
                    <window.MyAccountModal
                        userData={currentUserData}
                        user={user}
                        lang={lang}
                        t={t}
                        onClose={() => setShowMyAccount(false)}
                        onUpdate={(updated) => { if(window.setUserData) window.setUserData(updated); }}
                        onOpenInventory={() => { setShowMyAccount(false); setShowInventory(true); }}
                    />
                )}

                {/* 🛒 Shop Modal */}
                {showShop && (
                    <window.ShopModal
                        userData={currentUserData}
                        user={user}
                        lang={lang}
                        t={t}
                        onClose={() => setShowShop(false)}
                        onPurchaseSuccess={() => { if(setNotification) setNotification({ type:'success', message: lang==='ar'?'تم الشراء بنجاح!':'Purchase Successful!' }); }}
                    />
                )}

                {/* 📦 Inventory Modal */}
                {showInventory && (
                    <window.InventoryModal
                        userData={currentUserData}
                        user={user}
                        lang={lang}
                        t={t}
                        onClose={() => setShowInventory(false)}
                        onEquipSuccess={() => {}}
                    />
                )}

                {/* 🏠 Family Modal */}
                {showFamilyModal && (
                    <window.FamilyModal
                        familyId={viewFamilyId}
                        myUserData={currentUserData}
                        user={user}
                        lang={lang}
                        t={t}
                        onClose={() => { setShowFamilyModal(false); if(setViewFamilyId) setViewFamilyId(null); }}
                        onOpenProfile={openProfile}
                    />
                )}

                {/* 🔍 User Profile Modal */}
                {showUserProfile && targetProfileUID && (
                    <window.UserProfileModal
                        uid={targetProfileUID}
                        myUserData={currentUserData}
                        myUser={user}
                        lang={lang}
                        t={t}
                        onClose={() => { setShowUserProfile(false); if(setTargetProfileUID) setTargetProfileUID(null); }}
                    />
                )}

                {/* 💬 Family Chat Modal */}
                {props.showFamilyChat && window.FamilyChatModal && (
                    <window.FamilyChatModal
                        show={true}
                        onClose={() => props.setShowFamilyChat(false)}
                        currentUID={user?.uid}
                        currentUserData={currentUserData}
                        lang={lang}
                        userData={currentUserData}
                        onNotification={(msg) => setNotification({ type:'info', message: msg })}
                        onOpenProfile={openProfile}
                        onOpenFamily={() => { props.setShowFamilyChat(false); setShowFamilyModal(true); }}
                        familyId={currentUserData?.familyId}
                    />
                )}
            </div>
        );
    };
})();
