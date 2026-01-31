import React, { useMemo, useState } from 'react';
import { Link as LinkIcon, Search, X } from 'lucide-react';
import { Node } from 'reactflow';

interface QuickConnectMenuProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
  onSelect: (targetNodeId: string) => void;
  nodes: Node[];
  sourceNodeId: string;
}

export default function QuickConnectMenu({
  position,
  onClose,
  onSelect,
  nodes,
  sourceNodeId
}: QuickConnectMenuProps) {
  const [search, setSearch] = useState("");

  // Filter: Exclude source node + Match search
  const options = useMemo(() => {
    return nodes.filter(n =>
      n.id !== sourceNodeId &&
      (n.data.label?.toLowerCase().includes(search.toLowerCase()) || n.id.includes(search))
    );
  }, [nodes, sourceNodeId, search]);

  if (!position) return null;

  return (
    <div
      className="absolute z-50 bg-[#151921] border border-gray-800 rounded-lg shadow-2xl overflow-hidden w-56 flex flex-col animate-in fade-in zoom-in-95 duration-100"
      style={{ top: position.y, left: position.x }}
    >
      {/* Header & Search */}
      <div className="flex items-center p-2 border-b border-gray-800 gap-2">
        <div className="relative flex-1">
            <Search className="absolute left-2 top-1.5 text-gray-500" size={12} />
            <input
                autoFocus
                placeholder="Connect to..."
                className="w-full bg-[#0a0c10] border border-gray-700 rounded py-1 pl-7 pr-2 text-[11px] text-gray-300 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-gray-600"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={14} />
        </button>
      </div>

      {/* List */}
      <div className="max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
        {options.length === 0 ? (
            <div className="text-center py-3 text-[10px] text-gray-600 italic">
                No other nodes found
            </div>
        ) : (
            options.map((node) => (
              <button
                key={node.id}
                onClick={() => onSelect(node.id)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-gray-300 hover:bg-cyan-900/30 hover:text-cyan-400 rounded transition-colors text-left group"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                    <LinkIcon size={12} className="text-gray-600 group-hover:text-cyan-500 shrink-0" />
                    <span className="truncate font-medium">{node.data.label || "Untitled Node"}</span>
                </div>

                {/* 🟢 ID BADGE: Solves the duplicate name issue */}
                <span className="text-[9px] text-gray-600 font-mono bg-gray-900 px-1 rounded ml-2 shrink-0 group-hover:text-cyan-600 group-hover:bg-cyan-950">
                    #{node.id.slice(-4)}
                </span>
              </button>
            ))
        )}
      </div>

      {/* Invisible backdrop to handle closing when clicking outside */}
      <div className="fixed inset-0 z-[-1]" onClick={onClose} />
    </div>
  );
}