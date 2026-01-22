import React, { useState, useEffect } from 'react';
import { X, Settings, Code, Tag, Database, Cpu, Globe } from 'lucide-react';
import { Node } from 'reactflow';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
}

export default function PropertiesPanel({ selectedNode, onClose }: PropertiesPanelProps) {
  // Local state for the editable label
  const [label, setLabel] = useState('');

  // Update local state when the selected node changes
  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data?.label || '');
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  // Helper to pick an icon based on node type
  const getIcon = () => {
    const type = selectedNode.data?.label?.toLowerCase() || '';
    if (type.includes('db') || type.includes('rds')) return <Database size={18} className="text-blue-400" />;
    if (type.includes('ec2') || type.includes('compute')) return <Cpu size={18} className="text-orange-400" />;
    return <Globe size={18} className="text-cyan-400" />;
  };

  return (
    <aside className="absolute right-4 top-20 w-80 bg-[#151921]/95 border border-gray-800 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden z-30 animate-in slide-in-from-right-10 duration-200 flex flex-col">

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gray-800 rounded-lg border border-gray-700">
                {getIcon()}
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-200 tracking-wide">PROPERTIES</span>
                <span className="text-[10px] text-gray-500 uppercase">{selectedNode.type} Node</span>
            </div>
        </div>
        <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-500 hover:text-white"
        >
            <X size={16} />
        </button>
      </div>

      {/* --- CONTENT SCROLL AREA --- */}
      <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">

        {/* 1. Resource Name (Editable) */}
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-400">
                <Tag size={12} />
                <label className="text-[10px] uppercase tracking-wider font-bold">Resource Name</label>
            </div>
            <input
                className="w-full bg-[#0F1117] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-gray-600"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Web Server 01"
            />
        </div>

        {/* 2. Resource ID (Read Only) */}
        <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">Unique ID</label>
            <div className="p-2.5 bg-black/40 rounded-lg border border-gray-800 text-xs text-gray-400 font-mono break-all select-all hover:border-gray-700 transition-colors cursor-text group flex items-center justify-between">
                {selectedNode.id}
            </div>
        </div>

        <div className="h-px bg-gray-800" />

        {/* 3. Terraform Configuration (Mock) */}
        <div className="space-y-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                    <Code size={12} />
                    <label className="text-[10px] uppercase tracking-wider font-bold">Configuration</label>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">HCL</span>
             </div>

             <div className="p-3 bg-[#0A0C10] rounded-lg border border-gray-800 text-[10px] text-gray-400 font-mono leading-relaxed overflow-x-auto">
                <div className="opacity-50 mb-2"># Auto-generated config</div>
                <span className="text-purple-400">resource</span> <span className="text-green-400">"aws_instance"</span> <span className="text-yellow-400">"this"</span> {'{'} <br/>
                &nbsp;&nbsp;ami &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <span className="text-green-400">"ami-0c55b1..."</span><br/>
                &nbsp;&nbsp;instance_type = <span className="text-green-400">"t2.micro"</span><br/>
                &nbsp;&nbsp;tags = {'{'} <br/>
                &nbsp;&nbsp;&nbsp;&nbsp;Name = <span className="text-green-400">"{label || 'Unamed'}"</span><br/>
                &nbsp;&nbsp;{'}'}<br/>
                {'}'}
             </div>
        </div>

      </div>

      {/* --- FOOTER --- */}
      <div className="p-3 border-t border-gray-800 bg-gray-900/30">
        <button className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-500/20 transition-all flex items-center justify-center gap-2">
            <Settings size={14} />
            Advanced Settings
        </button>
      </div>
    </aside>
  );
}