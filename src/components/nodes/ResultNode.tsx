import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Terminal, Copy } from 'lucide-react';
import GlassContainer from '../nodes/GlassContainer';

function ResultNode({ data }: { data: { output?: string } }) {

    // Chhota sa function copy karne ke liye (Optional interaction)
    const copyToClipboard = () => {
        if (data.output) {
            navigator.clipboard.writeText(data.output);
            alert("Copied to clipboard!");
        }
    };

    return (
        // Node Container - Green Border
        <GlassContainer>

            {/* Input Handle (Left Side) - Data aane ke liye */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 !bg-green-500 !border-2 !border-white"
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-3 border-b border-gray-700 pb-2">
                <div className="flex items-center">
                    <Terminal className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-gray-100 font-bold text-sm uppercase tracking-widest">System Output</span>
                </div>

                {/* Copy Button Icon */}
                <button
                    onClick={copyToClipboard}
                    className="text-gray-400 hover:text-green-400 transition-colors"
                    title="Copy Output"
                >
                    <Copy size={14} />
                </button>
            </div>

            {/* Output Display Area */}
            <div className="flex flex-col">
                <div className="bg-black/80 p-3 rounded border border-green-900/50 min-h-[100px] max-h-[300px] overflow-y-auto">
                    {data.output ? (
                        <p className="text-xs text-green-100 font-mono leading-relaxed whitespace-pre-wrap">
                            {data.output}
                        </p>
                    ) : (
                        <p className="text-xs text-gray-600 font-mono italic">
                            Waiting for signal...
                        </p>
                    )}
                </div>

                {/* Footer Info */}
                <div className="flex justify-end mt-2">
                    <span className="text-[10px] text-gray-500">Read-Only Mode</span>
                </div>
            </div>
        </GlassContainer>
    );
}

export default memo(ResultNode);