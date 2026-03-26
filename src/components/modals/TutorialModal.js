(function() {
    const { useState } = React;

    const TutorialModal = ({ show, onClose, lang }) => {
        const t = TRANSLATIONS[lang];
        const [step, setStep] = useState(0);
    if(!show) return null;
    const steps = [ { text: t.tutorialStep1, img: "🕵️" }, { text: t.tutorialStep2, img: "🗳️" }, { text: t.tutorialStep3, img: "🛒" } ];
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '340px' }}>
                <div className="modal-header"><h2 className="modal-title">{t.tutorialTitle}</h2><ModalCloseBtn onClose={onClose} /></div>
                <div className="modal-body text-center">
                    <div className="text-5xl mb-4 animate-bounce">{steps[step].img}</div>
                    <p className="text-sm mb-4 text-gray-200">{steps[step].text}</p>
                    <div className="flex justify-center gap-2 mb-3">{steps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition ${i === step ? 'bg-cyan-400 w-4' : 'bg-gray-600'}`}></div>)}</div>
                    <div className="flex gap-2">
                        {step > 0 && <button onClick={() => setStep(s => s-1)} className="btn-ghost flex-1 py-2 rounded-lg text-sm">Back</button>}
                        {step < steps.length - 1 ? <button onClick={() => setStep(s => s+1)} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.next}</button> : <button onClick={onClose} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.startGame}</button>}
                    </div>
                    <button onClick={onClose} className="text-xs text-gray-500 mt-3 hover:text-white">{t.skipTutorial}</button>
                </div>
            </div>
        </div>
    );
};

    window.TutorialModal = TutorialModal;
})();
