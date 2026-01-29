"use client";

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // 👈 Import this
import FlowEditor from '@/components/FlowEditor';
import NebulaJourney from '@/components/NebulaJourney';

function NebulaApp() {
  const searchParams = useSearchParams();
  
  // 1. Logic: Agar URL me 'new=true', 'skip=true' ya Project ID hai, to Intro mat dikhao
  const shouldSkipIntro = 
    searchParams.get('new') === 'true' || 
    searchParams.get('skip') === 'true' || 
    searchParams.has('id');

  // State initialize karte waqt check karo
  const [showIntro, setShowIntro] = useState(!shouldSkipIntro);

  const handleFinishIntro = () => {
    setShowIntro(false);
  };

  return (
    <main className="flex h-screen flex-col bg-black text-white">
      {showIntro ? (
        <div className="fixed inset-0 z-50 bg-black">
          <NebulaJourney onComplete={handleFinishIntro} />
          
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
                <FlowEditor />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ⚠️ IMPORTANT: 'useSearchParams' needs Suspense boundary in Next.js App Router
export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-black text-cyan-500">Loading Nebula...</div>}>
      <NebulaApp />
    </Suspense>
  );
}