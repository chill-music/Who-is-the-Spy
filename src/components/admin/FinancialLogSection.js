(function() {
    const { useState, useEffect, useMemo, useRef } = React;

var FinancialLogSection = ({ lang }) => {
    const [goldLogs, setGoldLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [targetUID, setTargetUID] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const unsub = db.collection('gold_transactions').orderBy('timestamp', 'desc').limit(50).onSnapshot(snap => {
            setGoldLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, []);

    const handleSendGold = async () => {
        if (!targetUID || !amount || processing) return;
        setProcessing(true);
        try {
            const num = parseInt(amount);
            const userRef = usersCollection.doc(targetUID.trim());
            const userDoc = await userRef.get();
            if (!userDoc.exists) {
                alert('User not found');
                setProcessing(false);
                return;
            }

            await db.runTransaction(async (transaction) => {
                const freshDoc = await transaction.get(userRef);
                const currentGold = freshDoc.data().gold || 0;
                transaction.update(userRef, { gold: currentGold + num });
                
                const logRef = db.collection('gold_transactions').doc();
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
            setTargetUID(''); setAmount(''); setReason('');
        } catch(e) { onNotification('❌ Error'); }
        setProcessing(false);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#f59e0b', marginBottom:'16px' }}>
                💰 {lang==='ar'?'السجل المالي والهدايا':'Financial Log & Gold'}
            </div>
            
            <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', padding:'16px', marginBottom:'20px' }}>
                <div style={{ fontSize:'11px', fontWeight:700, color:'#f59e0b', marginBottom:'10px' }}>🎁 {lang==='ar'?'إرسال ذهب لمستخدم':'Send Gold to User'}</div>
                <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
                    <input className="input-dark" style={{ flex:1.5, padding:'8px', fontSize:'11px' }} placeholder="Target UID" value={targetUID} onChange={e=>setTargetUID(e.target.value)} />
                    <input className="input-dark" style={{ flex:1, padding:'8px', fontSize:'11px' }} placeholder="Amount" type="number" value={amount} onChange={e=>setAmount(e.target.value)} />
                </div>
                <input className="input-dark" style={{ width:'100%', padding:'8px', fontSize:'11px', marginBottom:'10px' }} placeholder="Reason (Optional)" value={reason} onChange={e=>setReason(e.target.value)} />
                <button onClick={handleSendGold} disabled={processing || !targetUID || !amount}
                    className="btn-neon" style={{ width:'100%', padding:'10px', fontSize:'12px', fontWeight:700 }}>
                    {processing ? '⏳' : `💰 ${lang==='ar'?'تعديل الرصيد':'Update Balance'}`}
                </button>
            </div>

            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'6px', maxHeight:'40vh', overflowY:'auto' }}>
                    {goldLogs.map(log => (
                        <div key={log.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <div>
                                <div style={{ fontSize:'11px', fontWeight:700 }}>{log.userName}</div>
                                <div style={{ fontSize:'10px', color:'#6b7280' }}>{log.reason}</div>
                            </div>
                            <div style={{ textAlign:'right' }}>
                                <div style={{ fontSize:'12px', fontWeight:800, color:log.amount>=0?'#10b981':'#ef4444' }}>{log.amount >= 0 ? '+' : ''}{log.amount}</div>
                                <div style={{ fontSize:'9px', color:'#4b5563' }}>{log.timestamp?.toDate?.() ? log.timestamp.toDate().toLocaleString() : ''}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.FinancialLogSection = FinancialLogSection;
})();
