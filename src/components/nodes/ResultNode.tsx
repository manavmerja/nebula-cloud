import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Terminal, RefreshCw, Check, Copy } from 'lucide-react';
import Editor from '@monaco-editor/react';

// Props define kar rahe hain ki parent se kya milega
interface ResultNodeProps {
  data: {
    output: string;
    onSync: (newCode: string) => void; // New function to talk to parent
  }
}

function ResultNode({ data }: ResultNodeProps) {
  const [code, setCode] = useState('');
  const [summary, setSummary] = useState('');
  const [isDirty, setIsDirty] = useState(false); // Kya user ne kuch change kiya?
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Jab Backend se naya data aaye, tab editor update karo
  useEffect(() => {
    if (data.output) {
      const parts = data.output.split('TERRAFORM CODE:');
      setSummary(parts[0]?.replace('SUMMARY:', '').trim());
      setCode(parts[1]?.trim() || '');
      setIsDirty(false); // Reset dirty state
    }
  }, [data.output]);

  // Handle Code Change
  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
    setIsDirty(true); // User ne kuch type kiya hai!
  };

  // Handle Sync Button Click
  const handleSyncClick = async () => {
    setSyncing(true);
    // Parent function call karenge (FlowEditor.tsx me logic hoga)
    await data.onSync(code);
    setSyncing(false);
    setIsDirty(false);
  };

  return (
    <div className="rounded-xl border border-green-500/50 bg-black/90 shadow-2xl w-[500px] overflow-hidden flex flex-col h-[500px]">

      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2 border-b border-green-500/30">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-green-400" />
          <span className="text-sm font-bold text-green-100">
            {isDirty ? 'Unsaved Changes*' : 'Infrastructure Code'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            onClick={copyCode}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
              copied ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            title="Copy code"
          >
            <Copy size={12} />
            {copied ? 'Copied!' : 'Copy'}
          </button>

          {/* Sync Button (Sirf tab dikhega jab changes honge) */}
          {isDirty && (
            <button
              onClick={handleSyncClick}
              disabled={syncing}
              className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-all ${syncing ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse'
                }`}
            >
              {syncing ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              {syncing ? 'Syncing...' : 'Update Diagram'}
            </button>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-green-500" />

      {/* Editor Area */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="hcl" // Terraform language support
          theme="vs-dark" // VS Code Dark Theme
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false }, // Chhota map hide kiya space bachane ke liye
            fontSize: 12,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Summary Footer */}
      {summary && (
        <div className="bg-gray-900/90 p-2 border-t border-gray-800 text-[10px] text-gray-400 truncate px-4">
          ℹ️ {summary}
        </div>
      )}
    </div>
  );
}

export default memo(ResultNode);