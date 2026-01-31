import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow'; // useReactFlow import kiya

function PromptNode({ id, data }: { id: string, data: { text: string } }) { // 'id' prop bhi liya
    const { setNodes } = useReactFlow(); // React flow hook

    // Jab user type karega
    const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = evt.target.value;

        // Hum seedha React Flow ka global state update kar rahe hain
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    // Data update karo
                    return { ...node, data: { ...node.data, text: newVal } };
                }
                return node;
            })
        );
    };

    return (
        <div
        id="nebula-input-node"
        className="px-4 py-2 shadow-md rounded-md bg-gray-900/80 border-2 border-purple-500 backdrop-blur-md min-w-[250px]">
            <div className="flex items-center mb-2 border-b border-gray-700 pb-2">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2 shadow-[0_0_10px_#a855f7]"></div>
                <span className="text-gray-200 font-bold text-sm uppercase tracking-wider">User Input</span>
            </div>

            <div className="flex flex-col">
                <label className="text-xs text-gray-400 mb-1">Enter your prompt:</label>
                <textarea
                    className="nodrag bg-black/50 text-white text-xs p-2 rounded border border-gray-700 focus:outline-none focus:border-purple-500 resize-none h-20"
                    placeholder="Type here..."
                    defaultValue={data.text} // Default value
                    onChange={handleChange}  // <--- Ye joda humne
                />
            </div>

            <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-purple-500 !border-2 !border-white" />
        </div>
    );
}

export default memo(PromptNode);