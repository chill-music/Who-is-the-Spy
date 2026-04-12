(function () {
  var { useState, useEffect, useMemo, useRef } = React;

  // ── Helpers ──────────────────────────────────────────────────────────────
  var fmtNum = (n) => {
    if (n === undefined || n === null) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  };

  // ─────────────────────────────────────────────────────────────────────────
  var FinancialLogSection = ({ lang, onNotification, currentUser }) => {
    var [searchTerm, setSearchTerm] = useState('');
    var [searching, setSearching] = useState(false);
    var [users, setUsers] = useState([]);
    var [loadingUsers, setLoadingUsers] = useState(true);
    var [processing, setProcessing] = useState(false);
    var [expandedUser, setExpandedUser] = useState(null); // UID of user whose logs are visible
    var [userLogs, setUserLogs] = useState({}); // { uid: [logs] }

    // Custom Adjustment Modal State
    var [adjModal, setAdjModal] = useState(null); // { user, type: 'add'|'sub' }
    var [adjAmount, setAdjAmount] = useState('1000');
    var [adjReason, setAdjReason] = useState('Admin Panel Adjustment');

    var isOwner = currentUser?.uid === window.OWNER_UID;

    // ── Fetch Users (Real-time Dashboard) ───────────────────────────────────
    useEffect(() => {
      // Fetch top 50 users by currency to show a "Financial Leaderboard" style dashboard
      var unsub = usersCollection.orderBy('currency', 'desc').limit(50).onSnapshot((snap) => {
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoadingUsers(false);
      }, (err) => {
        console.error('[Financial] users snapshot error:', err);
        setLoadingUsers(false);
      });
      return unsub;
    }, []);

    // ── Search User ────────────────────────────────────────────────────────
    var handleSearch = async (e) => {
      if (e) e.preventDefault();
      if (!searchTerm.trim()) return;
      setSearching(true);
      try {
        var found = await window.searchUser(searchTerm);
        if (found) {
          // Check if already in the list
          var inList = users.find(u => u.id === found.id);
          if (inList) {
            setExpandedUser(found.id);
            // Scroll logic could be added here if needed
          } else {
            // Add to top of local list so owner can manage them
            setUsers(prev => [found, ...prev.filter(u => u.id !== found.id)]);
            setExpandedUser(found.id);
          }
          if (window.showToast) window.showToast('✨ ' + (lang === 'ar' ? 'تم العثور على المستخدم' : 'User found'));
          else if (onNotification) onNotification('✨ ' + (lang === 'ar' ? 'تم العثور على المستخدم' : 'User found'));
        } else {
          if (window.showToast) window.showToast('❌ ' + (lang === 'ar' ? 'لم يتم العثور على المستخدم' : 'User not found'));
          else if (onNotification) onNotification('❌ ' + (lang === 'ar' ? 'لم يتم العثور على المستخدم' : 'User not found'));
        }
      } catch (err) {
        console.error('[Financial] Search failed:', err);
      }
      setSearching(false);
    };

    // ── Handle Balance Adjustment ──────────────────────────────────────────
    var handleAdjustBalance = async (targetUser, amount, reason) => {
      if (!isOwner || processing) return;
      var num = parseInt(amount);
      if (isNaN(num) || num === 0) return;

      setProcessing(true);
      try {
        var userRef = usersCollection.doc(targetUser.id);
        
        await db.runTransaction(async (transaction) => {
          var freshDoc = await transaction.get(userRef);
          if (!freshDoc.exists) throw new Error('User not found');
          
          var currentVal = freshDoc.data().currency || 0;
          var newVal = currentVal + num;
          if (newVal < 0) newVal = 0; // Prevent negative balance

          // Sync both currency and gold fields for database consistency
          transaction.update(userRef, { 
            currency: newVal, 
            gold: newVal,
            lastUpdated: TS() 
          });

          var logRef = goldLogCollection.doc();
          transaction.set(logRef, {
            userId: targetUser.id,
            userName: freshDoc.data().displayName || 'Unknown',
            type: 'admin_adjustment',
            amount: num,
            reason: reason || 'Admin Panel Adjustment',
            adminId: currentUser.uid,
            timestamp: TS()
          });
        });

        if (window.showToast) window.showToast('✅ ' + (lang === 'ar' ? 'تم تحديث الرصيد' : 'Balance updated'));
        else if (onNotification) onNotification('✅ ' + (lang === 'ar' ? 'تم تحديث الرصيد' : 'Balance updated'));
      } catch (e) {
        if (window.showToast) window.showToast('❌ Error: ' + e.message);
        else if (onNotification) onNotification('❌ Error: ' + e.message);
      }
      setProcessing(false);
    };

    // ── Fetch User Specific Logs ───────────────────────────────────────────
    var toggleUserLogs = async (uid) => {
      if (expandedUser === uid) {
        setExpandedUser(null);
        return;
      }
      setExpandedUser(uid);
      if (userLogs[uid]) return; // Already loaded

      try {
        var snap = await goldLogCollection
          .where('userId', '==', uid)
          .limit(20)
          .get();
        var fetchedLogs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort in memory by timestamp descending
        fetchedLogs.sort((a, b) => {
          var tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp || 0);
          var tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp || 0);
          return tB - tA;
        });
        setUserLogs(prev => ({ ...prev, [uid]: fetchedLogs.slice(0, 10) }));
      } catch (e) {
        console.error('[Financial] Error fetching user logs:', e);
      }
    };

    // ── Render User Row ────────────────────────────────────────────────────
    var renderUserRow = (u) => {
      var isExpanded = expandedUser === u.id;
      var logs = userLogs[u.id] || [];
      var balance = u.currency || u.gold || 0;

      return React.createElement('div', { 
        key: u.id, 
        className: 'financial-user-card',
        style: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', marginBottom: '10px', overflow: 'hidden', transition: 'all 0.2s' } 
      },
        /* User Header Info */
        React.createElement('div', { 
          style: { padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
          onClick: () => toggleUserLogs(u.id)
        },
          /* Avatar Container */
          React.createElement('div', { 
            style: { position: 'relative', flexShrink: 0 },
            onClick: (e) => { 
              e.stopPropagation(); 
              // Open Mini Profile via prop if available
              if (onOpenProfile) onOpenProfile(u.id);
              else {
                if (window._setTargetProfileUID) window._setTargetProfileUID(u.id);
                if (window._setShowUserProfile) window._setShowUserProfile(true);
              }
            } 
          },
            React.createElement(window.AvatarWithFrameV11 || window.AvatarWithFrame || 'div', {
              photoURL: u.photoURL,
              equipped: u.equipped,
              size: 'sm',
              lang: lang
            })
          ),
          /* Name & ID */
          React.createElement('div', { style: { flex: 1, minWidth: 0 } },
            React.createElement('div', { style: { fontSize: '13px', fontWeight: 800, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' } }, 
              u.displayName,
              u.role === 'owner' && React.createElement('span', { title: 'Owner' }, '👑')
            ),
            React.createElement('div', { style: { fontSize: '10px', color: '#64748b' } }, 'ID: ', u.customId || u.id.slice(0, 8))
          ),
          /* Balance */
          React.createElement('div', { style: { textAlign: 'right', flexShrink: 0 } },
            React.createElement('div', { style: { fontSize: '14px', fontWeight: 900, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' } }, 
              '💰', fmtNum(balance)
            ),
            React.createElement('div', { style: { fontSize: '9px', color: '#3b82f6', marginTop: '2px', fontWeight: 700 } }, 
              (lang === 'ar' ? 'سجل العمليات' : 'Trans Log'), ' ', isExpanded ? '▴' : '▾'
            )
          ),
          /* Owner Quick Controls */
          isOwner && React.createElement('div', { 
            style: { display: 'flex', gap: '6px', marginLeft: '10px', flexShrink: 0 }, 
            onClick: (e) => e.stopPropagation() 
          },
            React.createElement('button', { 
              title: lang === 'ar' ? 'إضافة رصيد' : 'Add Balance',
              onClick: () => {
                setAdjModal({ user: u, type: 'add' });
                setAdjAmount('1000');
                setAdjReason(lang === 'ar' ? 'تعديل إداري - إضافة' : 'Admin Adjustment - Add');
              },
              style: { width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } 
            }, '+'),
            React.createElement('button', { 
              title: lang === 'ar' ? 'خصم رصيد' : 'Subtract Balance',
              onClick: () => {
                setAdjModal({ user: u, type: 'sub' });
                setAdjAmount('1000');
                setAdjReason(lang === 'ar' ? 'تعديل إداري - خصم' : 'Admin Adjustment - Subtract');
              },
              style: { width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } 
            }, '-')
          )
        ),

        /* Collapsible Logs Section */
        isExpanded && React.createElement('div', { 
          style: { background: 'rgba(0,0,0,0.25)', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' } 
        },
          React.createElement('div', { style: { fontSize: '10px', fontWeight: 800, color: '#3b82f6', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' } }, 
            lang === 'ar' ? '📜 آخر العمليات المالية' : '📜 Recent Transactions'
          ),
          logs.length === 0 ? 
            React.createElement('div', { style: { fontSize: '11px', color: '#4b5563', textAlign: 'center', padding: '15px' } }, 
              lang === 'ar' ? 'لا توجد عمليات مسجلة لهذا المستخدم' : 'No transaction records found for this user'
            ) :
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
              logs.map(log => React.createElement('div', { 
                key: log.id, 
                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' } 
              },
                React.createElement('div', { style: { minWidth: 0, flex: 1 } },
                  React.createElement('div', { style: { fontWeight: 700, color: '#f1f5f9', marginBottom: '2px' } }, log.reason || (lang === 'ar' ? 'عملية نظام' : 'System Operation')),
                  React.createElement('div', { style: { fontSize: '9px', color: '#64748b' } }, 
                    log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US') : '—'
                  )
                ),
                React.createElement('div', { style: { textAlign: 'right' } },
                  React.createElement('div', { style: { fontWeight: 900, fontSize: '12px', color: log.amount >= 0 ? '#10b981' : '#ef4444' } },
                    log.amount >= 0 ? '+' : '', log.amount.toLocaleString()
                  ),
                  React.createElement('div', { style: { fontSize: '8px', color: '#475569' } }, 
                    log.type === 'admin_adjustment' ? (lang === 'ar' ? 'تعديل إداري' : 'Admin Adj') : ''
                  )
                )
              ))
            )
        )
      );
    };

    // ── Main Render ────────────────────────────────────────────────────────
    return React.createElement('div', { className: 'financial-section-root' },
      /* Header with Icon */
      React.createElement('div', { style: { fontSize: '15px', fontWeight: 900, color: '#f59e0b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' } }, 
        React.createElement('span', { style: { fontSize: '20px' } }, '💰'), 
        lang === 'ar' ? 'إدارة الثروات والعمليات المالية' : 'Wealth & Financial Management'
      ),

      /* Search Bar */
      React.createElement('div', { style: { marginBottom: '24px' } },
        React.createElement('form', { 
          onSubmit: handleSearch, 
          style: { display: 'flex', gap: '10px' } 
        },
          React.createElement('div', { style: { position: 'relative', flex: 1 } },
            React.createElement('input', { 
              className: 'input-dark', 
              style: { width: '100%', padding: '14px 16px', fontSize: '13px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', boxSizing: 'border-box' },
              placeholder: lang === 'ar' ? 'ابحث بـ UID أو ID المخصص أو الاسم...' : 'Search by UID / Custom ID / Name...',
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value)
            }),
            searching && React.createElement('div', { style: { position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' } }, '⏳')
          ),
          React.createElement('button', { 
            type: 'submit', 
            disabled: searching || !searchTerm.trim(), 
            className: 'btn-neon', 
            style: { padding: '0 28px', borderRadius: '14px', fontWeight: 800, fontSize: '13px', whiteSpace: 'nowrap' } 
          }, lang === 'ar' ? 'بحث' : 'Search')
        )
      ),

      /* User Dashboard Container */
      React.createElement('div', { 
        style: { background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)' } 
      },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
            React.createElement('span', { style: { color: '#3b82f6' } }, '📊'),
            React.createElement('div', { style: { fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' } }, 
              lang === 'ar' ? 'قائمة مراقبة الأرصدة' : 'Balance Monitoring List'
            )
          ),
          React.createElement('div', { style: { fontSize: '10px', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 } }, 
            lang === 'ar' ? '🔴 بث حي للمعلومات' : '🔴 Live Data Feed'
          )
        ),

        loadingUsers ? 
          React.createElement('div', { style: { textAlign: 'center', padding: '60px', color: '#4b5563', fontSize: '13px' } }, 
            React.createElement('div', { className: 'loading-spinner' }, '⏳'),
            React.createElement('div', { style: { marginTop: '10px' } }, lang === 'ar' ? 'جاري تحميل البيانات...' : 'Fetching financial records...')
          ) :
          users.length === 0 ?
          React.createElement('div', { style: { textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '12px' } },
            lang === 'ar' ? 'لا يوجد مستخدمون حالياً' : 'No users found in database'
          ) :
          React.createElement('div', { className: 'financial-user-list-container', style: { width: '100%' } },
            users.map(u => renderUserRow(u))
          )
      ),

      /* Mobile Support for search results scroll */
      React.createElement('style', null, `
        .financial-user-card:hover { background: rgba(255,255,255,0.04) !important; transform: translateX(4px); }
        @media (max-width: 480px) {
          .financial-user-card { margin-left: 0 !important; margin-right: 0 !important; border-radius: 12px !important; }
        }
        .adj-modal-overlay {
          position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); animation: modalIn 0.3s ease-out;
        }
        .adj-modal-content {
          width: 90%; max-width: 400px; background: #0f172a; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);
          padding: 30px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `),

      /* ── Custom Adjustment Modal ─────────────────────────────────────── */
      adjModal && React.createElement('div', { className: 'adj-modal-overlay', onClick: () => setAdjModal(null) },
        React.createElement('div', { className: 'adj-modal-content', onClick: (e) => e.stopPropagation() },
          React.createElement('div', { style: { textAlign: 'center', marginBottom: '20px' } },
            React.createElement('div', { style: { fontSize: '40px', marginBottom: '10px' } }, adjModal.type === 'add' ? '💰' : '💸'),
            React.createElement('div', { style: { fontSize: '18px', fontWeight: 900, color: '#fff' } }, 
              lang === 'ar' ? (adjModal.type === 'add' ? 'إضافة رصيد' : 'خصم رصيد') : (adjModal.type === 'add' ? 'Add Balance' : 'Subtract Balance')
            ),
            React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginTop: '4px' } }, 
              lang === 'ar' ? 'للمستخدم: ' : 'For user: ', 
              React.createElement('span', { style: { color: '#3b82f6', fontWeight: 700 } }, adjModal.user.displayName)
            )
          ),

          /* Inputs */
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' } },
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 700 } }, 
                lang === 'ar' ? 'المبلغ:' : 'Amount:'
              ),
              React.createElement('input', {
                type: 'number',
                className: 'input-dark',
                style: { width: '100%', padding: '12px', boxSizing: 'border-box', fontSize: '15px', fontWeight: 800, color: '#f59e0b' },
                value: adjAmount,
                onChange: (e) => setAdjAmount(e.target.value),
                autoFocus: true
              })
            ),
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 700 } }, 
                lang === 'ar' ? 'السبب:' : 'Reason:'
              ),
              React.createElement('input', {
                className: 'input-dark',
                style: { width: '100%', padding: '12px', boxSizing: 'border-box', fontSize: '13px' },
                value: adjReason,
                onChange: (e) => setAdjReason(e.target.value)
              })
            )
          ),

          /* Buttons */
          React.createElement('div', { style: { display: 'flex', gap: '10px' } },
            React.createElement('button', {
              className: 'btn-neon',
              disabled: processing || !adjAmount,
              style: { flex: 1, padding: '14px', borderRadius: '12px', background: adjModal.type === 'add' ? '#10b981' : '#ef4444', fontWeight: 800 },
              onClick: () => {
                var amtVal = parseFloat(adjAmount);
                if (isNaN(amtVal)) return;
                var finalAmount = adjModal.type === 'add' ? amtVal : -amtVal;
                handleAdjustBalance(adjModal.user, finalAmount, adjReason);
                setAdjModal(null);
              }
            }, processing ? '⏳' : (
              lang === 'ar' 
                ? (adjModal.type === 'add' ? 'إيداع الأموال' : 'سحب الأموال')
                : (adjModal.type === 'add' ? 'Deposit' : 'Withdraw')
            )),
            React.createElement('button', {
              style: { padding: '14px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' },
              onClick: () => setAdjModal(null)
            }, lang === 'ar' ? 'إلغاء' : 'Cancel')
          )
        )
      )
    );
  };

  window.FinancialLogSection = FinancialLogSection;
})();
