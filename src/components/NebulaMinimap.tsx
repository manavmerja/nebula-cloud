import React, { useState, useEffect } from 'react';
import { MiniMap, useStore, ReactFlowState } from 'reactflow';
import { Map, X } from 'lucide-react';

// Selector to get node count (kept for future logic, but we won't hide the map based on it anymore)
const nodeCountSelector = (state: ReactFlowState) => state.nodeInternals.size;

export default function NebulaMinimap() {
  const [isOpen, setIsOpen] = useState(true);
  const nodeCount = useStore(nodeCountSelector);

  // 1. 🚀 AUTO-MINIMIZE LOGIC
  // This listens for the "nebula-tour-completed" signal from FeatureGuide.tsx
  useEffect(() => {
    const handleTourEnd = () => {
      setIsOpen(false); // Close the map when tour is done
    };

    window.addEventListener('nebula-tour-completed', handleTourEnd);
    return () => window.removeEventListener('nebula-tour-completed', handleTourEnd);
  }, []);

  // 🎨 Node Styling
  const getNodeColor = (n: any) => {
    if (n.type === 'promptNode') return 'rgba(6, 182, 212, 0.8)';
    if (n.type === 'aiNode') return 'rgba(139, 92, 246, 0.8)';
    if (n.type === 'resultNode') return 'rgba(34, 197, 94, 0.8)';
    if (n.data?.status === 'error') return 'rgba(239, 68, 68, 0.9)';
    return 'rgba(59, 130, 246, 0.8)';
  };

  const getNodeStrokeColor = (n: any) => {
    if (n.type === 'promptNode') return '#06b6d4';
    if (n.type === 'aiNode') return '#8b5cf6';
    if (n.type === 'resultNode') return '#22c55e';
    if (n.data?.status === 'error') return '#ef4444';
    return '#3b82f6';
  };

  // --- CLOSED STATE ---
  if (!isOpen) {
    return (
      <button
        id="nebula-minimap" // 2. ✅ ID ADDED HERE (For Tour Spotlight)
        onClick={() => setIsOpen(true)}
        className="absolute bottom-6 right-6 z-40 p-3 bg-[#151921]/90 backdrop-blur-md border border-gray-800 rounded-full shadow-2xl hover:border-cyan-500/50 text-gray-400 hover:text-cyan-400 transition-all group"
        title="Open Navigation"
      >
        <Map size={20} className="group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  // --- OPEN STATE ---
  return (
    <div
        id="nebula-minimap" // 3. ✅ ID ADDED HERE (For Tour Spotlight)
        className="absolute bottom-6 right-6 z-40 w-[240px] h-[160px] bg-[#0f1115] border border-gray-800 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300 group flex flex-col"
    >

      {/* Header */}
      <div className="h-8 bg-black/40 border-b border-white/5 flex items-center justify-between px-3 shrink-0 z-50">
        <span className="text-[9px] font-bold text-cyan-500/60 tracking-[0.2em]">NAV_SYSTEM</span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-600 hover:text-white transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative w-full h-full bg-[#0a0a0f]">
        <div className="absolute inset-0 overflow-hidden">
          <MiniMap
            nodeColor={getNodeColor}
            nodeStrokeColor={getNodeStrokeColor}
            nodeStrokeWidth={2}
            nodeBorderRadius={4}
            maskColor="rgba(0, 0, 0, 0.6)"
            zoomable
            pannable
            className="nebula-minimap"
            style={{ backgroundColor: 'transparent' }}
          />
        </div>
      </div>

      {/* Decorative Corners */}
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/30 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/30 rounded-br-lg pointer-events-none" />
    </div>
  );
}