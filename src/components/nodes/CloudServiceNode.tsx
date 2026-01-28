import React, { memo } from 'react';
import { Handle, Position, useReactFlow, NodeProps } from 'reactflow';
import { Trash2, AlertTriangle } from 'lucide-react'; 
import { getCloudIconPath } from '@/utils/iconMap';

function CloudServiceNode({ id, data, selected }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const iconPath = getCloudIconPath(data.label);
  const isError = data.status === 'error';
  const errorMessage = data.errorMessage || "Unknown issue detected";

  const deleteNode = () => {
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div className="relative group">
      {isError && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-900/90 text-red-100 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
          ⚠️ {errorMessage}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-900/90" />
        </div>
      )}

      <div className={`relative flex flex-col items-center justify-center p-3 rounded-xl min-w-[120px] transition-all duration-300 border backdrop-blur-md ${isError ? 'bg-red-950/40 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse-slow' : selected ? 'bg-gray-800/90 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'bg-gray-900/90 border-gray-700 hover:border-gray-500 shadow-xl' }`}>
        
        <button onClick={(e) => { e.stopPropagation(); deleteNode(); }} className="absolute -top-2 -right-2 bg-gray-700 hover:bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 scale-75 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-200 z-40">
          <Trash2 size={12} />
        </button>

        {isError && (
          <div className="absolute -top-2 -left-2 bg-red-600 text-white p-1 rounded-full shadow-lg z-40 animate-bounce">
            <AlertTriangle size={14} />
          </div>
        )}

        {/* ✅ RESTORED: Top & Left Inputs */}
        <Handle type="target" position={Position.Top} className={`!w-2 !h-2 transition-colors ${isError ? '!bg-red-500' : '!bg-gray-500 hover:!bg-cyan-400'}`} />
        <Handle type="target" position={Position.Left} className={`!w-2 !h-2 transition-colors ${isError ? '!bg-red-500' : '!bg-gray-500 hover:!bg-cyan-400'}`} />

        <div className="relative mb-2 w-12 h-12 flex items-center justify-center">
           <div className={`absolute inset-0 rounded-full blur-md ${isError ? 'bg-red-500/20' : 'bg-white/5'}`} />
           <img src={iconPath} alt={data.label} className="relative w-full h-full object-contain drop-shadow-lg" draggable={false} />
        </div>

        <span className={`text-[11px] font-semibold text-center leading-tight px-1 max-w-[140px] tracking-wide ${isError ? 'text-red-200' : 'text-gray-200'}`}>
          {data.label}
        </span>

        {/* ✅ RESTORED: Bottom & Right Outputs */}
        <Handle type="source" position={Position.Right} className={`!w-2 !h-2 transition-colors ${isError ? '!bg-red-500' : '!bg-gray-500 hover:!bg-purple-400'}`} />
        <Handle type="source" position={Position.Bottom} className={`!w-2 !h-2 transition-colors ${isError ? '!bg-red-500' : '!bg-gray-500 hover:!bg-purple-400'}`} />
      </div>
    </div>
  );
}

export default memo(CloudServiceNode);