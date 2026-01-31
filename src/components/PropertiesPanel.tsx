import React, { useState, useEffect } from 'react';
import {
    X, Settings, Code, Tag, Database, Cpu, Globe,
    ShieldCheck, FileText, Lock, AlertTriangle, CheckCircle // ❌ Removed Activity, DollarSign
} from 'lucide-react';
import { Node } from 'reactflow';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  terraformCode?: string;
  onClose: () => void;
}

const IGNORED_NODE_TYPES = ['promptNode', 'aiNode', 'resultNode'];

export default function PropertiesPanel({ selectedNode, terraformCode = '', onClose }: PropertiesPanelProps) {
  const [label, setLabel] = useState('');
  
  // 👇 ONLY 3 TABS NOW (Clean & Real)
  const [activeTab, setActiveTab] = useState<'general' | 'code' | 'security'>('general');

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data?.label || '');
      setActiveTab('general');
    }
  }, [selectedNode]);

  if (!selectedNode || IGNORED_NODE_TYPES.includes(selectedNode.type || '')) {
      return null;
  }

  // --- HELPER: Extract Resource Code ---
  const getResourceCode = () => {
      if (!terraformCode) return "# No Terraform code generated yet.";
      
      const nodeLabel = label.toLowerCase();
      let resourceType = "";

      if (nodeLabel.includes('vpc')) resourceType = "aws_vpc";
      else if (nodeLabel.includes('subnet')) resourceType = "aws_subnet";
      else if (nodeLabel.includes('gateway')) resourceType = "aws_internet_gateway";
      else if (nodeLabel.includes('security')) resourceType = "aws_security_group";
      else if (nodeLabel.includes('ec2') || nodeLabel.includes('instance') || nodeLabel.includes('server')) resourceType = "aws_instance";
      else if (nodeLabel.includes('s3') || nodeLabel.includes('bucket')) resourceType = "aws_s3_bucket";
      else if (nodeLabel.includes('db') || nodeLabel.includes('rds')) resourceType = "aws_db_instance";
      else if (nodeLabel.includes('efs')) resourceType = "aws_efs";
      
      if (resourceType) {
          const regex = new RegExp(`resource\\s+"${resourceType}"\\s+"[^"]+"\\s+\\{[\\s\\S]*?\\}`, 'i');
          const match = terraformCode.match(regex);
          if (match) return match[0];
      }

      return `# Showing context for ${label}...\n# Full code is available in the editor panel.`;
  };

  const getIcon = () => {
    const type = selectedNode.data?.label?.toLowerCase() || '';
    if (type.includes('db') || type.includes('rds') || type.includes('storage'))
        return <Database size={18} className="text-blue-400" />;
    if (type.includes('ec2') || type.includes('compute') || type.includes('server'))
        return <Cpu size={18} className="text-orange-400" />;
    if (type.includes('s3') || type.includes('bucket'))
        return <FileText size={18} className="text-yellow-400" />;
    return <Globe size={18} className="text-cyan-400" />;
  };

  const renderSecurityContent = () => {
    const name = label.toLowerCase();
    const hasError = selectedNode.data?.status === 'error';
    const errorMessage = selectedNode.data?.errorMessage;

    if (hasError && errorMessage) {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                 <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg flex items-start gap-3">
                     <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={16} />
                     <div>
                         <p className="text-xs font-bold text-red-200">Security Vulnerability Detected</p>
                         <p className="text-[11px] text-red-300/80 mt-1 leading-relaxed">{errorMessage}</p>
                     </div>
                </div>
                <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Recommendation</p>
                    <p className="text-xs text-gray-400">Run the "Fix Issues" agent to automatically patch this vulnerability.</p>
                </div>
            </div>
        );
    }

    if (name.includes('db') || name.includes('rds')) {
        return (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-3 bg-green-900/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                     <Lock className="text-green-400" size={16} />
                     <div>
                         <p className="text-xs font-bold text-green-200">Private Subnet</p>
                         <p className="text-[10px] text-green-300/70">Not accessible from public internet.</p>
                     </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg flex items-center gap-3">
                    <ShieldCheck className="text-blue-400" size={16} />
                    <div>
                        <p className="text-xs font-bold text-blue-200">Standard Security Group</p>
                        <p className="text-[10px] text-blue-300/70">Inbound rules managed by Terraform.</p>
                    </div>
            </div>
        </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
        case 'general':
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Tag size={12} />
                            <label className="text-[10px] uppercase tracking-wider font-bold">Resource Name</label>
                        </div>
                        <input
                            className="w-full bg-[#0F1117] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-gray-600"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Resource Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">Unique ID</label>
                        <div className="p-2.5 bg-black/40 rounded-lg border border-gray-800 text-xs text-gray-400 font-mono break-all select-all hover:border-gray-700 transition-colors cursor-text">
                            {selectedNode.id}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">Status</label>
                        <div className="flex items-center gap-2">
                            <span className={`flex h-2 w-2 rounded-full ${selectedNode.data?.status === 'error' ? 'bg-red-500 shadow-red-500/60' : 'bg-green-500 shadow-green-500/60'} shadow-[0_0_8px]`}></span>
                            <span className={`text-xs font-medium ${selectedNode.data?.status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                {selectedNode.data?.status === 'error' ? 'Security Issues Detected' : 'Ready to Deploy'}
                            </span>
                        </div>
                    </div>
                </div>
            );

        case 'code':
            return (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Terraform Configuration</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">HCL</span>
                    </div>
                    <div className="p-3 bg-[#0A0C10] rounded-lg border border-gray-800 text-[10px] text-gray-400 font-mono leading-relaxed overflow-x-auto whitespace-pre custom-scrollbar">
                        {getResourceCode()}
                    </div>
                </div>
            );

        case 'security':
            return renderSecurityContent();
            
        // ❌ LOGS & COST REMOVED
    }
  };

  return (
    <aside className="absolute right-6 top-24 w-80 bg-[#12141a]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden z-30 animate-in slide-in-from-right-10 duration-300 flex flex-col max-h-[600px]">

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-gray-800 to-black rounded-xl border border-white/10 shadow-lg">
                {getIcon()}
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-white tracking-wide uppercase">Properties</span>
                <span className="text-[10px] text-gray-400">{selectedNode.type}</span>
            </div>
        </div>
        <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
            <X size={16} />
        </button>
      </div>

      {/* --- TABS NAVIGATION (Cleaned) --- */}
      <div className="flex items-center px-2 py-2 gap-1 border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar">
         {[
             { id: 'general', icon: Settings, label: 'General' },
             { id: 'code', icon: Code, label: 'Code' },
             { id: 'security', icon: ShieldCheck, label: 'Security' },
         ].map((tab) => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
             >
                 <tab.icon size={12} />
                 {tab.label}
             </button>
         ))}
      </div>

      <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
         {renderContent()}
      </div>

    </aside>
  );
}