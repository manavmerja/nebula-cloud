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
import CloudServiceNode from './nodes/CloudServiceNode';
import Sidebar from './Sidebar';

// --- TYPES ---
type NodeData = {
    text?: string;
    model?: string;
    output?: string;
    label?: string;
    onSync?: (newCode: string) => Promise<void>; // For synchronizing code with visuals
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
    cloudNode: CloudServiceNode,
};

function Flow() {
    const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

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
        (params: Edge | Connection) => {
            // 1. Edge Create Karo
            setEdges((eds) => addEdge(params, eds));
            
            // 2. Naya Edge List calculate karo
            // Note: addEdge returns a NEW array
            const newEdges = addEdge(params, edges);

            // 3. TRIGGER SYNC
            triggerVisualSync(nodes, newEdges);
        },
        [setEdges, nodes, edges], // Dependencies check kar lena
    );

    // --- DRAG & DROP LOGIC START ---
    
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            // Check karo ki React Flow load hua hai ya nahi
            if (!reactFlowInstance) return;

            // Sidebar se data nikalo
            const dataStr = event.dataTransfer.getData('application/reactflow');
            if (!dataStr) return;

            const { type, label } = JSON.parse(dataStr);

            // 1. Mouse position calculate karo
            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // 2. Naya Node banao
            const newNode: Node = {
                id: `${type}-${Date.now()}`, // Unique ID based on time
                type,
                position,
                data: { label: label }, // EC2, S3, etc.
            };

            // 3. State update karo (Visual add ho jayega)
            setNodes((nds) => nds.concat(newNode));
            
          // 2. TRIGGER SYNC (Backend ko batane ke liye)
            // Hum 'nodes.concat(newNode)' bhej rahe hain taaki latest list jaye
            triggerVisualSync(nodes.concat(newNode), edges); 
        },
        [reactFlowInstance, nodes, edges, setNodes], // 'nodes' aur 'edges' dependency add karna zaroori hai

    );

    // --- DRAG & DROP LOGIC END ---

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
            const response = await fetch('http://localhost:8000/api/v1/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptText }),
            });

            // Inside runFlow function...

            const data = await response.json(); // Backend response

            // ERROR HANDLING
            if (data.detail) throw new Error(data.detail); // FastAPI errors 'detail' me aate hain

            // NAME MATCHING (Backend: terraform_code -> Frontend Logic)
            // Yahan dhyan dena: Backend "terraform_code" bhej raha hai
            const finalOutput = `SUMMARY:\n${data.summary}\n\nTERRAFORM CODE:\n${data.terraform_code}`; // <--- Change to underscore

            setNodes((nds) => nds.map((n) =>
                n.id === '3' ? { ...n, data: { ...n.data, output: finalOutput } } : n
            ));

            // B. Create NEW Visual Nodes (Architecture)
            const newGeneratedNodes = data.nodes.map((node: any, index: number) => ({
                id: node.id,
                // 3. TYPE CHANGE KARO: 'default' se 'cloudNode'
                type: 'cloudNode',
                data: { label: node.label }, // Label pass kar rahe hain, icon apne aap decide hoga
                // Position thoda adjust kiya taki faile huye dikhein
                position: { x: 250 + (index * 180), y: 450 + (index % 2 * 80) },
                // 4. STYLE HATA DO: inline style ki ab zaroorat nahi, component khud handle karega
                // style: { ... }  <-- DELETE THIS PART
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

    // --- NEW: Visual -> Code Sync Logic ---
    const triggerVisualSync = async (currentNodes: Node[], currentEdges: Edge[]) => {
        console.log("🔄 Auto-Syncing Code from Visuals...");
        
        // 1. UI Update: User ko dikhao ki kaam chal raha hai
        setNodes((nds) => nds.map((n) => 
            n.id === '3' ? { ...n, data: { ...n.data, output: "Syncing changes..." } } : n
        ));

        try {
            // 2. Data Formatting (Backend ke Schema ke hisaab se)
            // Backend ko 'cloudNode' chahiye, prompt/ai/result nodes nahi
            const cloudNodes = currentNodes
                .filter(n => n.type === 'cloudNode')
                .map(n => ({
                    id: n.id,
                    label: n.data.label,
                    type: n.type,
                    provider: 'aws', // Default AWS rakh rahe hain
                    serviceType: n.data.label // Important: EC2, S3 yahi se jayega
                }));

            const cloudEdges = currentEdges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target
            }));

            // Previous State construct (Schema requirement)
            const currentState = {
                summary: "User Visual Update",
                nodes: cloudNodes,
                edges: cloudEdges,
                terraform_code: "" 
            };

            // 3. API Call
            const response = await fetch('http://localhost:8000/api/v1/sync/visual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_state: currentState,
                    updated_nodes: cloudNodes,
                    updated_edges: cloudEdges
                }),
            });

            const data = await response.json();
            if (data.detail) throw new Error(data.detail);

            // 4. Update Result Node with NEW Code
            const finalOutput = `SUMMARY:\n${data.summary}\n\nTERRAFORM CODE:\n${data.terraform_code}`;
            
            setNodes((nds) => nds.map((n) => 
                n.id === '3' ? { ...n, data: { ...n.data, output: finalOutput } } : n
            ));

        } catch (error: any) {
            console.error("Visual Sync Error:", error);
            setNodes((nds) => nds.map((n) => 
                n.id === '3' ? { ...n, data: { ...n.data, output: `Sync Error: ${error.message}` } } : n
            ));
        }
    };

    // --- NEW: Handle Sync (Code -> Visual) ---
    const onSyncCode = async (newCode: string) => {
        console.log("Syncing visuals from code...");

        // 1. Current State (JSON) taiyar karo
        // Note: Asli project me humein 'currentState' ko state me store karna chahiye.
        // Abhi ke liye hum assume kar rahe hain ki backend sirf code se naya bana dega.
        // Lekin hamara backend schema "current_state" mangta hai.

        // Hack: Hum backend ko dummy state bhejenge + new Code,
        // Kyunki hamara Agent itna smart hai ki wo New Code se pura naya JSON bana dega.

        const inputNode = nodes.find(n => n.id === '1');
        const resultNode = nodes.find(n => n.id === '3');

        // Previous JSON construct kar rahe hain (Optional but good)
        const currentState = {
            summary: "Existing State",
            nodes: nodes.filter(n => n.type === 'cloudNode').map(n => ({
                id: n.id, label: n.data.label, type: n.type, provider: 'aws', serviceType: n.data.label
            })),
            edges: [],
            terraform_code: ""
        };

        try {
            const response = await fetch('http://localhost:8000/api/v1/sync/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_state: currentState,
                    updated_code: newCode
                }),
            });

            const data = await response.json();
            if (data.detail) throw new Error(data.detail);

            // --- UPDATE VISUALS (Nodes & Edges) ---

            // 1. Naye Nodes Banao
            const syncedNodes = data.nodes.map((node: any, index: number) => ({
                id: node.id,
                type: 'cloudNode',
                data: { label: node.label },
                position: { x: 250 + (index * 180), y: 450 + (index % 2 * 80) },
            }));

            // 2. Naye Edges Banao
            const syncedEdges = data.edges.map((edge: any) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                animated: true,
                style: { stroke: '#94a3b8' },
                markerEnd: { type: MarkerType.ArrowClosed },
            }));

            // 3. Graph Update Karo (Purane Generated nodes hata kar naye lagao)
            // Note: Hum Input/AI/Result node (id 1,2,3) ko nahi hatayenge.
            const staticNodes = nodes.filter(n => ['1', '2', '3'].includes(n.id));
            setNodes([...staticNodes, ...syncedNodes]);
            setEdges([...initialEdges, ...syncedEdges]); // initialEdges me wiring hai 1->2->3

            // 4. Result Node ko update karo (Taaki summary update ho jaye)
            const finalOutput = `SUMMARY:\n${data.summary}\n\nTERRAFORM CODE:\n${data.terraform_code}`;

            setNodes((nds) => nds.map((n) =>
                n.id === '3' ? { ...n, data: { ...n.data, output: finalOutput } } : n
            ));

            alert("Diagram Updated Successfully! 🚀");

        } catch (error: any) {
            console.error("Sync Error:", error);
            alert(`Sync Failed: ${error.message}`);
        }
    };

    // Pass 'onSyncCode' function to ResultNode
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === '3') {
                    // Hum data me function inject kar rahe hain
                    node.data = { ...node.data, onSync: onSyncCode };
                }
                return node;
            })
        );
    }, [setNodes]); // Dependency array

   return (
        // LAYOUT CHANGE: Flex row banaya taki sidebar left me aaye
        <div className="flex w-full h-full bg-black">
            
            {/* 1. LEFT SIDEBAR */}
            <Sidebar />

            {/* 2. MAIN CANVAS AREA */}
            <div className="flex-1 relative h-full">
                
               {/* Run Button (Ab relative container ke andar hai) */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={runFlow}
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 ${
                            loading 
                            ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20'
                        }`}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                        {loading ? 'Architecting...' : 'Run Architect'}
                    </button>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance} // IMPORTANT: Instance capture karna
                    onDrop={onDrop}               // IMPORTANT: Drop handle karna
                    onDragOver={onDragOver}       // IMPORTANT: Allow drop
                    nodeTypes={nodeTypes}
                    fitView
                    style={{ background: '#000' }}
                >
                    <Controls style={{ filter: 'invert(1)' }} />
                    <MiniMap nodeColor="#6865A5" style={{ backgroundColor: '#141414' }} maskColor="rgba(0,0,0, 0.7)" />
                    <Background color="#555" gap={20} size={1} />
                </ReactFlow>
            </div>
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