import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Server, Zap, Shield } from 'lucide-react'; // Icons import kiye

function AINode({ data }: { data: { model?: string } }) {
    return (
        // Node Container - Cyan Border
        <div className="px-4 py-3 shadow-lg rounded-xl bg-gray-900/90 border-2 border-cyan-500 backdrop-blur-md min-w-[280px]">

            {/* Input Handle (Left Side) - Data aane ke liye */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 !bg-cyan-500 !border-2 !border-white"
            />

            {/* Header */}
            <div className="flex items-center mb-3 border-b border-gray-700 pb-2">
                <Server className="w-4 h-4 text-cyan-400 mr-2" />
                <span className="text-gray-100 font-bold text-sm uppercase tracking-widest">AI Engine</span>
            </div>

            {/* Dropdown Section */}
            <div className="flex flex-col gap-3">

                {/* Model Selector */}
                <div>
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">Select Model Pipeline</label>
                    <select
                        className="nodrag w-full mt-1 bg-black/60 text-cyan-100 text-xs p-2 rounded border border-gray-600 focus:outline-none focus:border-cyan-500 cursor-pointer"
                        defaultValue={data.model || 'groq-llama'}
                    >
                        <option value="groq-llama">⚡ Groq (Llama 3) + Fallback</option>
                        <option value="gemini-pro">🛡️ Gemini Pro Only</option>
                    </select>
                </div>

                {/* Status Indicator (Fake for now) */}
                <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-gray-800">
                    <div className="flex items-center gap-2">
                        <Zap size={12} className="text-yellow-400" />
                        <span className="text-[10px] text-gray-400">Latency:</span>
                    </div>
                    <span className="text-[10px] text-green-400 font-mono">~45ms</span>
                </div>
            </div>

            {/* Output Handle (Right Side) - Result bhejne ke liye */}
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 !bg-cyan-500 !border-2 !border-white"
            />
        </div>
    );
}

export default memo(AINode);