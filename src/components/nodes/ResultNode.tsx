import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Terminal, RefreshCw, Download } from 'lucide-react'; // 1. Download Icon import kiya
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
  const [isDirty, setIsDirty] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (data.output) {
      const parts = data.output.split('TERRAFORM CODE:');
      setSummary(parts[0]?.replace('SUMMARY:', '').trim());
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

  // 2. New Download Logic 📥
  // Note: Hum 'code' state use kar rahe hain. 
  // Agar user ne editor me changes kiye hain, to wo bhi download honge!
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

      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2 border-b border-green-500/30">
        
        {/* Left Side: Title */}
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-green-400" />
          <span className="text-sm font-bold text-green-100">
            {isDirty ? 'Unsaved Changes*' : 'Infrastructure Code'}
          </span>
        </div>

        {/* Right Side: Actions Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Sync Button (Existing) */}
          {isDirty && (
            <button
              onClick={handleSyncClick}
              disabled={syncing}
              className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-all ${
                syncing ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse'
              }`}
            >
              {syncing ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              {syncing ? 'Syncing...' : 'Update'}
            </button>
          )}

          {/* 3. New Download Button (Always Visible if code exists) ⬇️ */}
          {code && (
            <button
              onClick={handleDownload}
              title="Download main.tf"
              className="flex items-center gap-2 px-3 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black transition-all"
            >
              <Download size={14} />
              <span>.tf</span>
            </button>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-green-500" />

      {/* Editor Area (Monaco) */}
      <div className="flex-1 relative">
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

      {/* Footer Summary */}
      {summary && (
        <div className="bg-gray-900/90 p-2 border-t border-gray-800 text-[10px] text-gray-400 truncate px-4 flex items-center gap-2">
          <span>ℹ️</span>
          <span className="truncate">{summary}</span>
        </div>
      )}
    </div>
  );
}

export default memo(ResultNode);