// Drag and Drop ne Sambhade che 

import { useState, useCallback } from 'react';
import {
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    MarkerType
} from 'reactflow';

// Initial Data
const initialNodes: Node[] = [
    { id: '1', type: 'promptNode', data: { text: '' }, position: { x: 50, y: 100 } },
    { id: '2', type: 'aiNode', data: { model: 'groq-llama' }, position: { x: 450, y: 100 } },
    { id: '3', type: 'resultNode', data: { output: '' }, position: { x: 900, y: 100 } },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#22d3ee' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#22c55e' } },
];

export function useFlowState() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    // --- 1. CONNECT LOGIC ---
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

    // --- 2. DRAG OVER LOGIC ---
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // --- 3. DROP LOGIC (Visual Only) ---
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
                data: { label: label, status: 'active' }, // Default status
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    // --- Helper: Update Result Node ---
    const updateResultNode = useCallback((data: any) => {
        setNodes((nds) => nds.map((n) => 
            n.id === '3' ? { ...n, data: { ...n.data, ...data } } : n
        ));
    }, [setNodes]);

    return {
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onDragOver,
        onDrop,
        setReactFlowInstance,
        updateResultNode,
        reactFlowInstance 
    };
}