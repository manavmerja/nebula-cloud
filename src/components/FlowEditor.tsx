'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    Background,
    useReactFlow,
    Node,
    Edge,
    addEdge,
    Connection,
    EdgeTypes
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
import PropertiesPanel from './PropertiesPanel';
import PromptNode from './nodes/PromptNode';
import AINode from './nodes/AINode';
import ResultNode from './nodes/ResultNode';
import CloudServiceNode from './nodes/CloudServiceNode';
import EditorToolbar from './EditorToolbar';
import NebulaMinimap from './NebulaMinimap';
import ContextMenu from './ContextMenu';
import CommandPalette from './CommandPalette';
import NebulaEdge from './edges/NebulaEdge'; // Ensure this path is correct

// Node Types Configuration
const nodeTypes = {
    promptNode: PromptNode,
    aiNode: AINode,
    resultNode: ResultNode,
    cloudNode: CloudServiceNode,
};

// Edge Types Configuration
const edgeTypes: EdgeTypes = {
    nebula: NebulaEdge,
};

function Flow() {
    // 1. Core Refs & State
    const ref = useRef<HTMLDivElement>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [menu, setMenu] = useState<any>(null);
    const [isCommandOpen, setIsCommandOpen] = useState(false);

    // 2. Canvas Hooks
    const {
        nodes, edges, setNodes, setEdges,
        onNodesChange, onEdgesChange,
        // Note: We do NOT use the default onConnect here, we define a wrapper below
        onDragOver, onDrop, onNodesDelete, lastDeletedNode,
        setReactFlowInstance, updateResultNode,
        projectName, setProjectName
    } = useFlowState();

    // 3. AI Engine Hooks
    const { runArchitect, runFixer, syncVisualsToCode, triggerAutoLayout, aiLoading } = useNebulaEngine(
        setNodes, setEdges, updateResultNode
    );

    // 4. Storage & Utilities
    const { saveProject, loadProject, saving, loading: projectLoading } = useProjectStorage(
        nodes, edges, setNodes, setEdges, setProjectName
    );
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const projectId = searchParams.get('id');
    const { getNodes, fitView } = useReactFlow();
    const toast = useToast();

    // --- EFFECTS ---

    // Load Project
    useEffect(() => {
        if (projectId) loadProject(projectId);
    }, [projectId]);

    // Legacy Sync Handler
    const onSyncCode = useCallback(async (newCode: string) => {
         // console.log("Legacy Sync triggered", newCode);
    }, []);

    // Wire up Result Node
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

    // -----------------------------------------------------------
    // 🚀 EDGE ENFORCER (The Fix)
    // This effect runs whenever edges or nodes change.
    // It guarantees that edges between System Nodes ALWAYS have animation,
    // regardless of how they were created (Manual, AI, or Load).
    // -----------------------------------------------------------
    useEffect(() => {
        const systemTypes = ['promptNode', 'aiNode', 'resultNode'];
        let hasChanges = false;

        const updatedEdges = edges.map((edge) => {
            // Find connected nodes
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);

            // If nodes aren't found yet (loading state), keep edge as is
            if (!sourceNode || !targetNode) return edge;

            // Check connection type
            const isSystemConnection =
                systemTypes.includes(sourceNode.type || '') &&
                systemTypes.includes(targetNode.type || '');

            // We update the edge IF:
            // 1. It is NOT a 'nebula' type edge yet
            // 2. OR the 'animated' data flag doesn't match the reality (e.g., manual connect missed it)
            const currentAnimatedState = edge.data?.animated;

            if (edge.type !== 'nebula' || currentAnimatedState !== isSystemConnection) {
                hasChanges = true;
                return {
                    ...edge,
                    type: 'nebula', // Force our custom component
                    animated: false, // ReactFlow default dash OFF
                    style: { stroke: '#334155', strokeWidth: 2 },
                    data: {
                        ...edge.data,
                        animated: isSystemConnection, // True for System, False for Cloud
                    },
                };
            }
            return edge;
        });

        if (hasChanges) {
            setEdges(updatedEdges);
        }
    }, [nodes, edges, setEdges]);


    // --- HANDLERS ---

    // Manual Connection Handler (Immediate Feedback)
    const onConnectWrapper = useCallback((params: Connection) => {
        const sourceNode = nodes.find((n) => n.id === params.source);
        const targetNode = nodes.find((n) => n.id === params.target);

        const systemNodeTypes = ['promptNode', 'aiNode', 'resultNode'];
        const isSystemConnection =
            sourceNode &&
            targetNode &&
            systemNodeTypes.includes(sourceNode.type || '') &&
            systemNodeTypes.includes(targetNode.type || '');

        const newEdge = {
            ...params,
            type: 'nebula',
            animated: false,
            data: {
                animated: isSystemConnection
            },
            style: { stroke: '#334155', strokeWidth: 2 },
        };

        setEdges((eds) => addEdge(newEdge, eds));
    }, [nodes, setEdges]);

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

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
        setMenu(null);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
        setMenu(null);
    }, []);

    const onNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: Node) => {
            event.preventDefault();
            if (!ref.current) return;
            const pane = ref.current.getBoundingClientRect();

            setMenu({
                id: node.id,
                top: event.clientY < pane.height - 200 ? event.clientY - pane.top : undefined,
                left: event.clientX < pane.width - 200 ? event.clientX - pane.left : undefined,
                right: event.clientX >= pane.width - 200 ? pane.width - (event.clientX - pane.left) : undefined,
                bottom: event.clientY >= pane.height - 200 ? pane.height - (event.clientY - pane.top) : undefined,
            });
        },
        [setMenu]
    );

    const handleContextMenuConfigure = (id: string) => {
        setSelectedNodeId(id);
    };

    const handleContextMenuViewCode = () => {
        fitView({
            nodes: [{ id: '3' }],
            duration: 800,
            padding: 0.2,
        });
        setSelectedNodeId('3');
    };

    const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

    return (
        <div ref={ref} className="flex w-full h-screen bg-black overflow-hidden relative">

            <SaveModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleConfirmSave}
                currentName={projectName}
            />

            {lastDeletedNode && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce pointer-events-none">
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

                <PropertiesPanel
                    selectedNode={selectedNode}
                    onClose={() => setSelectedNodeId(null)}
                />

                <EditorToolbar
                    onAutoLayout={triggerAutoLayout}
                    onOpenCommandPalette={() => setIsCommandOpen(true)}
                />

                <div className="absolute inset-0 z-10">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodesDelete={onNodesDelete}

                        // 🚀 Using our Custom Wrapper for manual connections
                        onConnect={onConnectWrapper}

                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        onNodeContextMenu={onNodeContextMenu}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}

                        // 🚀 Register Custom Edges & Defaults
                        edgeTypes={edgeTypes}
                        defaultEdgeOptions={{
                            type: 'nebula',
                            style: { stroke: '#334155', strokeWidth: 2 },
                        }}

                        fitView
                        style={{ background: 'transparent' }}
                    >
                        <Background color="#222" gap={25} size={1} variant={"dots" as any} />

                        <NebulaMinimap />

                        <CommandPalette
                           isOpen={isCommandOpen}
                           onClose={() => setIsCommandOpen(false)}
                           onToggle={() => setIsCommandOpen(prev => !prev)}
                        />

                        {menu && (
                            <ContextMenu
                                {...menu}
                                onClose={() => setMenu(null)}
                                onConfigure={handleContextMenuConfigure}
                                onViewCode={handleContextMenuViewCode}
                            />
                        )}

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