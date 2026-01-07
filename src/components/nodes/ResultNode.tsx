import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Terminal, RefreshCw, Download, DollarSign } from 'lucide-react'; // Dollar Icon
import Editor from '@monaco-editor/react';

interface ResultNodeProps {
  data: {
    output: string;
    onSync: (newCode: string) => void;
  }
}

function ResultNode({ data }: ResultNodeProps) {
  const [code, setCode] = useState('');
  const [summary, setSummary] = useState('');
  const [cost, setCost] = useState<string | null>(null); // State for Cost
  const [isDirty, setIsDirty] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (data.output) {
      // 1. Parse Logic
      const parts = data.output.split('TERRAFORM CODE:');
      const rawSummary = parts[0]?.replace('SUMMARY:', '').trim();
      
      // 2. Cost Extract Karo (Regex se) 💰
      // Dhoondo agar kahi '$' aur number likha hai
      const costMatch = rawSummary.match(/\$\d+(\.\d{2})?/);
      if (costMatch) {
        setCost(costMatch[0]); // e.g., "$18.00"
      }

      setSummary(rawSummary);
      setCode(parts[1]?.trim() || '');
      setIsDirty(false);
    }
  }, [data.output]);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
    setIsDirty(true);
  };

  const handleSyncClick = async () => {
    setSyncing(true);
    await data.onSync(code);
    setSyncing(false);
    setIsDirty(false);
  };

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'main.tf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-green-500/50 bg-black/90 shadow-2xl w-[500px] overflow-hidden flex flex-col h-[500px]">

      {/* --- HEADER START --- */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-3 border-b border-green-500/30">
        
        {/* Left: Title + Cost Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-green-400" />
            <span className="text-sm font-bold text-green-100">
              Infrastructure
            </span>
          </div>

          {/* 💰 COST BADGE (Visible in Header) */}
          {cost && (
            <div className="flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded text-xs font-mono text-green-400 border border-green-500/30">
              <DollarSign size={10} />
              <span>{cost}/mo</span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Sync Button */}
          {isDirty && (
            <button
              onClick={handleSyncClick}
              disabled={syncing}
              className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-all ${
                syncing ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse'
              }`}
            >
              {syncing ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            </button>
          )}

          {/* Download Button */}
          {code && (
            <button
              onClick={handleDownload}
              title="Download main.tf"
              className="flex items-center gap-2 px-3 py-1 rounded text-xs font-bold bg-gray-800 text-gray-300 hover:bg-green-500 hover:text-black transition-all"
            >
              <Download size={14} />
              <span>.tf</span>
            </button>
          )}
        </div>
      </div>
      {/* --- HEADER END --- */}

      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-green-500" />

      {/* Editor Area */}
      <div className="flex-1 relative bg-[#1e1e1e]">
        <Editor
          height="100%"
          defaultLanguage="hcl"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 10 }
          }}
        />
      </div>
      
      {/* Note: Maine Footer hata diya kyunki Cost ab upar Header me hai */}
    </div>
  );
}

export default memo(ResultNode);