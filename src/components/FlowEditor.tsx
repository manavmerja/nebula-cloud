'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    ReactFlowProvider, // Provider add kiya taaki instance access kar sakein
    useReactFlow,
  Node as RFNode,
} from 'reactflow';
import { Play } from 'lucide-react'; // Play icon

import 'reactflow/dist/style.css';
import PromptNode from './nodes/PromptNode';
import AINode from './nodes/AINode';
import ResultNode from './nodes/ResultNode';
import GlassContainer from './nodes/GlassContainer';
// --- INITIAL DATA ---
const initialNodes: RFNode[] = [
    { id: '1', type: 'promptNode', data: { text: '' }, position: { x: 50, y: 200 } },
    { id: '2', type: 'aiNode', data: { model: 'groq-llama' }, position: { x: 450, y: 200 } },
    { id: '3', type: 'resultNode', data: { output: '' }, position: { x: 850, y: 200 } },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#22d3ee', strokeWidth: 2 } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
];

// Define Node Types outside component to prevent re-renders
const nodeTypes = {
    promptNode: PromptNode,
    aiNode: AINode,
    resultNode: ResultNode,
};

function Flow() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // 1. User Input ko Track karne ke liye State
    const [userInput, setUserInput] = useState('');

    // 2. Jab Node 1 (Input) me type ho, tab ye function chalega
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === '1') {
                    // Custom node ke input change ko pakadne ke liye hum data update kar rahe hain
                    // Note: Real world me hum onChange handler pass karte hain, abhi ke liye simple rakhte hain
                    node.data = { ...node.data, text: userInput };
                }
                return node;
            })
        );
    }, [userInput, setNodes]);

    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    // --- 3. RUN BUTTON LOGIC ---
    const runFlow = () => {
        // A. Node 1 se text nikalo (Abhi ke liye hum state use karenge)
        // Note: React Flow me data extraction thoda tricky hota hai, isliye hum state use kar rahe hain.

        // Check karein input hai ya nahi
        const inputNode = nodes.find(n => n.id === '1');
        const promptText = inputNode?.data?.text || "No input provided";

        console.log("Running Flow with:", promptText);

        // B. Loading State dikhao (Node 3 me)
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === '3') {
                    return { ...node, data: { ...node.data, output: 'Processing AI Response...' } };
                }
                return node;
            })
        );

        // C. MOCK AI CALL (Asli API baad me lagayenge)
        setTimeout(() => {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === '3') {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                output: `AI Response to: "${promptText}"\n\nThis is a simulated response from the AI Engine. The system is working!`
                            }
                        };
                    }
                    return node;
                })
            );
        }, 2000); // 2 second ka delay
    };

    return (
        <GlassContainer>

            {/* --- RUN BUTTON (Floating) --- */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={runFlow}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all transform hover:scale-105"
                >
                    <Play size={18} fill="white" />
                    Run Flow
                </button>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                style={{ background: '#000' }}
            >
                <Controls style={{ filter: 'invert(1)' }} />
                <MiniMap nodeColor="#6865A5" style={{ backgroundColor: '#141414' }} maskColor="rgba(0,0,0, 0.7)" />
                <Background color="#555" gap={20} size={1} />
            </ReactFlow>
        </GlassContainer>
    );
}

// Wrap in Provider
export default function FlowEditor() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    )
}