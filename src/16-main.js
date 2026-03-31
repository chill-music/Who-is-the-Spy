// ⚡ Wait for all critical window components to be ready before mounting React.
// Babel transpiles text/babel scripts asynchronously (XHR fetch + transpile).
// On hard refresh, React can start rendering before Babel finishes — causing
// "React error #130: Element type is invalid (got: undefined)".
// This polling loop delays mounting until every critical component is defined.

var _criticalComponents = [
'App', 'ErrorBoundary',
'LobbyView', 'RoomView', 'GlobalModals', 'BannedScreen',
'AvatarWithFrame', 'AvatarComponent',
'useAuthState', 'useAppUIState', 'useOnboarding',
'useGameActions', 'useUserListeners',
'RankingView', 'GroupsSection'];


function _mountApp() {
  var AppWithErrorBoundary = function () {
    return React.createElement(ErrorBoundary, null, React.createElement(App, null));
  };
  var root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(AppWithErrorBoundary, null));
  if (typeof window._hideLoader === 'function') window._hideLoader();
}

function _waitForComponents(attempt) {
  attempt = attempt || 0;
  var missing = _criticalComponents.filter(function (c) {return typeof window[c] !== 'function';});
  if (missing.length === 0) {
    _mountApp();
  } else if (attempt < 200) {// max ~10 seconds
    setTimeout(function () {_waitForComponents(attempt + 1);}, 50);
  } else {
    // Timeout fallback: mount anyway, better to show an error than nothing
    console.warn('PRO SPY: Timeout waiting for components:', missing);
    _mountApp();
  }
}

_waitForComponents();