var AppWithErrorBoundary = () => (<ErrorBoundary><App /></ErrorBoundary>);

var oot = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppWithErrorBoundary />);

// � Hide loading screen as soon as React renders
if (typeof window._hideLoader === 'function') window._hideLoader();

