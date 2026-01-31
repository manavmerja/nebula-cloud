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
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useClipboard } from '@/hooks/useClipboard';
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
import NebulaEdge from './edges/NebulaEdge';
import FeatureGuide from './onboarding/FeatureGuide';

const nodeTypes = {
    promptNode: PromptNode,
    aiNode: AINode,
    resultNode: ResultNode,
    cloudNode: CloudServiceNode,
};

const edgeTypes: EdgeTypes = {
    nebula: NebulaEdge,
};

function Flow() {
    const ref = useRef<HTMLDivElement>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [menu, setMenu] = useState<any>(null);
    const [isCommandOpen, setIsCommandOpen] = useState(false);

    // Flow State
    const {
        nodes, edges, setNodes, setEdges,
        onNodesChange, onEdgesChange,
        onDragOver,
        onDrop,
        onNodesDelete: originalOnNodesDelete,
        lastDeletedNode,
        setReactFlowInstance, updateResultNode,
        projectName, setProjectName
    } = useFlowState();

    const { deleteElements, getNodes, fitView } = useReactFlow();

    // AI Engine
    const { runArchitect, runFixer, syncVisualsToCode, triggerAutoLayout, aiLoading } = useNebulaEngine(
        setNodes, setEdges, updateResultNode
    );

    const { saveProject, loadProject, saving, loading: projectLoading } = useProjectStorage(
        nodes, edges, setNodes, setEdges, setProjectName
    );

    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const projectId = searchParams.get('id');
    const toast = useToast();

    const { undo, redo, takeSnapshot, canUndo, canRedo } = useUndoRedo();
    const { duplicate, copy, paste } = useClipboard();

    // --- EFFECTS ---
    useEffect(() => {
        if (projectId) loadProject(projectId);
    }, [projectId]);

    const onSyncCode = useCallback(async (newCode: string) => {}, []);

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
                    data: { ...node.data, onSync: onSyncCode, onFixComplete: runFixer, onVisualSync: syncVisualsToCode }
                };
            }
            return node;
        }));
    }, [setNodes, onSyncCode, runFixer, syncVisualsToCode]);

    useEffect(() => {
        let hasChanges = false;
        const updatedEdges = edges.map((edge) => {
            if (edge.type !== 'nebula' || !edge.data?.animated) {
                hasChanges = true;
                return {
                    ...edge,
                    type: 'nebula',
                    animated: false,
                    style: { stroke: '#334155', strokeWidth: 2 },
                    data: { animated: true },
                };
            }
            return edge;
        });
        if (hasChanges) setEdges(updatedEdges);
    }, [edges, setEdges]);

    // --- HANDLERS ---
    const onConnectWrapper = useCallback((params: Connection) => {
        takeSnapshot();
        const newEdge = {
            ...params,
            type: 'nebula',
            animated: false,
            data: { animated: true },
            style: { stroke: '#334155', strokeWidth: 2 },
        };
        setEdges((eds) => addEdge(newEdge, eds));
    }, [setEdges, takeSnapshot]);

    const onNodesDeleteWrapper = useCallback((deleted: Node[]) => {
        takeSnapshot();
        if (originalOnNodesDelete) originalOnNodesDelete(deleted);
    }, [takeSnapshot, originalOnNodesDelete]);

    const onNodeDragStart = useCallback(() => {
        takeSnapshot();
    }, [takeSnapshot]);

    const handleCommandPaletteToggle = useCallback(() => {
        if (!isCommandOpen) takeSnapshot();
        setIsCommandOpen(prev => !prev);
    }, [isCommandOpen, takeSnapshot]);

    const handleRunArchitect = () => {
        const currentNodes = getNodes();
        const inputNode = currentNodes.find(n => n.id === '1');
        const promptText = inputNode?.data?.text || "";

        if (!promptText) {
            toast.error("Please enter a prompt first!");
            return;
        }
        takeSnapshot();
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

    const handleContextMenuConfigure = (id: string) => setSelectedNodeId(id);
    const handleContextMenuViewCode = () => {
        fitView({ nodes: [{ id: '3' }], duration: 800, padding: 0.2 });
        setSelectedNodeId('3');
    };
    const handleContextMenuDelete = (id: string) => {
        takeSnapshot();
        const node = nodes.find(n => n.id === id);
        if (node) deleteElements({ nodes: [node] });
    };

    const handleContextMenuDuplicate = () => {
        takeSnapshot();
        duplicate();
    };

    const handleContextMenuCopy = () => {
        copy();
    };

    const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

    // 👇👇👇 GET TERRAFORM CODE FROM NODE 3 (ResultNode) 👇👇👇
    const resultNode = nodes.find(n => n.id === '3');
    const fullTerraformCode = resultNode?.data?.terraformCode || '';

    return (
        <div ref={ref} className="flex w-full h-screen bg-black overflow-hidden relative">
            <FeatureGuide />
            <SaveModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleConfirmSave}
                currentName={projectName}
            />

            {lastDeletedNode && (
                // 🚀 UPDATED: Moved to Bottom Right & changed animation to Slide-In
                <div className="absolute bottom-8 right-8 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
                    <div className="bg-red-950/90 text-white px-4 py-3 rounded-xl border border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center gap-4 backdrop-blur-md">

                        {/* Icon Box */}
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <AlertTriangle className="text-red-400" size={20} />
                        </div>

                        {/* Text Content */}
                        <div>
                            <h4 className="text-sm font-bold text-red-100">
                                Resource Deleted: {lastDeletedNode}
                            </h4>
                            <p className="text-[11px] text-red-300/80 mt-0.5">
                                Don't forget to click <span className="text-white font-mono bg-red-500/20 px-1 rounded">Build Code</span> to sync.
                            </p>
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

                {/* 👇👇👇 PASS CODE TO PROPERTIES PANEL 👇👇👇 */}
                <PropertiesPanel
                    selectedNode={selectedNode}
                    terraformCode={fullTerraformCode}
                    onClose={() => setSelectedNodeId(null)}
                />

                <EditorToolbar
                    onAutoLayout={() => {
                        takeSnapshot();
                        triggerAutoLayout();
                    }}
                    onOpenCommandPalette={handleCommandPaletteToggle}
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />

                <div className="absolute inset-0 z-10">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodesDelete={onNodesDeleteWrapper}
                        onConnect={onConnectWrapper}
                        onNodeDragStart={onNodeDragStart}

                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        onNodeContextMenu={onNodeContextMenu}
                        onPaneClick={onPaneClick}

                        nodeTypes={nodeTypes}
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
                           onToggle={handleCommandPaletteToggle}
                        />

                        {menu && (
                            <ContextMenu
                                {...menu}
                                onClose={() => setMenu(null)}
                                onConfigure={handleContextMenuConfigure}
                                onViewCode={handleContextMenuViewCode}
                                onDelete={() => handleContextMenuDelete(menu.id)}
                                onDuplicate={handleContextMenuDuplicate}
                                onCopy={handleContextMenuCopy}
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