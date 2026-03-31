(function () {
  var { useState, useEffect, useMemo, useRef } = React;

  var FinancialLogSection = ({ lang }) => {
    var [goldLogs, setGoldLogs] = useState([]);
    var [loading, setLoading] = useState(true);
    var [targetUID, setTargetUID] = useState('');
    var [amount, setAmount] = useState('');
    var [reason, setReason] = useState('');
    var [processing, setProcessing] = useState(false);

    useEffect(() => {
      var unsub = goldLogCollection.orderBy('timestamp', 'desc').limit(50).onSnapshot((snap) => {
        setGoldLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }, () => setLoading(false));
      return unsub;
    }, []);

    var handleSendGold = async () => {
      if (!targetUID || !amount || processing) return;
      setProcessing(true);
      try {
        var num = parseInt(amount);
        var userRef = usersCollection.doc(targetUID.trim());
        var userDoc = await userRef.get();
        if (!userDoc.exists) {
          if (window.showToast) window.showToast('❌ User not found');
          else console.warn('[FinancialLog] User not found:', targetUID);
          setProcessing(false);
          return;
        }

        await db.runTransaction(async (transaction) => {
          var freshDoc = await transaction.get(userRef);
          var currentGold = freshDoc.data().gold || 0;
          transaction.update(userRef, { gold: currentGold + num });

          var logRef = goldLogCollection.doc();
          transaction.set(logRef, {
            userId: targetUID.trim(),
            userName: freshDoc.data().displayName,
            type: 'admin_adjustment',
            amount: num,
            reason: reason.trim() || 'Admin Adjustment',
            timestamp: TS()
          });
        });

        onNotification('✅ Gold updated successfully');
        setTargetUID('');setAmount('');setReason('');
      } catch (e) {onNotification('❌ Error');}
      setProcessing(false);
    };

    return (/*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginBottom: '16px' } }, "\uD83D\uDCB0 ",
      lang === 'ar' ? 'السجل المالي والهدايا' : 'Financial Log & Gold'
      ), /*#__PURE__*/

      React.createElement("div", { style: { background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '20px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', fontWeight: 700, color: '#f59e0b', marginBottom: '10px' } }, "\uD83C\uDF81 ", lang === 'ar' ? 'إرسال ذهب لمستخدم' : 'Send Gold to User'), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '8px', marginBottom: '8px' } }, /*#__PURE__*/
      React.createElement("input", { className: "input-dark", style: { flex: 1.5, padding: '8px', fontSize: '11px' }, placeholder: "Target UID", value: targetUID, onChange: (e) => setTargetUID(e.target.value) }), /*#__PURE__*/
      React.createElement("input", { className: "input-dark", style: { flex: 1, padding: '8px', fontSize: '11px' }, placeholder: "Amount", type: "number", value: amount, onChange: (e) => setAmount(e.target.value) })
      ), /*#__PURE__*/
      React.createElement("input", { className: "input-dark", style: { width: '100%', padding: '8px', fontSize: '11px', marginBottom: '10px' }, placeholder: "Reason (Optional)", value: reason, onChange: (e) => setReason(e.target.value) }), /*#__PURE__*/
      React.createElement("button", { onClick: handleSendGold, disabled: processing || !targetUID || !amount,
        className: "btn-neon", style: { width: '100%', padding: '10px', fontSize: '12px', fontWeight: 700 } },
      processing ? '⏳' : `💰 ${lang === 'ar' ? 'تعديل الرصيد' : 'Update Balance'}`
      )
      ),

      loading ? /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '20px' } }, "\u23F3") : /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '40vh', overflowY: 'auto' } },
      goldLogs.map((log) => /*#__PURE__*/
      React.createElement("div", { key: log.id, style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', fontWeight: 700 } }, log.userName), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: '#6b7280' } }, log.reason)
      ), /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'right' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '12px', fontWeight: 800, color: log.amount >= 0 ? '#10b981' : '#ef4444' } }, log.amount >= 0 ? '+' : '', log.amount), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '9px', color: '#4b5563' } }, log.timestamp?.toDate?.() ? log.timestamp.toDate().toLocaleString() : '')
      )
      )
      )
      )

      ));

  };

  window.FinancialLogSection = FinancialLogSection;
})();