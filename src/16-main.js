const AppWithErrorBoundary = () => (<ErrorBoundary><App /></ErrorBoundary>);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppWithErrorBoundary />);
