(function () {
  var { useState } = React;

  var TutorialModal = ({ show, onClose, lang }) => {
    var t = TRANSLATIONS[lang];
    var [step, setStep] = useState(0);
    if (!show) return null;
    var steps = [{ text: t.tutorialStep1, img: "🕵️" }, { text: t.tutorialStep2, img: "🗳️" }, { text: t.tutorialStep3, img: "🛒" }];
    return (/*#__PURE__*/
      React.createElement("div", { className: "modal-overlay", onClick: onClose }, /*#__PURE__*/
      React.createElement("div", { className: "modal-content animate-pop", onClick: (e) => e.stopPropagation(), style: { maxWidth: '340px' } }, /*#__PURE__*/
      React.createElement("div", { className: "modal-header" }, /*#__PURE__*/React.createElement("h2", { className: "modal-title" }, t.tutorialTitle), /*#__PURE__*/React.createElement(ModalCloseBtn, { onClose: onClose })), /*#__PURE__*/
      React.createElement("div", { className: "modal-body text-center" }, /*#__PURE__*/
      React.createElement("div", { className: "text-5xl mb-4 animate-bounce" }, steps[step].img), /*#__PURE__*/
      React.createElement("p", { className: "text-sm mb-4 text-gray-200" }, steps[step].text), /*#__PURE__*/
      React.createElement("div", { className: "flex justify-center gap-2 mb-3" }, steps.map((_, i) => /*#__PURE__*/React.createElement("div", { key: i, className: `w-2 h-2 rounded-full transition ${i === step ? 'bg-cyan-400 w-4' : 'bg-gray-600'}` }))), /*#__PURE__*/
      React.createElement("div", { className: "flex gap-2" },
      step > 0 && /*#__PURE__*/React.createElement("button", { onClick: () => setStep((s) => s - 1), className: "btn-ghost flex-1 py-2 rounded-lg text-sm" }, "Back"),
      step < steps.length - 1 ? /*#__PURE__*/React.createElement("button", { onClick: () => setStep((s) => s + 1), className: "btn-neon flex-1 py-2 rounded-lg text-sm" }, t.next) : /*#__PURE__*/React.createElement("button", { onClick: onClose, className: "btn-neon flex-1 py-2 rounded-lg text-sm" }, t.startGame)
      ), /*#__PURE__*/
      React.createElement("button", { onClick: onClose, className: "text-xs text-gray-500 mt-3 hover:text-white" }, t.skipTutorial)
      )
      )
      ));

  };

  window.TutorialModal = TutorialModal;
})();