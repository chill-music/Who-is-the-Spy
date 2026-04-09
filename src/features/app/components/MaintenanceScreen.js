(function () {
  /**
   * Component: MaintenanceScreen
   * Renders a full-page lockout notice when the site is under maintenance.
   */
  window.MaintenanceScreen = function ({ lang, customMessage }) {
    const t = {
      ar: {
        title: "الصيانة جارية",
        subtitle: "نقوم بتحديث الموقع لتحسين تجربتكم.",
        description: "اللعبة قيد الصيانة حالياً. سنعود للعمل قريباً جداً. شكراً لصبركم!",
        reload: "تحديث"
      },
      en: {
        title: "Maintenance in Progress",
        subtitle: "We are updating the site to improve your experience.",
        description: "The game is currently under maintenance. We will be back online shortly. Thank you for your patience!",
        reload: "Reload"
      }
    };

    const content = t[lang] || t.en;

    return (/*#__PURE__*/
      React.createElement("div", {
        style: {
          position: 'fixed', inset: 0, background: '#06060c', zIndex: 9999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          overflow: 'hidden'
        }
      },
        
        // Background Blobs for that premium feel
        React.createElement("div", { style: { position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.4 } },
            React.createElement("div", { style: { position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, #7000ff33 0%, transparent 70%)', filter: 'blur(50px)' } }),
            React.createElement("div", { style: { position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, #00f2ff22 0%, transparent 70%)', filter: 'blur(50px)' } })
        ),

        React.createElement("div", { 
          style: { 
            maxWidth: '500px', 
            width: '100%', 
            textAlign: 'center', 
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '32px',
            padding: '48px 32px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          } 
        }, 
          
          // Animated Gear Icon
          React.createElement("div", { 
            style: {
              width: '120px', height: '120px', margin: '0 auto 32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px',
              position: 'relative'
            } 
          }, 
            React.createElement("div", { 
                style: { 
                    position: 'absolute', inset: 0, border: '2px dashed rgba(0,242,255,0.3)', borderRadius: '50%',
                    animation: 'spin 10s linear infinite' 
                } 
            }),
            React.createElement("div", { 
                style: { 
                    position: 'absolute', inset: '10px', border: '2px dashed rgba(112,0,255,0.3)', borderRadius: '50%',
                    animation: 'spin-reverse 15s linear infinite' 
                } 
            }),
            "⚙️"
          ),

          React.createElement("h1", { 
            style: { fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '12px', letterSpacing: '1px' } 
          }, content.title),
          
          React.createElement("p", { 
            style: { fontSize: '15px', color: '#00f2ff', fontWeight: 700, marginBottom: '24px', opacity: 0.9 } 
          }, content.subtitle),

          React.createElement("div", { 
            style: {
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '32px',
              border: '1px solid rgba(255,255,255,0.05)'
            }
          },
            React.createElement("p", { 
              style: { fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 } 
            }, customMessage || content.description)
          ),

          React.createElement("button", {
            onClick: () => window.location.reload(),
            className: "btn-neon",
            style: {
              padding: '14px 48px', borderRadius: '16px', fontSize: '15px', fontWeight: 900, 
              cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #00f2ff, #7000ff)',
              color: '#fff', boxShadow: '0 10px 25px rgba(0,242,255,0.3)'
            }
          }, content.reload),

          // Utility Styles for animations
          React.createElement("style", null, `
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
          `)
        )
      )
    );
  };
})();
