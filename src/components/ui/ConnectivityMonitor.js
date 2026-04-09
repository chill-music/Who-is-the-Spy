(function () {
    /**
     * @component ConnectivityMonitor
     * @description Provides a global UI banner when the device loses internet connection.
     */
    const ConnectivityStyle = () => React.createElement('style', null, `
        @keyframes slideDown {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
        }
    `);

    const ConnectivityMonitor = () => {
        const [isOnline, setIsOnline] = useState(window.navigator.onLine);

        useEffect(() => {
            const handleOnline = () => setIsOnline(true);
            const handleOffline = () => setIsOnline(false);

            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }, []);

        if (isOnline) return null;

        return React.createElement(React.Fragment, null,
            React.createElement(ConnectivityStyle),
            React.createElement('div', {
                id: 'connectivity-banner',
                style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: window.Z ? window.Z.OVERLAY + 1000 : 999999,
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    animation: 'slideDown 0.3s ease-out'
                }
            }, 
                React.createElement('span', null, '📡'),
                React.createElement('span', null, 'Connection Lost. Reconnecting...')
            )
        );
    };

    window.ConnectivityMonitor = ConnectivityMonitor;
})();
