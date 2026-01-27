import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Terminal, RefreshCw, Download, DollarSign, Eye, EyeOff, Wand2, Hammer } from 'lucide-react'; // Hammer icon added for Build
import Editor from '@monaco-editor/react';

interface ResultNodeProps {
  data: {
    output?: string;
    terraformCode?: string;
    summary?: string;
    auditReport?: any[];
    onSync: (newCode: string) => void;
    onFixComplete?: (fixResult: any) => void;
    onVisualSync?: () => Promise<void>; // 👈 Support for Visual Sync
  }
}

function ResultNode({ data }: ResultNodeProps) {
  const [code, setCode] = useState('// Waiting for infrastructure...');
  const [cost, setCost] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [visualSyncing, setVisualSyncing] = useState(false); // 👈 State for Build Button

  // Check if there are any errors to fix
  const hasIssues = data.auditReport && data.auditReport.length > 0;

  useEffect(() => {
    let rawCode = "";
    let rawSummary = "";

    // 1. Direct Code (Priority)
    if (data.terraformCode && data.terraformCode.length > 0) {
      rawCode = data.terraformCode;
      rawSummary = data.summary || "";
    } 
    // 2. Fallback
    else if (data.output) {
       if (data.output.includes('TERRAFORM CODE:')) {
          const parts = data.output.split('TERRAFORM CODE:');
          rawSummary = parts[0]?.replace('SUMMARY:', '').trim();
          rawCode = parts[1]?.trim();
       } else {
          rawCode = data.output;
       }
    }

    // 3. Clean and Set
    if (rawCode) {
        if (rawCode.trim().startsWith('"') && rawCode.trim().endsWith('"')) {
            rawCode = rawCode.trim().slice(1, -1);
        }
        rawCode = rawCode.split('\\n').join('\n');
        setCode(rawCode);
    }

    // 4. Extract Cost
    if (rawSummary) {
        const costMatch = rawSummary.match(/\$\d+(\.\d{2})?/);
        if (costMatch) setCost(costMatch[0]);
    }

    setIsDirty(false);

  }, [data]);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
    setIsDirty(true);
  };

  // --- ✨ AUTO-FIX LOGIC ---
  const handleAutoFix = async () => {
    if (!data.onFixComplete) return;
    
    setFixing(true);
    try {
        const response = await fetch('/api/fix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                terraformCode: code,
                auditReport: data.auditReport
            })
        });

        const result = await response.json();
        if (result.error) throw new Error(result.error);

        data.onFixComplete(result);
        alert("Issues Fixed Successfully! ✅");

    } catch (error: any) {
        console.error("Fixing Failed:", error);
        alert(`Fix Failed: ${error.message}`);
    } finally {
        setFixing(false);
    }
  };

  // --- 🔄 VISUAL SYNC (BUILD) LOGIC ---
  const handleVisualSync = async () => {
    if (!data.onVisualSync) return;
    setVisualSyncing(true);
    await data.onVisualSync();
    setVisualSyncing(false);
  };

  const handleSyncClick = async () => {
    setSyncing(true);
    if (data.onSync) await data.onSync(code);
    setSyncing(false);
    setIsDirty(false);
  };

  const handleDownload = () => {
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
    <div className={`rounded-xl border bg-black/90 shadow-2xl w-[600px] overflow-hidden flex flex-col h-[600px] font-sans transition-all duration-500 ${hasIssues ? 'border-red-500/50 shadow-red-900/20' : 'border-green-500/50'}`}>
      
      {/* HEADER */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${hasIssues ? 'bg-red-950/20 border-red-500/20' : 'bg-[#111] border-green-500/20'}`}>
        <div className="flex items-center gap-3">
          <Terminal size={16} className={hasIssues ? "text-red-400" : "text-green-400"} />
          <span className="text-sm font-bold text-gray-200">
            {hasIssues ? `${data.auditReport?.length} Issues Detected` : 'Infrastructure Code'}
          </span>
          {/* Cost badge... */}
        </div>

        <div className="flex items-center gap-2">
          
          {/* 1. ✨ FIX BUTTON (Only visible if issues exist) */}
          {hasIssues && (
            <button
              onClick={handleAutoFix}
              disabled={fixing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg ${
                fixing 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-red-500/20 animate-pulse'
              }`}
            >
              <Wand2 size={12} className={fixing ? "animate-spin" : ""} />
              {fixing ? 'Fixing...' : 'Fix Issues'}
            </button>
          )}

          {/* 2. 🔄 BUILD CODE BUTTON (ALWAYS VISIBLE NOW) 🔨 */}
          {/* Removed the !hasIssues check so you can sync drag & drop changes anytime */}
           <button
             onClick={handleVisualSync}
             disabled={visualSyncing || fixing}
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg ${
               visualSyncing 
                 ? 'bg-gray-700 cursor-not-allowed' 
                 : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20'
             }`}
             title="Generate Code from Diagram"
           >
             <Hammer size={12} className={visualSyncing ? "animate-spin" : ""} />
             {visualSyncing ? 'Building...' : 'Build Code'}
           </button>

          <div className="h-4 w-px bg-gray-700 mx-1" />

          {/* ... Rest of the buttons (Sync, View, Download) ... */}
          {isDirty && !hasIssues && (
            <button onClick={handleSyncClick} disabled={syncing} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold ${syncing ? 'bg-gray-700' : 'bg-blue-600 text-white'}`}>
              <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />Sync
            </button>
          )}
          {/* View Toggle & Download buttons... */}
          <button onClick={() => setShowRaw(!showRaw)} className="text-gray-400 hover:text-white" title="Toggle Debug View">
            {showRaw ? <EyeOff size={14}/> : <Eye size={14}/>}
          </button>
          <button onClick={handleDownload} disabled={!code} className="text-gray-400 hover:text-white"><Download size={16} /></button>
        </div>
      </div>

      
      <Handle type="target" position={Position.Left} className={`!w-3 !h-3 !border-0 ${hasIssues ? '!bg-red-500' : '!bg-green-500'}`} />

      {/* EDITOR AREA */}
      <div className="flex-1 relative bg-[#1e1e1e]">
        {showRaw ? (
             <textarea 
                className="w-full h-full bg-black text-green-400 p-4 font-mono text-xs" 
                value={code} 
                readOnly 
             />
        ) : (
            <Editor
                key={code.length}
                height="100%"
                defaultLanguage="hcl"
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    readOnly: fixing 
                }}
            />
        )}
      </div>
    </div>
  );
}

export default memo(ResultNode);