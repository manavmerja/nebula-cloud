import React from 'react';
import { Settings, Code, Copy, Layers, Trash2, X } from 'lucide-react'; // Added 'Layers' for Duplicate icon variety

interface ContextMenuProps {
  id: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  onClose: () => void;
  onConfigure: (id: string) => void;
  onViewCode: () => void;
  onCopy: () => void;      // 👈 Added
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function ContextMenu({
  id,
  top,
  left,
  right,
  bottom,
  onClose,
  onConfigure,
  onViewCode,
  onCopy, // 👈 Added
  onDuplicate,
  onDelete,
}: ContextMenuProps) {
  return (
    <div
      style={{ top, left, right, bottom }}
      className="absolute z-50 w-64 bg-[#151921] border border-gray-700 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header */}
      <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Node Actions</span>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={14} />
        </button>
      </div>

      {/* Primary Actions */}
      <div className="p-1 flex flex-col gap-0.5">
        <MenuButton
            onClick={() => { onConfigure(id); onClose(); }}
            icon={Settings}
            label="Configure Node"
        />
        <MenuButton
            onClick={() => { onViewCode(); onClose(); }}
            icon={Code}
            label="View Terraform"
        />
      </div>

      <div className="h-px bg-gray-700 mx-2" />

      {/* Secondary Actions */}
      <div className="p-1 flex flex-col gap-0.5">
        {/* 🚀 NEW: Copy Button */}
        <MenuButton
            onClick={() => { onCopy(); onClose(); }}
            icon={Copy}
            label="Copy"
            shortcut="Ctrl+C"
        />
        <MenuButton
            onClick={() => { onDuplicate(); onClose(); }}
            icon={Layers}
            label="Duplicate"
            shortcut="Ctrl+D"
        />
        <MenuButton
            onClick={() => { onDelete(); onClose(); }}
            icon={Trash2}
            label="Delete"
            shortcut="Del"
            variant="danger"
        />
      </div>
    </div>
  );
}

// Helper Sub-component
interface MenuButtonProps {
    onClick: () => void;
    icon: any;
    label: string;
    shortcut?: string;
    variant?: 'default' | 'danger';
}

const MenuButton = ({ onClick, icon: Icon, label, shortcut, variant = 'default' }: MenuButtonProps) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all
            ${variant === 'danger'
                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }
        `}
    >
        <Icon size={16} />
        <span className="flex-1 text-left">{label}</span>
        {shortcut && <span className="text-[10px] text-gray-600 font-mono">{shortcut}</span>}
    </button>
);