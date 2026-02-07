import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import {
    Terminal, RefreshCw, Download, DollarSign,
    Wand2, Hammer, Copy, Check, TrendingUp
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useToast } from '@/context/ToastContext';

interface ResultNodeProps {
  data: {
    output?: string;
    terraformCode?: string;
    summary?: string;
    auditReport?: any[];
    onSync: (newCode: string) => void;
    onFixComplete?: (fixResult: any) => void;
    onVisualSync?: () => Promise<void>;
  }
}

function ResultNode({ data }: ResultNodeProps) {
  const [code, setCode] = useState('// Waiting for infrastructure...');
  const [cost, setCost] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [visualSyncing, setVisualSyncing] = useState(false);
  const [copied, setCopied] = useState(false);

  const toast = useToast();
  const hasIssues = data.auditReport && data.auditReport.length > 0;

  useEffect(() => {
    let rawCode = "";

    // 1. Get Code
    if (data.terraformCode && data.terraformCode.length > 0) {
      rawCode = data.terraformCode;
    } else if (data.output) {
       if (data.output.includes('TERRAFORM CODE:')) {
          rawCode = data.output.split('TERRAFORM CODE:')[1]?.trim();
       } else {
          rawCode = data.output;
       }
    }

    // 2. Set Code State
    if (rawCode) {
        if (rawCode.trim().startsWith('"') && rawCode.trim().endsWith('"')) {
            rawCode = rawCode.trim().slice(1, -1);
        }
        rawCode = rawCode.split('\\n').join('\n');
        setCode(rawCode);
    }

    // 3. 🧠 UPDATED COST EXTRACTION LOGIC
    // We search the entire output string for a price pattern
    const fullText = (data.summary || "") + (data.output || "");

    // Regex matches: $ followed by numbers, optional commas, optional decimals
    // Examples: $45, $1,200.00, $ 50.5
    const costMatch = fullText.match(/\$\s?[\d,]+(\.\d{2})?/);

    if (costMatch) {
        setCost(costMatch[0].replace(/\s/g, '')); // Remove spaces (e.g. "$ 50" -> "$50")
    } else {
        setCost(null);
    }

    setIsDirty(false);
  }, [data]);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
    setIsDirty(true);
  };

  const handleAutoFix = async () => {
    if (!data.onFixComplete) return;
    setFixing(true);
    try {
        const response = await fetch('/api/fix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ terraformCode: code, auditReport: data.auditReport })
        });
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        data.onFixComplete(result);
        toast.success("Issues Fixed Successfully! ✅");
    } catch (error: any) {
        console.error("Fixing Failed:", error);
        toast.error(`Fix Failed: ${error.message}`);
    } finally {
        setFixing(false);
    }
  };

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

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard! 📋");
    setTimeout(() => setCopied(false), 2000);
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
    toast.info("Downloading main.tf...");
  };

  return (
    <div
    id="nebula-result-node"
    className={`rounded-xl border bg-black/90 shadow-2xl w-[600px] overflow-hidden flex flex-col h-[600px] font-sans transition-all duration-500 ${hasIssues ? 'border-red-500/50 shadow-red-900/20' : 'border-green-500/50'}`}>

      {/* HEADER */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${hasIssues ? 'bg-red-950/20 border-red-500/20' : 'bg-[#111] border-green-500/20'}`}>
        <div className="flex items-center gap-3">
          <Terminal size={16} className={hasIssues ? "text-red-400" : "text-green-400"} />
          <span className="text-sm font-bold text-gray-200">
            {hasIssues ? `${data.auditReport?.length} Issues Detected` : 'Infrastructure Code'}
          </span>
        </div>

        {/* 🌟 COST BADGE 🌟 */}
        {cost && (
             <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] group cursor-help transition-all hover:border-emerald-500/60" title="Estimated Monthly Cost">
                 <div className="bg-emerald-500/20 p-1 rounded-full">
                    <TrendingUp size={12} className="text-emerald-400" />
                 </div>
                 <span className="text-xs font-bold text-emerald-100 tabular-nums tracking-wide">{cost}/mo</span>
             </div>
        )}

        <div className="flex items-center gap-2">

          {hasIssues && (
            <button
              onClick={handleAutoFix}
              disabled={fixing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg ${
                fixing ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-red-500/20 animate-pulse'
              }`}
            >
              <Wand2 size={12} className={fixing ? "animate-spin" : ""} />
              {fixing ? 'Fixing...' : 'Fix Issues'}
            </button>
          )}

           <button
             onClick={handleVisualSync}
             disabled={visualSyncing || fixing}
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg ${
               visualSyncing ? 'bg-gray-700 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20'
             }`}
             title="Generate Code from Diagram"
           >
             <Hammer size={12} className={visualSyncing ? "animate-spin" : ""} />
             {visualSyncing ? 'Building...' : 'Build Code'}
           </button>

          <div className="h-4 w-px bg-gray-700 mx-1" />

          {isDirty && !hasIssues && (
            <button onClick={handleSyncClick} disabled={syncing} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold ${syncing ? 'bg-gray-700' : 'bg-blue-600 text-white'}`}>
              <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />Sync
            </button>
          )}

          <button onClick={handleCopy} disabled={!code} className={`transition-colors ${copied ? 'text-green-400' : 'text-gray-400 hover:text-white'}`} title="Copy Code">
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>

          <button onClick={handleDownload} disabled={!code} className="text-gray-400 hover:text-white"><Download size={20} /></button>
        </div>
      </div>

      <Handle type="target" position={Position.Left} className={`!w-3 !h-3 !border-0 ${hasIssues ? '!bg-red-500' : '!bg-green-500'}`} />

      {/* EDITOR AREA */}
      <div className="flex-1 relative bg-[#1e1e1e]">
        <Editor
            key={code.length}
            height="100%"
            defaultLanguage="hcl"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{ minimap: { enabled: false }, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", automaticLayout: true, scrollBeyondLastLine: false, readOnly: fixing }}
        />
      </div>
    </div>
  );
}

export default memo(ResultNode);