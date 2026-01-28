'use client';

import React, { useEffect, useCallback, useState } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    Controls,
    MiniMap,
    Background,
    useReactFlow,
    Node // 👈 Added Node import
} from 'reactflow';
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from 'lucide-react';
import 'reactflow/dist/style.css';

// Hooks
import { useFlowState } from '@/hooks/useFlowState';
import { useProjectStorage } from '@/hooks/useProjectStorage';
import { useNebulaEngine } from '@/hooks/useNebulaEngine';
import { useToast } from '@/context/ToastContext';

// Components
import Header from './Header';
import Sidebar from './Sidebar';
import SaveModal from './modals/SaveModal';
import PropertiesPanel from './PropertiesPanel'; // 👈 Import Panel
import PromptNode from './nodes/PromptNode';
import AINode from './nodes/AINode';
import ResultNode from './nodes/ResultNode';
import CloudServiceNode from './nodes/CloudServiceNode';
import EditorToolbar from './EditorToolbar';

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
        onDragOver, onDrop, onNodesDelete, lastDeletedNode,
        setReactFlowInstance, updateResultNode,
        projectName, setProjectName
    } = useFlowState();

    // 2. AI Engine
    const { runArchitect, runFixer, syncVisualsToCode, triggerAutoLayout, aiLoading } = useNebulaEngine(
        setNodes, setEdges, updateResultNode
    );

    // 3. Project Storage
    const { saveProject, loadProject, saving, loading: projectLoading } = useProjectStorage(
        nodes, edges, setNodes, setEdges, setProjectName
    );

    // 4. Utilities
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const projectId = searchParams.get('id');
    const { getNodes } = useReactFlow();
    const toast = useToast();

    // 5. Local State
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    // 🆕 SELECTION STATE: Track selected node ID
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Load Project
    useEffect(() => {
        if (projectId) loadProject(projectId);
    }, [projectId]);

    // Legacy Sync
    const onSyncCode = useCallback(async (newCode: string) => {
         // console.log("Legacy Sync triggered", newCode);
    }, []);

    // Result Node Wiring
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

    // Run Handler
    const handleRunArchitect = () => {
        const currentNodes = getNodes();
        const inputNode = currentNodes.find(n => n.id === '1');
        const promptText = inputNode?.data?.text || "";

        if (!promptText) {
            toast.error("Please enter a prompt first!");
            return;
        }
        runArchitect(promptText);
    };

    // Save Handlers
    const handleSaveClick = () => {
        if (!session) {
            toast.error("Please login to save your project! 🔒");
            return;
        }
        setIsSaveModalOpen(true);
    };

    const handleConfirmSave = (name: string) => {
        saveProject(name);
        setIsSaveModalOpen(false);
    };

    // 🆕 SELECTION HANDLERS
    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id); // Select clicked node
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null); // Deselect when clicking empty canvas
    }, []);

    // 🆕 DERIVED STATE: Find the actual node object
    const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

    const handleAutoLayout = () => {
        // Call your layout utility here using current nodes/edges
        // For now, if you don't have it exposed easily, you can leave this prop empty
        // or refactor useNebulaEngine to return 'triggerLayout'.
        console.log("Triggering Auto Layout...");
    };

    return (
        <div className="flex w-full h-screen bg-black overflow-hidden relative">

            {/* Modal */}
            <SaveModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleConfirmSave}
                currentName={projectName}
            />

            {/* Warning Toast */}
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
                        title={projectName}
                        setTitle={setProjectName}
                        onSave={handleSaveClick}
                        onRun={handleRunArchitect}
                        saving={saving}
                        loading={aiLoading || projectLoading}
                    />
                </div>

                {/* 🆕 PROPERTIES PANEL (Z-Index 30 ensures it floats above canvas) */}
                <PropertiesPanel
                    selectedNode={selectedNode}
                    onClose={() => setSelectedNodeId(null)}
                />

                {/* ✅ NEW: Custom Toolbar (Replaces standard Controls) */}
                <EditorToolbar onAutoLayout={handleAutoLayout} />
                <EditorToolbar onAutoLayout={triggerAutoLayout} />
                <div className="absolute inset-0 z-10">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodesDelete={onNodesDelete}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick} // 👈 Added Selection Logic
                        onPaneClick={onPaneClick} // 👈 Added Deselection Logic
                        nodeTypes={nodeTypes}
                        fitView
                        style={{ background: 'transparent' }}
                    >

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