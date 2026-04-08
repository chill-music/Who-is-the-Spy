"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function DefuseMasterPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(0);
  const initialized = useRef(false);

  // Total scripts to load: React, ReactDOM, Firebase (3), Game scripts (6) = 11
  const totalScripts = 11;

  useEffect(() => {
    if (scriptsLoaded < totalScripts || initialized.current) return;
    initialized.current = true;

    // Initialize Firebase
    const firebase = (window as any).firebase;
    if (firebase && !firebase.apps?.length) {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000"
      };
      firebase.initializeApp(firebaseConfig);
      console.log("[v0] Firebase initialized");
    }

    // Mount the game
    const DefuseMaster = (window as any).DefuseMaster;
    const React = (window as any).React;
    const ReactDOM = (window as any).ReactDOM;

    if (containerRef.current && DefuseMaster && React && ReactDOM) {
      const urlParams = new URLSearchParams(window.location.search);
      const roomCode = urlParams.get("room");

      const root = ReactDOM.createRoot(containerRef.current);
      root.render(React.createElement(DefuseMaster, { initialRoomId: roomCode }));
      console.log("[v0] DefuseMaster mounted");
    } else {
      console.error("[v0] Failed to mount DefuseMaster - missing dependencies");
    }
  }, [scriptsLoaded]);

  const handleScriptLoad = () => {
    setScriptsLoaded(prev => prev + 1);
  };

  return (
    <>
      {/* React 18 via CDN */}
      <Script 
        src="https://unpkg.com/react@18/umd/react.production.min.js" 
        strategy="beforeInteractive"
        onLoad={handleScriptLoad}
      />
      <Script 
        src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" 
        strategy="beforeInteractive"
        onLoad={handleScriptLoad}
      />

      {/* Firebase 10 Compat */}
      <Script 
        src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js" 
        strategy="beforeInteractive"
        onLoad={handleScriptLoad}
      />
      <Script 
        src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js" 
        strategy="beforeInteractive"
        onLoad={handleScriptLoad}
      />
      <Script 
        src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js" 
        strategy="beforeInteractive"
        onLoad={handleScriptLoad}
      />

      {/* Game Scripts */}
      <Script src="/defuse-cards.js" strategy="lazyOnload" onLoad={handleScriptLoad} />
      <Script src="/defuse-rules.js" strategy="lazyOnload" onLoad={handleScriptLoad} />
      <Script src="/DefuseLobby.js" strategy="lazyOnload" onLoad={handleScriptLoad} />
      <Script src="/DefuseGame.js" strategy="lazyOnload" onLoad={handleScriptLoad} />
      <Script src="/DefuseResults.js" strategy="lazyOnload" onLoad={handleScriptLoad} />
      <Script src="/DefuseMaster.js" strategy="lazyOnload" onLoad={handleScriptLoad} />

      <div 
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #5B2D8E 0%, #3A1A6E 100%)",
          fontFamily: "'Nunito', sans-serif"
        }}
      >
        {scriptsLoaded < totalScripts ? (
          <div 
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "white"
            }}
          >
            <div 
              style={{
                width: "50px",
                height: "50px",
                border: "4px solid rgba(255,255,255,0.2)",
                borderTopColor: "#FFD700",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}
            />
            <p style={{ marginTop: "20px", fontSize: "18px", fontWeight: 600 }}>
              Loading Defuse Master...
            </p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <div ref={containerRef} id="defuse-master-root" style={{ minHeight: "100vh" }} />
        )}
      </div>
    </>
  );
}
