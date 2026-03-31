var FamilyMemberQuickCard = ({ member, role, isMe, lang, onOpenProfile, onClose, onSendGift, currentUID }) => {
  if (!member) return null;
  var isSelf = member.uid === currentUID;
  return (/*#__PURE__*/
    React.createElement("div", { style: {
        position: 'absolute', inset: 0, zIndex: 10,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }, onClick: onClose }, /*#__PURE__*/
    React.createElement("div", { style: {
        background: 'linear-gradient(160deg,#0e0e22,#13122a)',
        border: '1px solid rgba(0,242,255,0.25)', borderRadius: '18px',
        padding: '20px', width: '240px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
        textAlign: 'center'
      }, onClick: (e) => e.stopPropagation() }, /*#__PURE__*/

    React.createElement("div", { style: { width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 10px', border: '2px solid rgba(0,242,255,0.35)' } },
    member.photo ? /*#__PURE__*/
    React.createElement("img", { src: member.photo, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/
    React.createElement("div", { style: { width: '100%', height: '100%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' } }, "\uD83D\uDE0E")

    ), /*#__PURE__*/

    React.createElement("div", { style: { fontSize: '14px', fontWeight: 800, color: 'white', marginBottom: '4px' } }, member.name),

    member.customId && /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', color: '#6b7280', marginBottom: '14px' } }, "\uD83E\uDEAA #",
    member.customId
    ),


    !isSelf && onSendGift && /*#__PURE__*/
    React.createElement("button", { onClick: () => {onClose();onSendGift(member);},
      style: { width: '100%', padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,140,0,0.15))', border: '1px solid rgba(255,215,0,0.4)', color: '#fbbf24', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' } }, "\uD83C\uDF81 ",
    lang === 'ar' ? 'أرسل هدية' : 'Send Gift'
    ),


    isSelf && /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', color: '#6b7280' } },
    lang === 'ar' ? 'هذا أنت' : 'This is you'
    )

    )
    ));

};

window.FamilyMemberQuickCard = FamilyMemberQuickCard;