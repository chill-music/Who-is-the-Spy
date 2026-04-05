(function () {
  var { useState, useRef } = React;

  // Max image size for inline storage (500 KB)
  var MAX_IMAGE_BYTES = 500 * 1024;

  var BroadcastSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    var [msg,        setMsg]        = useState('');
    var [msgAr,      setMsgAr]      = useState('');
    var [sending,    setSending]    = useState(false);
    var [sent,       setSent]       = useState(0);
    // T023 — Image state
    var [imageFile,  setImageFile]  = useState(null);
    var [previewURL, setPreviewURL] = useState('');
    var [imageDataURL, setImageDataURL] = useState(''); // stored in Firestore if no Storage

    var fileInputRef = useRef(null);

    // ── Image selection (T023) ───────────────────────────────────────────────
    var handleImageSelect = (e) => {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      if (file.size > MAX_IMAGE_BYTES) {
        onNotification('⚠️ ' + (lang === 'ar' ? 'الصورة أكبر من 500 كيلوبايت' : 'Image must be < 500 KB'));
        e.target.value = '';
        return;
      }
      setImageFile(file);
      setPreviewURL(URL.createObjectURL(file));

      // T024 — Read as DataURL (no Firebase Storage configured — inline approach)
      var reader = new FileReader();
      reader.onload = function (ev) { setImageDataURL(ev.target.result); };
      reader.readAsDataURL(file);
    };

    var clearImage = () => {
      setImageFile(null);
      setPreviewURL('');
      setImageDataURL('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Broadcast (T025) ────────────────────────────────────────────────────
    var handleBroadcast = async () => {
      var text = lang === 'ar' ? (msgAr || msg) : (msg || msgAr);
      if (!text.trim() || !currentUser) return;
      setSending(true);
      var finalImageURL = imageDataURL || null;

      try {
        var usersSnap = await usersCollection.limit(500).get();
        var batch = db.batch();
        var count = 0;

        // T025 — Write to botChatsCollection as PRO SPY messages
        usersSnap.docs.forEach((doc) => {
          var ref = botChatsCollection.doc();
          batch.set(ref, {
            botId:      'pro_spy_bot',
            toUserId:   doc.id,
            message:    text,
            message_en: msg    || text,
            message_ar: msgAr  || text,
            fromName:   'PRO SPY',
            type:       'broadcast',
            imageURL:   finalImageURL,
            read:       false,
            timestamp:  TS()
          });
          count++;
        });

        await batch.commit();

        if (window.logStaffAction) {
          await window.logStaffAction(
            currentUser.uid, currentUserData?.displayName,
            'BROADCAST', null, null,
            'Sent to ' + count + ' users: ' + text.slice(0, 100),
            currentUserData?.role
          );
        }

        setSent(count);
        setMsg(''); setMsgAr('');
        clearImage();
        onNotification('✅ ' + (lang === 'ar' ? 'تم الإرسال لـ ' + count + ' مستخدم' : 'Sent to ' + count + ' users'));
      } catch (e) {
        onNotification('❌ Error: ' + e.message);
      }
      setSending(false);
    };

    var hasContent = msg.trim() || msgAr.trim();

    // ── Render ──────────────────────────────────────────────────────────────
    return (/*#__PURE__*/
      React.createElement('div', null,

      /* Header */
      React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginBottom: '16px' } },
        '📢 ', lang === 'ar' ? 'إشعار جماعي عبر PRO SPY' : 'Broadcast via PRO SPY Bot'
      ),

      React.createElement('div', { style: { background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' } },

        /* EN message */
        React.createElement('textarea', { className: 'input-dark', style: { width: '100%', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', minHeight: '70px', resize: 'vertical' },
          placeholder: 'Message (EN)',
          value: msg, onChange: (e) => setMsg(e.target.value) }),

        /* AR message */
        React.createElement('textarea', { className: 'input-dark', style: { width: '100%', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', minHeight: '70px', resize: 'vertical', direction: 'rtl' },
          placeholder: 'الرسالة (عربي)',
          value: msgAr, onChange: (e) => setMsgAr(e.target.value) }),

        /* T023 — Image attach row */
        React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },
          React.createElement('input', { ref: fileInputRef, type: 'file', accept: 'image/*', onChange: handleImageSelect, style: { display: 'none' } }),
          React.createElement('button', {
            type: 'button',
            onClick: () => fileInputRef.current && fileInputRef.current.click(),
            style: { padding: '7px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
              background: imageFile ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)',
              border: '1px solid ' + (imageFile ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.12)'),
              color: imageFile ? '#60a5fa' : '#9ca3af' }
          }, imageFile ? '🖼️ ' + imageFile.name.slice(0, 20) + (imageFile.name.length > 20 ? '…' : '') : '🖼️ ' + (lang === 'ar' ? 'إرفاق صورة' : 'Attach Image')),
          imageFile &&
          React.createElement('button', { onClick: clearImage, style: { padding: '7px 10px', borderRadius: '8px', fontSize: '11px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer' } }, '✕'),
          React.createElement('span', { style: { fontSize: '9px', color: '#6b7280' } }, lang === 'ar' ? '(أقل من 500 كيلوبايت)' : '(max 500 KB)')
        ),

        /* T026 — Live preview card */
        hasContent &&
        React.createElement('div', { style: { background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px' } },
          React.createElement('div', { style: { fontSize: '10px', color: '#6b7280', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' } },
            lang === 'ar' ? '👁️ معاينة' : '👁️ Preview'
          ),
          /* Bot header */
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
            React.createElement('div', { style: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 } }, '🕵️'),
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: '11px', fontWeight: 800, color: '#a855f7' } }, 'PRO SPY'),
              React.createElement('div', { style: { fontSize: '9px', color: '#6b7280' } }, lang === 'ar' ? 'رسالة جماعية' : 'Broadcast')
            )
          ),
          /* Image preview */
          previewURL &&
          React.createElement('img', { src: previewURL, alt: 'preview', style: { width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' } }),
          /* Message text */
          React.createElement('div', { style: { fontSize: '11px', color: '#d1d5db', lineHeight: 1.5 } },
            lang === 'ar' ? (msgAr || msg) : (msg || msgAr)
          )
        ),

        /* Send button */
        React.createElement('button', { onClick: handleBroadcast, disabled: sending || !hasContent,
          style: { width: '100%', padding: '9px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: hasContent ? 'pointer' : 'not-allowed',
            background: 'linear-gradient(135deg,rgba(245,158,11,0.3),rgba(217,119,6,0.2))',
            border: '1px solid rgba(245,158,11,0.5)', color: '#f59e0b', opacity: sending ? 0.5 : 1 }
        }, sending ? '⏳ ' + (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : '📢 ' + (lang === 'ar' ? 'إرسال للجميع' : 'Send to All')),

        sent > 0 &&
        React.createElement('div', { style: { fontSize: '11px', color: '#10b981', textAlign: 'center' } },
          '✅ ', lang === 'ar' ? 'تم الإرسال لـ ' + sent + ' مستخدم' : 'Sent to ' + sent + ' users'
        )
      )
    ));
  };

  window.BroadcastSection = BroadcastSection;
})();