'use client';

import React, { useCallback, useState, useEffect } from 'react';
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
    MarkerType, // Arrow heads ke liye
    Node,
    useReactFlow,
} from 'reactflow';
import { useSession } from "next-auth/react"; // <--- Session hook
import { useSearchParams } from "next/navigation";

// Components Imports
import Header from './Header'; 
import Sidebar from './Sidebar';
import 'reactflow/dist/style.css';
import PromptNode from './nodes/PromptNode';
import AINode from './nodes/AINode';
import ResultNode from './nodes/ResultNode';
import CloudServiceNode from './nodes/CloudServiceNode';


// 1. IMPORT THE LAYOUT UTILITY WE JUST MADE
import { getLayoutedElements } from './layoutUtils';

import 'reactflow/dist/style.css';

// --- TYPES ---
type NodeData = {
    text?: string;
    model?: string;
    output?: string;
    label?: string;
    onSync?: (newCode: string) => Promise<void>;
};

// --- INITIAL DATA ---
const initialNodes: Node<NodeData>[] = [
    { id: '1', type: 'promptNode', data: { text: '' }, position: { x: 50, y: 100 } },
    { id: '2', type: 'aiNode', data: { model: 'groq-llama' }, position: { x: 450, y: 100 } },
    { id: '3', type: 'resultNode', data: { output: '' }, position: { x: 900, y: 100 } },
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
    const [loading, setLoading] = useState(false);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const searchParams = useSearchParams();
    const projectId = searchParams.get('id');

    // --- LOAD PROJECT LOGIC 🔄 ---
    useEffect(() => {
        const loadProject = async () => {
            if (!projectId) return; // Agar URL me ID nahi hai, to ruk jao

            setLoading(true);
            try {
                const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://manavmerja-nebula-backend-live.hf.space";

                // Backend se specific project fetch karo
                // (Note: Backend me ye route hum abhi banayenge)
                const response = await fetch(`${API_BASE}/api/v1/project/${projectId}`);

                if (!response.ok) throw new Error("Project not found");

                const data = await response.json();

                // Canvas par nodes aur edges set karo
                if (data.nodes) setNodes(data.nodes);
                if (data.edges) setEdges(data.edges);

                console.log(`Project loaded: ${data.name}`);

            } catch (error: any) {
                console.error("Load Error:", error);
                alert("Could not load the project. Check console for details.");
            } finally {
                setLoading(false);
            }
        };

        loadProject();
    }, [projectId, setNodes, setEdges]); // Dependencies

    // --- SAVE PROJECT LOGIC 💾 ---
    const saveProject = async () => {
        if (!session || !session.user) {
            alert("Please login to save your project! 🔒");
            return;
        }

        if (!session.user.email) {
            alert("Email not found in session. Please check your GitHub/Google account settings.");
            return;
        }

        const projectName = prompt("Enter project name:", "My Awesome Cloud");
        if (!projectName) return;

        setSaving(true);

        try {
            const resultNode = nodes.find(n => n.id === '3');
            let terraformCode = "";

            if (resultNode?.data?.output) {
                const parts = resultNode.data.output.split('TERRAFORM CODE:');
                terraformCode = parts.length > 1 ? parts[1].trim() : resultNode.data.output;
            }

            const payload = {
                user_email: session.user.email,
                name: projectName,
                description: "Created via Nebula Cloud",
                nodes: nodes,
                edges: edges,
                terraform_code: terraformCode
            };

            const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://manavmerja-nebula-backend-live.hf.space";
            const response = await fetch(`${API_BASE}/api/v1/projects/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = typeof data.detail === 'string'
                    ? data.detail
                    : JSON.stringify(data.detail, null, 2);
                throw new Error(errorMessage);
            }

            alert(" Project Saved Successfully!");

        } catch (error: any) {
            console.error("Save Error:", error);
            alert(`❌ Save Failed:\n${error.message}`);
        } finally {
            setSaving(false);
        }
    };

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
            setEdges((eds) => addEdge(params, eds));
            const newEdges = addEdge(params, edges);
            triggerVisualSync(nodes, newEdges);
        },
        [setEdges, nodes, edges],
    );

    // --- DRAG & DROP LOGIC ---
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            if (!reactFlowInstance) return;

            const dataStr = event.dataTransfer.getData('application/reactflow');
            if (!dataStr) return;

            const { type, label } = JSON.parse(dataStr);
            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { label: label },
            };

            setNodes((nds) => nds.concat(newNode));
            triggerVisualSync(nodes.concat(newNode), edges);
        },
        [reactFlowInstance, nodes, edges, setNodes],
    );

    // --- RUN ARCHITECT LOGIC (AI Generation) ---
    const runFlow = async () => {
        const inputNode = nodes.find(n => n.id === '1');
        const promptText = inputNode?.data?.text;

        if (!promptText) {
            alert("Please enter a prompt first!");
            return;
        }

        setLoading(true);
        setNodes((nds) => nds.map((n) =>
            n.id === '3' ? { ...n, data: { ...n.data, output: "Generating Architecture..." } } : n
        ));

        try {
            const response = await fetch('https://manavmerja-nebula-backend-live.hf.space/api/v1/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptText }),
            });

            const data = await response.json();
            if (data.detail) throw new Error(data.detail);

            const finalOutput = `SUMMARY:\n${data.summary}\n\nTERRAFORM CODE:\n${data.terraform_code}`;

            // Update result node
            setNodes((nds) => nds.map((n) =>
                n.id === '3' ? { ...n, data: { ...n.data, output: finalOutput } } : n
            ));

            // --- 2. PREPARE NODES FOR DAGRE ---
            // Create raw nodes with 0,0 position first
            const rawNodes = data.nodes.map((node: any) => ({
                id: node.id,
                type: 'cloudNode',
                data: { label: node.label },
                position: { x: 0, y: 0 },
            }));

            const rawEdges = data.edges.map((edge: any) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                animated: true,
                style: { stroke: '#94a3b8' },
                markerEnd: { type: MarkerType.ArrowClosed },
            }));

            // --- 3. APPLY LAYOUT ALGORITHM ---
            // 'LR' = Left to Right (horizontal tree)
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                rawNodes,
                rawEdges,
                'LR'
            );

            // --- 4. SHIFT POSITION ---
            // We want the new diagram to appear BELOW the main control row (x:50, y:400)
            const X_OFFSET = 50;
            const Y_OFFSET = 400;

            const finalNodes = layoutedNodes.map((node) => ({
                ...node,
                position: {
                    x: node.position.x + X_OFFSET,
                    y: node.position.y + Y_OFFSET
                }
            }));

            // --- 5. UPDATE STATE ---
            // Keep the static control nodes (ID 1, 2, 3), remove old generated ones
            setNodes((prev) => {
                const staticNodes = prev.filter(n => ['1', '2', '3'].includes(n.id));
                return [...staticNodes, ...finalNodes];
            });

            setEdges((prev) => {
                const staticEdges = prev.filter(e => ['e1-2', 'e2-3'].includes(e.id));
                return [...staticEdges, ...layoutedEdges];
            });

            // Zoom to fit the new layout
            setTimeout(() => {
                reactFlowInstance?.fitView({ padding: 0.2, duration: 800 });
            }, 100);

        } catch (error: any) {
            console.error("Error:", error);
            setNodes((nds) => nds.map((n) =>
                n.id === '3' ? { ...n, data: { ...n.data, output: `Error: ${error.message}` } } : n
            ));
        } finally {
            setLoading(false);
        }
    };

    // --- VISUAL SYNC LOGIC ---
    const triggerVisualSync = async (currentNodes: Node[], currentEdges: Edge[]) => {
        console.log("🔄 Auto-Syncing Code from Visuals...");
        setNodes((nds) => nds.map((n) =>
            n.id === '3' ? { ...n, data: { ...n.data, output: "Syncing changes..." } } : n
        ));

        try {
            const cloudNodes = currentNodes
                .filter(n => n.type === 'cloudNode')
                .map(n => ({
                    id: n.id,
                    label: n.data.label,
                    type: n.type,
                    provider: 'aws',
                    serviceType: n.data.label
                }));

            const cloudEdges = currentEdges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target
            }));

            const currentState = {
                summary: "User Visual Update",
                nodes: cloudNodes,
                edges: cloudEdges,
                terraform_code: ""
            };

            const response = await fetch('https://manavmerja-nebula-backend-live.hf.space/api/v1/sync/visual', {
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

    // --- CODE SYNC LOGIC ---
    const onSyncCode = async (newCode: string) => {
        console.log("Syncing visuals from code...");
        const currentState = {
            summary: "Existing State",
            nodes: nodes.filter(n => n.type === 'cloudNode').map(n => ({
                id: n.id, label: n.data.label, type: n.type, provider: 'aws', serviceType: n.data.label
            })),
            edges: [],
            terraform_code: ""
        };

        try {
            const response = await fetch('https://manavmerja-nebula-backend-live.hf.space/api/v1/sync/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_state: currentState,
                    updated_code: newCode
                }),
            });

            const data = await response.json();
            if (data.detail) throw new Error(data.detail);

            // 1. Process new nodes from code
            const rawNodes = data.nodes.map((node: any) => ({
                id: node.id,
                type: 'cloudNode',
                data: { label: node.label },
                position: { x: 0, y: 0 },
            }));

            const rawEdges = data.edges.map((edge: any) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                animated: true,
                style: { stroke: '#94a3b8' },
                markerEnd: { type: MarkerType.ArrowClosed },
            }));

            // 2. Apply Dagre Layout to sync result
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                rawNodes,
                rawEdges,
                'LR'
            );

            // 3. Shift them
            const X_OFFSET = 50;
            const Y_OFFSET = 400;
            const finalSyncedNodes = layoutedNodes.map((node) => ({
                ...node,
                position: {
                    x: node.position.x + X_OFFSET,
                    y: node.position.y + Y_OFFSET
                }
            }));

            // 4. Update State
            setNodes((prev) => {
                const staticNodes = prev.filter(n => ['1', '2', '3'].includes(n.id));
                return [...staticNodes, ...finalSyncedNodes];
            });
            setEdges((prev) => {
                const staticEdges = prev.filter(e => ['e1-2', 'e2-3'].includes(e.id));
                return [...staticEdges, ...layoutedEdges];
            });

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

    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === '3') {
                    node.data = { ...node.data, onSync: onSyncCode };
                }
                return node;
            })
        );
    }, [setNodes]);

    return (
        <div className="flex w-full h-screen bg-black overflow-hidden">
            {/* 1. LEFT SIDEBAR */}
            <Sidebar />

            {/* 2. MAIN CANVAS AREA */}
            <div className="flex-1 relative h-full">
                {/* Background Animation */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]" />
                </div>

                {/* 3. NEW HEADER */}
                <div className="relative z-20">
                    <Header
                        session={session}
                        onSave={saveProject}
                        onRun={runFlow}
                        saving={saving}
                        loading={loading}
                    />
                </div>

                {/* 4. ReactFlow Canvas */}
                <div className="absolute inset-0 z-10">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView
                        style={{ background: 'transparent' }}
                    >
                        <Controls className="!bg-black/50 !border-white/10 !fill-white shadow-2xl" />
                        <MiniMap
                            nodeColor={(n: any) => {
                                if (n.type === 'promptNode') return '#06b6d4';
                                if (n.type === 'aiNode') return '#8b5cf6';
                                if (n.type === 'resultNode') return '#22c55e';
                                return '#3b82f6';
                            }}
                            style={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)' }}
                            maskColor="rgba(0,0,0, 0.8)"
                        />
                        <Background color="#222" gap={25} size={1} variant={"dots" as any} />
                    </ReactFlow>
                </div>
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