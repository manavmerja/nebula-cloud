import React from 'react';
import { Info } from 'lucide-react';

interface ContextHintProps {
  isVisible: boolean;
}

export default function ContextHint({ isVisible }: ContextHintProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-[#151921]/90 backdrop-blur-md border border-gray-800 text-gray-400 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-2xl pointer-events-none">
        <span className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded text-[10px] font-mono border border-gray-700">SHIFT</span>
        <span>+</span>
        <span className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded text-[10px] font-mono border border-gray-700">CLICK</span>
        <span>to connect</span>
      </div>
    </div>
  );
}