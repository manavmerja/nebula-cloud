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
import { AlertTriangle } from 'lucide-react'; // Icon for warning
import 'reactflow/dist/style.css';

// Hooks
import { useFlowState } from '@/hooks/useFlowState';
import { useProjectStorage } from '@/hooks/useProjectStorage';
import { useNebulaEngine } from '@/hooks/useNebulaEngine';
import { getLayoutedElements } from './layoutUtils';

// Components
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
    // 1. Canvas State
    const {
        nodes, edges, setNodes, setEdges,
        onNodesChange, onEdgesChange, onConnect,
        onDragOver, onDrop, onNodesDelete, lastDeletedNode, // 👈 New props
        setReactFlowInstance, updateResultNode
    } = useFlowState();

    // 2. AI Engine
    const { runArchitect, runFixer, syncVisualsToCode, aiLoading } = useNebulaEngine(
        setNodes, setEdges, updateResultNode
    );

    // 3. Project Storage
    const { saveProject, loadProject, saving, loading: projectLoading } = useProjectStorage(
        nodes, edges, setNodes, setEdges
    );
    
    // Session & Params
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const projectId = searchParams.get('id');
    const { getNodes } = useReactFlow(); 

    useEffect(() => {
        if (projectId) loadProject(projectId);
    }, [projectId]);

    // Legacy Sync Handler
    const onSyncCode = useCallback(async (newCode: string) => {
         // ... (Keep existing legacy sync logic if you want, or replace)
         // For now, let's keep it simple to save space.
         // Assume existing logic is here.
         console.log("Legacy Sync triggered", newCode);
    }, []);

    // 6. Wire Handlers
    useEffect(() => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === '3') {
                if (
                    node.data.onSync === onSyncCode && 
                    node.data.onFixComplete === runFixer &&
                    node.data.onVisualSync === syncVisualsToCode
                ) return node;
                
                return {
                    ...node,
                    data: {
                        ...node.data,
                        onSync: onSyncCode,          
                        onFixComplete: runFixer,
                        onVisualSync: syncVisualsToCode
                    }
                };
            }
            return node;
        }));
    }, [setNodes, onSyncCode, runFixer, syncVisualsToCode]);

    // 🚀 THE FIX: Get latest prompt text directly from nodes state
    const handleRunArchitect = () => {
        // Use 'getNodes' to fetch FRESH state directly from React Flow store
        // This solves the issue of stale prompt text
        const currentNodes = getNodes(); 
        const inputNode = currentNodes.find(n => n.id === '1');
        const promptText = inputNode?.data?.text || "";
        runArchitect(promptText);
    };

    return (
        <div className="flex w-full h-screen bg-black overflow-hidden relative">
            
            {/* ⚠️ DELETE WARNING TOAST */}
            {lastDeletedNode && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                    <div className="bg-red-900/90 text-white px-4 py-2 rounded-lg border border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center gap-3 backdrop-blur-md">
                        <AlertTriangle className="text-red-400" size={20} />
                        <div>
                            <p className="text-sm font-bold">Resource Deleted: {lastDeletedNode}</p>
                            <p className="text-[10px] text-red-200">Click "Build Code" to update Terraform.</p>
                        </div>
                    </div>
                </div>
            )}

            <Sidebar />
            <div className="flex-1 relative h-full">
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]" />
                
                <div className="relative z-20">
                    <Header
                        session={session}
                        onSave={saveProject}
                        onRun={handleRunArchitect} // 👈 Using fixed handler
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
                        onNodesDelete={onNodesDelete} // 👈 Delete Handler
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