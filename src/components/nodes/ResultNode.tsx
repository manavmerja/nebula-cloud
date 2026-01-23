import React, { memo, useState, useEffect, useRef } from "react";
import { Handle, Position } from "reactflow";
import { Terminal, RefreshCw, Download, DollarSign } from "lucide-react";
import Editor from "@monaco-editor/react";

/* ---------------- SYSTEM LOGS ---------------- */

const SYSTEM_LOGS = `INITIALIZING AI ARCHITECT...
> TURNING THOUGHTS INTO INFRASTRUCTURE.
> ELIMINATING MANUAL CONFIGURATION.
> CLOUD ENGINEERING: SOLVED.

> SYSTEM STATUS:
  - Creativity: UNLIMITED
  - Speed: INSTANT
  - Your Vision: DEPLOYED.`;

/* ---------------- TYPES ---------------- */

interface ResultNodeProps {
  data: {
    output: string;
    onSync: (newCode: string) => Promise<void>;
  };
}

/* ---------------- COMPONENT ---------------- */

function ResultNode({ data }: ResultNodeProps) {
  const [displayedCode, setDisplayedCode] = useState("");
  const [cost, setCost] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isUserInteracting = useRef(false);

  /* ---------------- UTIL ---------------- */

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  /* ---------------- FEATURE LOOP ---------------- */

  const startFeatureLoop = () => {
    // 1. Safety check & Reset
    if (isUserInteracting.current) return;
    clearAllTimeouts();
    setDisplayedCode("");

    const fullText = SYSTEM_LOGS;
    const typingSpeed = 40;
    const deleteSpeed = 20; // Fast delete
    const pauseBeforeDelete = 1500;

    // ---------------- HELPER FUNCTIONS ---------------- //

   const typeNextChar = (index: number) => {
      if (isUserInteracting.current) return;

      if (index <= fullText.length) {
        setDisplayedCode(fullText.slice(0, index));
        // Agla char type karne ke liye
        const t = setTimeout(() => typeNextChar(index + 1), typingSpeed);
        timeoutsRef.current.push(t);
      } else {
        // Typing khatam -> Wait -> Start Delete
        const t = setTimeout(() => deleteNextChar(fullText.length), pauseBeforeDelete);
        timeoutsRef.current.push(t);
      }
    };

    // ---------------- HELPER 2: DELETING (Backward) ---------------- //
    const deleteNextChar = (index: number) => {
      if (isUserInteracting.current) return;

      // 1. Update Text (Slice 0 to index)
      setDisplayedCode(fullText.slice(0, index));

      // 2. Logic to continue or stop
      if (index > 0) {
        // Agar text bacha hai, to agla mitane ke liye timeout set karein
        const t = setTimeout(() => deleteNextChar(index - 1), deleteSpeed);
        timeoutsRef.current.push(t);
      } else {
        // Index 0 matlab sab mit gaya -> Restart Loop
        const t = setTimeout(startFeatureLoop, 500);
        timeoutsRef.current.push(t);
      }
    };

    // ---------------- START ---------------- //
    typeNextChar(0);
  };

  /* ---------------- REAL OUTPUT HANDLER ---------------- */

  const handleActualOutput = (output: string) => {
    clearAllTimeouts();
    isUserInteracting.current = true;

    const parts = output.split("TERRAFORM CODE:");
    const summary = parts[0]?.replace("SUMMARY:", "").trim();
    const code = parts[1]?.trim() || "";

    const costMatch = summary?.match(/\$\d+(\.\d{2})?/);
    if (costMatch) setCost(costMatch[0]);

    let currentText = "";
    setDisplayedCode("");

    // Output animation (Simple loop for real data)
    code.split("").forEach((char, index) => {
      const t = setTimeout(() => {
        currentText += char;
        setDisplayedCode(currentText);
      }, index * 20);

      timeoutsRef.current.push(t);
    });
  };

  // /* ---------------- EFFECT ---------------- *
  useEffect(() => {
    if (data.output) {
      handleActualOutput(data.output);
      return;
    }

    startFeatureLoop();
    return clearAllTimeouts;
  }, [data.output]);

  /* ---------------- EDIT HANDLERS ---------------- */

  const handleEditorChange = (value?: string) => {
    isUserInteracting.current = true;
    setDisplayedCode(value || "");
    setIsDirty(true);
  };

  const handleSyncClick = async () => {
    setSyncing(true);
    await data.onSync(displayedCode);
    setSyncing(false);
    setIsDirty(false);
  };

  const handleDownload = () => {
    const blob = new Blob([displayedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "main.tf";
    a.click();

    URL.revokeObjectURL(url);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="rounded-xl border border-green-500/50 bg-black/90 shadow-2xl w-[500px] h-[500px] flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-3 border-b border-green-500/30">
        <div className="flex items-center gap-3">
          <Terminal size={16} className="text-green-400" />
          <span className="text-sm font-bold text-green-100">
            Infrastructure
          </span>

          {cost && (
            <div className="flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded text-xs font-mono text-green-400 border border-green-500/30">
              <DollarSign size={10} />
              {cost}/mo
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {isDirty && (
            <button
              onClick={handleSyncClick}
              disabled={syncing}
              className={`px-3 py-1 rounded text-xs font-bold ${
                syncing
                  ? "bg-gray-600"
                  : "bg-blue-600 hover:bg-blue-500 animate-pulse"
              }`}
            >
              <RefreshCw
                size={12}
                className={syncing ? "animate-spin" : ""}
              />
            </button>
          )}

          {displayedCode && (
            <button
              onClick={handleDownload}
              className="px-3 py-1 rounded text-xs font-bold bg-gray-800 text-gray-300 hover:bg-green-500 hover:text-black"
            >
              <Download size={14} /> .tf
            </button>
          )}
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-green-500"
      />

      {/* EDITOR */}
      <div className="flex-1 bg-[#1e1e1e]">
        <Editor
          height="100%"
          theme="vs-dark"
          defaultLanguage="yaml"
          value={displayedCode}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "Fira Code, Consolas, monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 15 },
            cursorBlinking: "smooth",
            smoothScrolling: true,
            renderLineHighlight: "none",
          }}
        />
      </div>
    </div>
  );
}

export default memo(ResultNode);
