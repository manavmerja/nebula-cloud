'use client';

import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
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
import { useAutoSave } from '@/hooks/useAutoSave';
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
import QuickConnectMenu from './QuickConnectMenu';

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

    // 🟢 VISUAL FEEDBACK STATE
    const [isShiftHeld, setIsShiftHeld] = useState(false);

    // Quick Connect State
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const connectStartRef = useRef<{ nodeId: string; handleId: string } | null>(null);

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

    const { deleteElements, getNodes, fitView, project } = useReactFlow();

    // AI & Storage
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

    // Auto Save
    const projectData = useMemo(() => ({ nodes, edges, name: projectName }), [nodes, edges, projectName]);
    const { saveStatus, lastSavedTime } = useAutoSave(projectData, projectId, session, projectLoading);

    // --- EFFECTS ---
    useEffect(() => { if (projectId) loadProject(projectId); }, [projectId]);

    const onSyncCode = useCallback(async (newCode: string) => { }, []);

    // Sync AI Logic
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

    // Force Edge Types
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

    // 🟢 1. CURSOR VISUAL FEEDBACK LOGIC
    useEffect(() => {
        const down = (e: KeyboardEvent) => { if (e.key === 'Shift') setIsShiftHeld(true); };
        const up = (e: KeyboardEvent) => { if (e.key === 'Shift') setIsShiftHeld(false); };

        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
        };
    }, []);

    // --- HANDLERS ---

    const onConnectStart = useCallback((_, { nodeId, handleId }) => {
        connectStartRef.current = { nodeId: nodeId || "", handleId: handleId || "" };
    }, []);

    const onConnectEnd = useCallback(
        (event: any) => {
            if (!connectStartRef.current) return;
            const target = event.target as HTMLElement;

            // Magnet Logic (Drop on Node)
            const targetNodeElement = target.closest('.react-flow__node');
            if (targetNodeElement) {
                const targetNodeId = targetNodeElement.getAttribute('data-id');
                if (targetNodeId && targetNodeId !== connectStartRef.current.nodeId) {
                    takeSnapshot();
                    const newEdge: Edge = {
                        id: `e-${connectStartRef.current.nodeId}-${targetNodeId}`,
                        source: connectStartRef.current.nodeId,
                        sourceHandle: connectStartRef.current.handleId,
                        target: targetNodeId,
                        type: 'nebula',
                        data: { animated: true },
                        style: { stroke: '#334155', strokeWidth: 2 },
                    };
                    setEdges((eds) => addEdge(newEdge, eds));
                    toast.success("Connected!");
                    connectStartRef.current = null;
                    return;
                }
            }

            // Menu Logic (Drop on Empty)
            const targetIsPane = target.classList.contains('react-flow__pane');
            if (targetIsPane) {
                const { clientX, clientY } = event;
                setMenuPosition({ x: clientX, y: clientY });
            }
        },
        [setEdges, takeSnapshot, toast]
    );

    const handleConnectToExisting = useCallback(
        (targetNodeId: string) => {
            if (!connectStartRef.current) return;
            takeSnapshot();
            const newEdge: Edge = {
                id: `e-${connectStartRef.current.nodeId}-${targetNodeId}`,
                source: connectStartRef.current.nodeId,
                sourceHandle: connectStartRef.current.handleId,
                target: targetNodeId,
                type: 'nebula',
                data: { animated: true },
                style: { stroke: '#334155', strokeWidth: 2 },
            };
            setEdges((eds) => addEdge(newEdge, eds));
            setMenuPosition(null);
            connectStartRef.current = null;
        },
        [setEdges, takeSnapshot]
    );

    const onConnectWrapper = useCallback((params: Connection) => {
        takeSnapshot();
        const newEdge = { ...params, type: 'nebula', animated: false, data: { animated: true }, style: { stroke: '#334155', strokeWidth: 2 } };
        setEdges((eds) => addEdge(newEdge, eds));
    }, [setEdges, takeSnapshot]);

    const onNodesDeleteWrapper = useCallback((deleted: Node[]) => {
        takeSnapshot();
        if (originalOnNodesDelete) originalOnNodesDelete(deleted);
    }, [takeSnapshot, originalOnNodesDelete]);

    const onNodeDragStart = useCallback(() => { takeSnapshot(); }, [takeSnapshot]);

    const handleCommandPaletteToggle = useCallback(() => {
        if (!isCommandOpen) takeSnapshot();
        setIsCommandOpen(prev => !prev);
    }, [isCommandOpen, takeSnapshot]);

    const handleRunArchitect = () => {
        const currentNodes = getNodes();
        const inputNode = currentNodes.find(n => n.id === '1');
        const promptText = inputNode?.data?.text || "";
        if (!promptText) { toast.error("Please enter a prompt first!"); return; }
        takeSnapshot();
        runArchitect(promptText);
    };

    const handleSaveClick = () => {
        if (!session) { toast.error("Please login to save your project! 🔒"); return; }
        setIsSaveModalOpen(true);
    };

    const handleConfirmSave = (name: string) => {
        saveProject(name);
        setIsSaveModalOpen(false);
    };

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        // Shift + Click Logic
        if (event.shiftKey && selectedNodeId && selectedNodeId !== node.id) {
            event.stopPropagation();
            takeSnapshot();
            const newEdge: Edge = {
                id: `e-${selectedNodeId}-${node.id}`,
                source: selectedNodeId,
                target: node.id,
                type: 'nebula',
                data: { animated: true },
                style: { stroke: '#334155', strokeWidth: 2 },
            };
            setEdges((eds) => addEdge(newEdge, eds));
            toast.success("Linked!");
            setSelectedNodeId(node.id);
            return;
        }
        setSelectedNodeId(node.id);
        setMenu(null);
    }, [selectedNodeId, setEdges, toast, takeSnapshot]);

    const onPaneClick = useCallback(() => { setSelectedNodeId(null); setMenu(null); }, []);

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
        }, [setMenu]
    );

    const handleContextMenuConfigure = (id: string) => setSelectedNodeId(id);
    const handleContextMenuViewCode = () => { fitView({ nodes: [{ id: '3' }], duration: 800, padding: 0.2 }); setSelectedNodeId('3'); };
    const handleContextMenuDelete = (id: string) => { takeSnapshot(); const node = nodes.find(n => n.id === id); if (node) deleteElements({ nodes: [node] }); };
    const handleContextMenuDuplicate = () => { takeSnapshot(); duplicate(); };
    const handleContextMenuCopy = () => { copy(); };

    const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
    const resultNode = nodes.find(n => n.id === '3');
    const fullTerraformCode = resultNode?.data?.terraformCode || '';

    return (
        <div ref={ref} className="flex w-full h-screen bg-black overflow-hidden relative">
            <FeatureGuide />
            <SaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onConfirm={handleConfirmSave} currentName={projectName} />

            <QuickConnectMenu
                position={menuPosition}
                onClose={() => setMenuPosition(null)}
                onSelect={handleConnectToExisting}
                nodes={nodes}
                sourceNodeId={connectStartRef.current?.nodeId || ""}
            />

            {lastDeletedNode && (
                <div className="absolute bottom-8 right-8 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
                    <div className="bg-red-950/90 text-white px-4 py-3 rounded-xl border border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center gap-4 backdrop-blur-md">
                        <div className="p-2 bg-red-500/10 rounded-lg"> <AlertTriangle className="text-red-400" size={20} /> </div>
                        <div>
                            <h4 className="text-sm font-bold text-red-100">Resource Deleted: {lastDeletedNode}</h4>
                            <p className="text-[11px] text-red-300/80 mt-0.5">Don't forget to click <span className="text-white font-mono bg-red-500/20 px-1 rounded">Build Code</span> to sync.</p>
                        </div>
                    </div>
                </div>
            )}

            <Sidebar />

            <div className="flex-1 relative h-full">
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]" />

                <div className="relative z-20">
                    <Header
                        session={session} title={projectName} setTitle={setProjectName}
                        onSave={handleSaveClick} onRun={handleRunArchitect}
                        saving={saving} loading={aiLoading || projectLoading}
                        saveStatus={saveStatus} lastSavedTime={lastSavedTime}
                    />
                </div>

                <PropertiesPanel selectedNode={selectedNode} terraformCode={fullTerraformCode} onClose={() => setSelectedNodeId(null)} />

                <EditorToolbar
                    onAutoLayout={() => { takeSnapshot(); triggerAutoLayout(); }}
                    onOpenCommandPalette={handleCommandPaletteToggle}
                    onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo}
                />

                {/* 🟢 2. APPLY CURSOR CLASS */}
                <div className={`absolute inset-0 z-10 ${isShiftHeld ? 'cursor-crosshair' : ''}`}>
                    <ReactFlow
                        nodes={nodes} edges={edges}
                        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                        onNodesDelete={onNodesDeleteWrapper}

                        onConnect={onConnectWrapper}
                        onConnectStart={onConnectStart}
                        onConnectEnd={onConnectEnd}

                        onInit={setReactFlowInstance}
                        onDrop={onDrop} onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        onNodeContextMenu={onNodeContextMenu}
                        onPaneClick={onPaneClick}
                        onNodeDragStart={onNodeDragStart}

                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        defaultEdgeOptions={{ type: 'nebula', style: { stroke: '#334155', strokeWidth: 2 } }}
                        fitView style={{ background: 'transparent' }}
                    >
                        <Background color="#222" gap={25} size={1} variant={"dots" as any} />
                        <NebulaMinimap />
                        <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} onToggle={handleCommandPaletteToggle} />
                        {menu && <ContextMenu {...menu} onClose={() => setMenu(null)} onConfigure={handleContextMenuConfigure} onViewCode={handleContextMenuViewCode} onDelete={() => handleContextMenuDelete(menu.id)} onDuplicate={handleContextMenuDuplicate} onCopy={handleContextMenuCopy} />}
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