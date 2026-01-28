'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    Background,
    useReactFlow,
    Node,
    Edge
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

// Node Types Configuration
const nodeTypes = {
    promptNode: PromptNode,
    aiNode: AINode,
    resultNode: ResultNode,
    cloudNode: CloudServiceNode,
};

function Flow() {
    // 1. Core Refs & State
    const ref = useRef<HTMLDivElement>(null); // Ref for the editor container
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [menu, setMenu] = useState<any>(null); // Context Menu State

    // 🚀 NEW: Command Palette State
    const [isCommandOpen, setIsCommandOpen] = useState(false);

    // 2. Canvas Hooks (from useFlowState)
    const {
        nodes, edges, setNodes, setEdges,
        onNodesChange, onEdgesChange, onConnect,
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

    // Load Project ID from URL if present
    useEffect(() => {
        if (projectId) loadProject(projectId);
    }, [projectId]);

    // Legacy Sync Handler
    const onSyncCode = useCallback(async (newCode: string) => {
         // console.log("Legacy Sync triggered", newCode);
    }, []);

    // Wire up Result Node (ID: '3') with Engine Functions
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

    // --- HANDLERS ---

    // 1. Run AI Architect
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

    // 2. Save Project
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

    // 3. Node Selection (Left Click)
    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id); // Opens Properties Panel
        setMenu(null); // Close Context Menu
    }, []);

    // 4. Canvas Click (Deselect)
    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
        setMenu(null);
    }, []);

    // 5. Right-Click Context Menu Logic
    const onNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: Node) => {
            event.preventDefault(); // Stop default browser menu

            if (!ref.current) return;

            // Calculate position relative to container
            const pane = ref.current.getBoundingClientRect();

            setMenu({
                id: node.id,
                // Smart Positioning: keeps menu inside the screen
                top: event.clientY < pane.height - 200 ? event.clientY - pane.top : undefined,
                left: event.clientX < pane.width - 200 ? event.clientX - pane.left : undefined,
                right: event.clientX >= pane.width - 200 ? pane.width - (event.clientX - pane.left) : undefined,
                bottom: event.clientY >= pane.height - 200 ? pane.height - (event.clientY - pane.top) : undefined,
            });
        },
        [setMenu]
    );

    // --- CONTEXT MENU ACTIONS ---

    // Action A: Configure -> Opens Properties Panel
    const handleContextMenuConfigure = (id: string) => {
        setSelectedNodeId(id); // Simple: Select the node, Panel opens automatically
    };

    // Action B: View Code -> Zooms to Result Node
    const handleContextMenuViewCode = () => {
        fitView({
            nodes: [{ id: '3' }], // Focus on the Result Node
            duration: 800,        // Smooth animation
            padding: 0.2,
        });
        setSelectedNodeId('3');
    };

    // Derived State for Panel
    const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

    return (
        <div ref={ref} className="flex w-full h-screen bg-black overflow-hidden relative">

            {/* Save Modal */}
            <SaveModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleConfirmSave}
                currentName={projectName}
            />

            {/* Deletion Warning Toast */}
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
                {/* Background Gradient */}
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

                {/* Properties Panel (Slides in when selectedNodeId is set) */}
                <PropertiesPanel
                    selectedNode={selectedNode}
                    onClose={() => setSelectedNodeId(null)}
                />

                {/* Toolbar (Connected to Command Palette) */}
                <EditorToolbar
                    onAutoLayout={triggerAutoLayout}
                    onOpenCommandPalette={() => setIsCommandOpen(true)} // 👈 OPEN HANDLER
                />

                {/* Main React Flow Canvas */}
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
                        onNodeClick={onNodeClick}             // Left Click -> Selects Node -> Opens Panel
                        onNodeContextMenu={onNodeContextMenu} // Right Click -> Opens Custom Menu
                        onPaneClick={onPaneClick}             // Canvas Click -> Deselects
                        nodeTypes={nodeTypes}
                        fitView
                        style={{ background: 'transparent' }}
                    >
                        <Background color="#222" gap={25} size={1} variant={"dots" as any} />

                        <NebulaMinimap />

                        {/* 🚀 Command Palette (Controlled Component) */}
                        <CommandPalette
                           isOpen={isCommandOpen}
                           onClose={() => setIsCommandOpen(false)}
                           onToggle={() => setIsCommandOpen(prev => !prev)}
                        />

                        {/* Custom Context Menu */}
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

// Wrap in Provider to access React Flow hooks internally
export default function FlowEditor() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    )
}