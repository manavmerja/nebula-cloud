// UI and Wiring nu kaam karse 

'use client';

import React, { useEffect, useCallback } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    Controls,
    MiniMap,
    Background,
    MarkerType,
    useReactFlow
} from 'reactflow';
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import 'reactflow/dist/style.css';

// --- 🔗 CUSTOM HOOKS (The Engine) ---
import { useFlowState } from '@/hooks/useFlowState';
import { useProjectStorage } from '@/hooks/useProjectStorage';
import { useNebulaEngine } from '@/hooks/useNebulaEngine';
import { getLayoutedElements } from './layoutUtils';

// --- 🧩 COMPONENTS ---
import Header from './Header';
import Sidebar from './Sidebar';
import PromptNode from './nodes/PromptNode';
import AINode from './nodes/AINode';
import ResultNode from './nodes/ResultNode';
import CloudServiceNode from './nodes/CloudServiceNode';

const nodeTypes = {
    promptNode: PromptNode,
    aiNode: AINode,
    resultNode: ResultNode,
    cloudNode: CloudServiceNode,
};

function Flow() {
    // 1. 🎨 Canvas State
    const {
        nodes, edges, setNodes, setEdges,
        onNodesChange, onEdgesChange, onConnect,
        onDragOver, onDrop, setReactFlowInstance, updateResultNode
    } = useFlowState();

    // 2. 🧠 AI Engine
    // 👇 CHANGE: Removed 'nodes' and 'edges' from arguments
    const { runArchitect, runFixer, aiLoading } = useNebulaEngine(
        setNodes, setEdges, updateResultNode
    );

    // 3. 💾 Project Storage
    const { saveProject, loadProject, saving, loading: projectLoading } = useProjectStorage(
        nodes, edges, setNodes, setEdges
    );
    
    // ... Session logic same ...
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const projectId = searchParams.get('id');
    const { getNodes } = useReactFlow(); 

    useEffect(() => {
        if (projectId) loadProject(projectId);
    }, [projectId]);

    // ... onSyncCode logic same ...
    const onSyncCode = useCallback(async (newCode: string) => {
        // ... (Keep existing logic)
        console.log("Syncing visuals from code...");
        updateResultNode({ output: "Syncing..." });
        // ... rest of onSyncCode code ...
         const currentNodes = getNodes();
        const currentState = {
            summary: "Existing State",
            nodes: currentNodes.filter(n => n.type === 'cloudNode').map(n => ({
                id: n.id, label: n.data.label, type: n.type, provider: 'aws', serviceType: n.data.label
            })),
            edges: [],
            terraform_code: ""
        };

        try {
            const response = await fetch('/api/v1/sync/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_state: currentState, updated_code: newCode }),
            });

            const data = await response.json();
            if (data.detail) throw new Error(data.detail);

            const rawNodes = data.nodes.map((node: any) => ({
                id: node.id, type: 'cloudNode', data: { label: node.label }, position: { x: 0, y: 0 },
            }));
            const rawEdges = data.edges.map((edge: any) => ({
                id: edge.id, source: edge.source, target: edge.target, animated: true, style: { stroke: '#94a3b8' }, markerEnd: { type: MarkerType.ArrowClosed },
            }));

            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges, 'LR');

            setNodes((prev) => {
                const staticNodes = prev.filter(n => ['1', '2', '3'].includes(n.id));
                const shiftedNodes = layoutedNodes.map((node) => ({ ...node, position: { x: node.position.x + 50, y: node.position.y + 400 } }));
                return [...staticNodes, ...shiftedNodes];
            });
            setEdges((prev) => {
                const staticEdges = prev.filter(e => ['e1-2', 'e2-3'].includes(e.id));
                return [...staticEdges, ...layoutedEdges];
            });

            updateResultNode({ output: `SUMMARY:\n${data.summary}\n\nTERRAFORM CODE:\n${data.terraform_code}` });
            alert("Diagram Updated Successfully! 🔄");

        } catch (error: any) {
            console.error("Sync Error:", error);
            alert(`Sync Failed: ${error.message}`);
        }
    }, [getNodes, setNodes, setEdges, updateResultNode]);

    // 6. 🔌 Wire Handlers to Result Node (SAFETY CHECK ADDED)
    useEffect(() => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === '3') {
                // 👇 SAFETY CHECK: Agar function same hai, to update mat karo
                if (node.data.onSync === onSyncCode && node.data.onFixComplete === runFixer) {
                    return node;
                }
                return {
                    ...node,
                    data: {
                        ...node.data,
                        onSync: onSyncCode,
                        onFixComplete: runFixer
                    }
                };
            }
            return node;
        }));
    }, [setNodes, onSyncCode, runFixer]);

    return (
        <div className="flex w-full h-screen bg-black overflow-hidden">
             {/* ... (Keep existing UI JSX) ... */}
            <Sidebar />
            <div className="flex-1 relative h-full">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]" />
                </div>
                <div className="relative z-20">
                    <Header
                        session={session}
                        onSave={saveProject}
                        onRun={() => {
                            const inputNode = nodes.find(n => n.id === '1');
                            runArchitect(inputNode?.data?.text || "");
                        }}
                        saving={saving}
                        loading={aiLoading || projectLoading}
                    />
                </div>
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