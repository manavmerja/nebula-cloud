import React, { memo } from 'react';
import { Handle, Position, useReactFlow, NodeProps } from 'reactflow';
import { Trash2 } from 'lucide-react'; // We keep Trash2 for the delete button
import { getCloudIconPath } from '@/utils/iconMap'; // <--- Import your new helper

function CloudServiceNode({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();

  // 1. Get the authentic icon path from your helper
  const iconPath = getCloudIconPath(data.label);

  const deleteNode = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
  };

  return (
    <div
      className={`
        group relative flex flex-col items-center justify-center
        p-3 rounded-xl min-w-[120px] transition-all duration-300
        border backdrop-blur-md
        ${selected
          ? 'bg-gray-800/90 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]' // Active Glow
          : 'bg-gray-900/90 border-gray-700 hover:border-gray-500 shadow-xl'
        }
      `}
    >
      {/* ❌ Delete Button (Hidden until hover) */}
      <button
        onClick={(e) => {
            e.stopPropagation(); // Prevent clicking the node when deleting
            deleteNode();
        }}
        className="
          absolute -top-2 -right-2
          bg-red-500 hover:bg-red-600 text-white
          p-1.5 rounded-full shadow-md
          opacity-0 scale-75 translate-y-2
          group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0
          transition-all duration-200 z-50
        "
        title="Delete Resource"
      >
        <Trash2 size={12} />
      </button>

      {/* 🎯 Input Handles (Top & Left) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-gray-500 !border-gray-900 transition-colors hover:!bg-cyan-400"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-gray-500 !border-gray-900 transition-colors hover:!bg-cyan-400"
      />

      {/* 🔷 The Icon Container */}
      <div className="relative mb-2 w-12 h-12 flex items-center justify-center">
         {/* Subtle Glow behind the icon to make it pop on dark background */}
         <div className="absolute inset-0 bg-white/5 rounded-full blur-sm" />

         {/* The Official AWS Icon */}
         <img
            src={iconPath}
            alt={data.label}
            className="relative w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
            draggable={false}
         />
      </div>

      {/* 🏷 Label */}
      <span className="text-[11px] font-semibold text-gray-200 text-center leading-tight px-1 max-w-[140px] tracking-wide">
        {data.label}
      </span>

      {/* 🚀 Output Handles (Right & Bottom) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-gray-500 !border-gray-900 transition-colors hover:!bg-purple-400"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-gray-500 !border-gray-900 transition-colors hover:!bg-purple-400"
      />
    </div>
  );
}

export default memo(CloudServiceNode);