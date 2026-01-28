import React, { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { Trash2, Copy, Settings, Code } from 'lucide-react';

interface ContextMenuProps {
  id: string;
  top: number;
  left: number;
  right?: number;
  bottom?: number;
  onClose: () => void;
  onConfigure: (id: string) => void; // 👈 New Callback
  onViewCode: () => void;            // 👈 New Callback
}

export default function ContextMenu({
  id, top, left, right, bottom, onClose, onConfigure, onViewCode
}: ContextMenuProps) {
  const { getNode, setNodes, addNodes, setEdges } = useReactFlow();

  // --- ACTIONS ---

  const duplicateNode = useCallback(() => {
    const node = getNode(id);
    if (!node) return;

    const position = {
      x: node.position.x + 50,
      y: node.position.y + 50,
    };

    addNodes({
      ...node,
      id: `${node.type}-${Date.now()}`,
      position,
      selected: true,
      data: { ...node.data, label: `${node.data.label} (Copy)` },
    });
    onClose();
  }, [id, getNode, addNodes, onClose]);

  const deleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id));
    onClose();
  }, [id, setNodes, setEdges, onClose]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className="absolute z-50 w-48 bg-[#151921] border border-gray-800 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col p-1 animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-3 py-2 border-b border-gray-800/50 mb-1">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Node Actions</span>
      </div>

      {/* ✅ WIRED UP: Opens Properties Panel */}
      <MenuButton
        icon={Settings}
        label="Configure"
        onClick={() => { onConfigure(id); onClose(); }}
      />

      {/* ✅ WIRED UP: Jumps to Result Node */}
      <MenuButton
        icon={Code}
        label="View Terraform"
        onClick={() => { onViewCode(); onClose(); }}
      />

      <MenuButton icon={Copy} label="Duplicate" onClick={duplicateNode} />

      <div className="h-px bg-gray-800 my-1 mx-2" />

      <MenuButton icon={Trash2} label="Delete" onClick={deleteNode} variant="danger" />
    </div>
  );
}

// Helper Sub-component
const MenuButton = ({ icon: Icon, label, onClick, variant = 'default' }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left
      ${variant === 'danger'
        ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
        : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`}
  >
    <Icon size={14} />
    {label}
  </button>
);