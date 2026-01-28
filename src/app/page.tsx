"use client";

import { useState, useEffect, Suspense } from 'react';
import FlowEditor from '@/components/FlowEditor';
import NebulaJourney from '@/components/NebulaJourney';

export default function Home() {
  // 1. Initialize state (default to false to prevent hydration mismatch)
  const [showIntro, setShowIntro] = useState(false);
  const [isChecking, setIsChecking] = useState(true); // Loading state for the check

  // 2. Check Local Storage on Mount
  useEffect(() => {
    try {
      const hasSeenIntro = localStorage.getItem('hasSeenIntro');

      if (!hasSeenIntro) {
        setShowIntro(true); // Show intro if NOT seen yet
      }
    } catch (error) {
      // Handle cases where localStorage is unavailable (SSR, private browsing, etc.)
      console.warn('localStorage access failed, showing intro:', error);
      setShowIntro(true); // Treat as "not seen"
    } finally {
      setIsChecking(false); // Check complete
    }
  }, []);

  // 3. Handler to dismiss intro and save flag
  const handleFinishIntro = () => {
    localStorage.setItem('hasSeenIntro', 'true'); // Save the flag
    setShowIntro(false);
  };

  // Prevent flash while checking local storage
  if (isChecking) return <div className="h-screen bg-black" />;

  return (
    <main className="flex h-screen flex-col bg-black text-white">

      {showIntro ? (
        <div className="fixed inset-0 z-50 bg-black">

          {/* Intro Component */}
          <NebulaJourney onComplete={handleFinishIntro} />

          {/* Skip Button */}
          <button
            onClick={handleFinishIntro}
            className="absolute top-6 right-8 z-50 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium tracking-wide shadow-2xl"
          >
            Skip Intro ✕
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="relative flex-1 flex flex-col">
            <div className="flex-1 relative overflow-hidden bg-[#050505]">
              <Suspense
                fallback={
                  <div className="flex h-full w-full items-center justify-center text-cyan-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                      <span className="text-sm font-mono tracking-widest animate-pulse">
                        BOOTING EDITOR...
                      </span>
                    </div>
                  </div>
                }
              >
                <FlowEditor />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}