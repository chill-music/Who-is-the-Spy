(function () {
  var { useState, useEffect, useMemo, useRef } = React;

  var FAQManagementSection = ({ lang, onNotification }) => {
    var [faqs, setFaqs] = useState([]);
    var [loading, setLoading] = useState(true);
    var [newQ, setNewQ] = useState({ q_en: '', a_en: '', q_ar: '', a_ar: '', category: 'general' });

    useEffect(() => {
      var unsub = helpFaqCollection.orderBy('category').onSnapshot((snap) => {
        setFaqs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
      return unsub;
    }, []);

    var handleAdd = async () => {
      if (!newQ.q_en || !newQ.a_en) return;
      try {
        await helpFaqCollection.add({ ...newQ, timestamp: TS() });
        setNewQ({ q_en: '', a_en: '', q_ar: '', a_ar: '', category: 'general' });
        onNotification('✅ FAQ Added');
      } catch (e) {onNotification('❌ Error');}
    };

    var deleteFAQ = async (id) => {
      if (!confirm('Delete this FAQ?')) return;
      try {
        await helpFaqCollection.doc(id).delete();
        onNotification('✅ Deleted');
      } catch (e) {onNotification('❌ Error');}
    };

    return (/*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#3b82f6', marginBottom: '16px' } }, "\u2753 ",
      lang === 'ar' ? 'إدارة الأسئلة الشائعة' : 'FAQ Management'
      ), /*#__PURE__*/

      React.createElement("div", { style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', marginBottom: '20px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', fontWeight: 700, color: '#3b82f6', marginBottom: '10px' } }, "\u2795 ", lang === 'ar' ? 'إضافة سؤال جديد' : 'Add New FAQ'), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '8px' } }, /*#__PURE__*/
      React.createElement("input", { className: "input-dark", style: { flex: 1, padding: '8px', fontSize: '11px' }, placeholder: "Question (EN)", value: newQ.q_en, onChange: (e) => setNewQ({ ...newQ, q_en: e.target.value }) }), /*#__PURE__*/
      React.createElement("input", { className: "input-dark", style: { flex: 1, padding: '8px', fontSize: '11px', textAlign: 'right' }, placeholder: "\u0627\u0644\u0633\u0624\u0627\u0644 (\u0639\u0631\u0628\u064A)", value: newQ.q_ar, onChange: (e) => setNewQ({ ...newQ, q_ar: e.target.value }) })
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '8px' } }, /*#__PURE__*/
      React.createElement("textarea", { className: "input-dark", style: { flex: 1, padding: '8px', fontSize: '11px', minHeight: '50px' }, placeholder: "Answer (EN)", value: newQ.a_en, onChange: (e) => setNewQ({ ...newQ, a_en: e.target.value }) }), /*#__PURE__*/
      React.createElement("textarea", { className: "input-dark", style: { flex: 1, padding: '8px', fontSize: '11px', textAlign: 'right', minHeight: '50px' }, placeholder: "\u0627\u0644\u0625\u062C\u0627\u0628\u0629 (\u0639\u0631\u0628\u064A)", value: newQ.a_ar, onChange: (e) => setNewQ({ ...newQ, a_ar: e.target.value }) })
      ), /*#__PURE__*/
      React.createElement("button", { onClick: handleAdd, className: "btn-neon", style: { padding: '10px', fontSize: '12px', fontWeight: 700 } },
      lang === 'ar' ? 'إضافة السؤال' : 'Add FAQ'
      )
      )
      ),

      loading ? /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '20px' } }, "\u23F3") : /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
      faqs.map((f) => /*#__PURE__*/
      React.createElement("div", { key: f.id, style: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', fontWeight: 700, color: '#3b82f6' } }, lang === 'ar' ? f.q_ar : f.q_en), /*#__PURE__*/
      React.createElement("button", { onClick: () => deleteFAQ(f.id), style: { padding: '2px 6px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' } }, "\uD83D\uDDD1\uFE0F")
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', lineHeight: 1.4 } }, lang === 'ar' ? f.a_ar : f.a_en)
      )
      )
      )

      ));

  };

  window.FAQManagementSection = FAQManagementSection;
})();