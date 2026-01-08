"use client"; // 👈 Ye zaroori hai state ke liye

import { useState, Suspense } from 'react';
import FlowEditor from '@/components/FlowEditor';
import NebulaJourney from '@/components/NebulaJourney';

export default function Home() {
  // State to track if we should show the Intro Story
  const [showIntro, setShowIntro] = useState(true);

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">

      {/* Agar showIntro TRUE hai, toh sirf NebulaJourney dikhao */}
      {showIntro ? (
        <div className="fixed inset-0 z-50 bg-black">
          <NebulaJourney />

          <button
            onClick={() => setShowIntro(false)}
            className="absolute top-6 right-8 z-50 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium tracking-wide shadow-2xl"
          >
            Skip Intro ✕
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-screen overflow-hidden">
          {/* Dashboard with subtle background lines */}
          <div className="relative flex-1 flex flex-col">
            <header className="relative z-10 p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl flex justify-between items-center">
              <div className="flex flex-col">
                <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent tracking-tighter">
                  NEBULA CLOUD
                </h1>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Infrastucture Engine</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono text-gray-400">System Ready</span>
              </div>
            </header>

            <div className="flex-grow relative overflow-hidden bg-[#050505]">
              <Suspense fallback={
                <div className="flex h-full w-full items-center justify-center text-cyan-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                    <span className="text-sm font-mono tracking-widest animate-pulse">BOOTING EDITOR...</span>
                  </div>
                </div>
              }>
                <FlowEditor />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}