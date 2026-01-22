import React from 'react';
import { Sparkles, Play, Loader2 } from 'lucide-react';

interface RunButtonProps {
  onRun: () => void;
  loading: boolean;
}

export default function RunArchitectButton({ onRun, loading }: RunButtonProps) {
  return (
    <button
      onClick={onRun}
      disabled={loading}
      className={`
        relative group overflow-hidden rounded-lg p-[1px] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0F1117] transition-all duration-200
        ${loading ? 'cursor-not-allowed opacity-80' : 'hover:scale-105 active:scale-95'}
      `}
    >
      {/* 1. The Animated Gradient Border */}
      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0F1117_0%,#06b6d4_50%,#0F1117_100%)]" />

      {/* 2. The Button Content */}
      <span className={`
        relative flex h-full w-full items-center gap-2 rounded-lg bg-[#0F1117] px-4 py-2 text-sm font-bold text-white transition-all
        group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600
      `}>
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Sparkles className="fill-cyan-400 text-cyan-400 group-hover:text-white group-hover:fill-white transition-colors" size={16} />
        )}

        <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:text-white transition-all">
          {loading ? 'Building...' : 'Run Architect'}
        </span>
      </span>

      {/* 3. Bottom Glow Reflection */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-cyan-500/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}