// Drag and Drop ne Sambhade che and track detect pan

import { useState, useCallback } from 'react';
import {
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    MarkerType,
    OnNodesChange,
    OnEdgesChange,
    applyNodeChanges,
    applyEdgeChanges
} from 'reactflow';

// Initial Data
const initialNodes: Node[] = [
    { id: '1', type: 'promptNode', data: { text: '' }, position: { x: 50, y: 100 } , deletable : false},
    { id: '2', type: 'aiNode', data: { model: 'groq-llama' }, position: { x: 450, y: 100 }, deletable : false },
    { id: '3', type: 'resultNode', data: { output: '' }, position: { x: 900, y: 100 }, deletable : false },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#22d3ee' }, deletable : false },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#22c55e' }, deletable : false },
];

export function useFlowState() {
    // 1. Core Canvas State
    const [nodes, setNodes] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    // 2. Project Meta State (New)
    const [projectName, setProjectName] = useState("Untitled Architecture");
    const [lastDeletedNode, setLastDeletedNode] = useState<string | null>(null);

    // --- CONNECT LOGIC ---
    const onConnect = useCallback(
        (params: Edge | Connection) => {
            setEdges((eds) => addEdge({
                ...params,
                animated: true,
                style: { stroke: '#94a3b8', strokeWidth: 2 },
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed }
            }, eds));
        },
        [setEdges],
    );

    // --- DRAG OVER LOGIC ---
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // --- DROP LOGIC ---
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
                data: { label: label, status: 'active' },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    // --- NODE CHANGES (Standard) ---
    const onNodesChange: OnNodesChange = useCallback((changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, [setNodes]);

    // --- DELETE LOGIC ---
    const onNodesDelete = useCallback((deleted: Node[]) => {
        const cloudNodes = deleted.filter(n => n.type === 'cloudNode');
        if (cloudNodes.length > 0) {
            // Set warning state for UI
            setLastDeletedNode(cloudNodes[0].data.label);

            // Auto-clear warning after 5 seconds
            setTimeout(() => setLastDeletedNode(null), 5000);
        }
    }, []);

    // --- HELPER: Update Result Node ---
    const updateResultNode = useCallback((data: any) => {
        setNodes((nds) => nds.map((n) =>
            n.id === '3' ? { ...n, data: { ...n.data, ...data } } : n
        ));
    }, [setNodes]);

    return {
        nodes, setNodes,
        edges, setEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onDragOver,
        onDrop,
        onNodesDelete,
        lastDeletedNode,
        reactFlowInstance, setReactFlowInstance,
        updateResultNode,
        projectName, setProjectName // 👈 Exporting for Header & Save Logic
    };
}