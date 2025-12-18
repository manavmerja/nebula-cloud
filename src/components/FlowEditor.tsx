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
    ReactFlowProvider,
    useReactFlow,
    MarkerType, // Arrow heads ke liye
    Node,
} from 'reactflow';
import { Play, Loader2 } from 'lucide-react'; // Loader icon add kiya

import 'reactflow/dist/style.css';
import PromptNode from './nodes/PromptNode';
import AINode from './nodes/AINode';
import ResultNode from './nodes/ResultNode';

// --- TYPES ---
type NodeData = {
    text?: string;
    model?: string;
    output?: string;
    label?: string;
};

// --- INITIAL DATA ---
const initialNodes: Node<NodeData>[] = [
    { id: '1', type: 'promptNode', data: { text: '' }, position: { x: 50, y: 250 } },
    { id: '2', type: 'aiNode', data: { model: 'groq-llama' }, position: { x: 450, y: 250 } },
    { id: '3', type: 'resultNode', data: { output: '' }, position: { x: 900, y: 250 } },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#22d3ee' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#22c55e' } },
];

const nodeTypes = {
    promptNode: PromptNode,
    aiNode: AINode,
    resultNode: ResultNode,
};

function Flow() {
    const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false); // Loading state

    // Input sync logic
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === '1') {
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

    // --- THE REAL LOGIC ---
    const runFlow = async () => {
        // 1. Get Input
        const inputNode = nodes.find(n => n.id === '1');
        const promptText = inputNode?.data?.text;

        if (!promptText) {
            alert("Please enter a prompt first!");
            return;
        }

        setLoading(true);

        // UI Update: Show "Processing..." in Result Node
        setNodes((nds) => nds.map((n) =>
            n.id === '3' ? { ...n, data: { ...n.data, output: "Generating Architecture..." } } : n
        ));

        try {
            // 2. Call API
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptText }),
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            // --- MAGIC: Handle the JSON Response ---

            // A. Update Output Text (Summary + Terraform)
            const finalOutput = `SUMMARY:\n${data.summary}\n\nTERRAFORM CODE:\n${data.terraformCode}`;

            setNodes((nds) => nds.map((n) =>
                n.id === '3' ? { ...n, data: { ...n.data, output: finalOutput } } : n
            ));

            // B. Create NEW Visual Nodes (Architecture)
            // Hum naye nodes ko input aur output ke beech me place karenge
            const newGeneratedNodes = data.nodes.map((node: any, index: number) => ({
                id: node.id,
                type: 'default', // Standard styling for now
                data: { label: node.label }, // Label from API
                position: { x: 450 + (index * 200), y: 400 + (index % 2 * 100) }, // Thoda neeche (offset)
                style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #38bdf8',
                    width: 150,
                    fontSize: '12px'
                }
            }));

            // C. Create New Edges
            const newGeneratedEdges = data.edges.map((edge: any) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                animated: true,
                style: { stroke: '#94a3b8' },
                markerEnd: { type: MarkerType.ArrowClosed },
            }));

            // D. Update Graph (Existing + New)
            // Hum purane nodes rakhenge, bas beech me naye add kar denge
            setNodes((prev) => [...prev, ...newGeneratedNodes]);
            setEdges((prev) => [...prev, ...newGeneratedEdges]);

        } catch (error: any) {
            console.error("Error:", error);
            setNodes((nds) => nds.map((n) =>
                n.id === '3' ? { ...n, data: { ...n.data, output: `Error: ${error.message}` } } : n
            ));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full h-full">
            {/* Run Button */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={runFlow}
                    disabled={loading}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold shadow-lg transition-all ${loading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105'
                        } text-white`}
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="white" />}
                    {loading ? 'Designing...' : 'Run Architect'}
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
        </div>
    );
}

export default function FlowEditor() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    )
}