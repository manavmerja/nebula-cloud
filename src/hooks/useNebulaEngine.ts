// AI Engine ne Sambhade che like Call karawo te 

import { useState, useCallback } from 'react';
import { Node, Edge, MarkerType, useReactFlow } from 'reactflow'; // useReactFlow added
import { getLayoutedElements } from '../components/layoutUtils';

export function useNebulaEngine(
    // nodes/edges hataye, ab hum direct internal state use karenge
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>, 
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
    updateResultNode: (data: any) => void
) {
    const [aiLoading, setAiLoading] = useState(false);
    const { getNodes, getEdges } = useReactFlow(); // 👈 Access current state directly

    // --- HELPER: Process & Layout Data ---
    const processLayout = useCallback((rawNodes: any[], rawEdges: any[], direction = 'TB') => {
        const processedEdges = rawEdges.map((edge: any) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            rawNodes,
            processedEdges,
            direction
        );

        const Y_OFFSET = 450;
        const X_OFFSET = 100;

        const finalNodes = layoutedNodes.map((n) => ({
            ...n,
            position: { x: n.position.x + X_OFFSET, y: n.position.y + Y_OFFSET }
        }));

        return { finalNodes, layoutedEdges };
    }, []);

    // --- 1. AGENT A & B: GENERATE + AUDIT ---
    const runArchitect = useCallback(async (promptText: string) => { // 👈 Wrapped in useCallback
        if (!promptText) {
            alert("Please enter a prompt first!");
            return;
        }

        setAiLoading(true);
        updateResultNode({ output: "Generating Architecture & Auditing Security..." });

        // 👈 Get fresh state dynamically (No dependency on 'nodes' prop)
        const currentNodes = getNodes();
        const currentEdges = getEdges();

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: promptText, 
                    currentState: { nodes: currentNodes, edges: currentEdges } 
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const staticNodeIds = ['1', '2', '3'];
            const newNodes = data.nodes
                .filter((n: any) => !staticNodeIds.includes(n.id))
                .map((n: any) => ({
                    id: n.id,
                    type: 'cloudNode',
                    data: { 
                        label: n.label || n.data?.label || "Resource",
                        status: 'active' 
                    },
                    position: { x: 0, y: 0 }
                }));

            const staticEdgeIds = ['e1-2', 'e2-3'];
            const newEdges = data.edges ? data.edges.filter((e: any) => !staticEdgeIds.includes(e.id)) : [];

            const { finalNodes, layoutedEdges } = processLayout(newNodes, newEdges, 'TB');

            const auditedNodes = finalNodes.map(node => {
                const lowerLabel = node.data.label.toLowerCase();
                const error = data.auditReport?.find((err: any) => {
                     const msg = err.message.toLowerCase();
                     return msg.includes(lowerLabel) || 
                            (lowerLabel.includes('s3') && msg.includes('bucket')) ||
                            (lowerLabel.includes('db') && msg.includes('database'));
                });
                
                if (error) {
                    node.data.status = 'error';
                    node.data.errorMessage = error.message;
                }
                return node;
            });

            setNodes(prev => [
                ...prev.filter(n => staticNodeIds.includes(n.id)),
                ...auditedNodes
            ]);
            
            setEdges(prev => [
                ...prev.filter(e => staticEdgeIds.includes(e.id)),
                ...layoutedEdges
            ]);

            const finalOutput = `SUMMARY:\n${data.summary}\n\nTERRAFORM CODE:\n${data.terraformCode}`;
            updateResultNode({
                output: finalOutput,
                terraformCode: data.terraformCode,
                summary: data.summary,
                auditReport: data.auditReport
            });

        } catch (error: any) {
            console.error(error);
            updateResultNode({ output: `Error: ${error.message}` });
        } finally {
            setAiLoading(false);
        }
    }, [getNodes, getEdges, processLayout, setNodes, setEdges, updateResultNode]);

    // --- 2. AGENT C: FIXER ---
    const runFixer = useCallback(async (fixResult: any) => { // 👈 Wrapped in useCallback
        console.log("Applying Fixes...", fixResult);

        const rawNodes = fixResult.nodes.map((node: any) => ({
            id: node.id,
            type: 'cloudNode',
            data: { label: node.label, status: 'active' },
            position: { x: 0, y: 0 }
        }));

        const { finalNodes, layoutedEdges } = processLayout(rawNodes, fixResult.edges || [], 'TB');

        setNodes(prev => [
            ...prev.filter(n => ['1', '2', '3'].includes(n.id)),
            ...finalNodes
        ]);

        setEdges(prev => [
            ...prev.filter(e => ['e1-2', 'e2-3'].includes(e.id)),
            ...layoutedEdges
        ]);

        updateResultNode({
            output: `SUMMARY:\n${fixResult.summary}\n\nTERRAFORM CODE:\n${fixResult.terraformCode}`,
            terraformCode: fixResult.terraformCode,
            auditReport: [] 
        });
    }, [processLayout, setNodes, setEdges, updateResultNode]);

    // --- 3. SYNC VISUALS ---
    const syncVisualsToCode = useCallback(async () => {
        console.log("Sync triggered");
    }, []);

    return { runArchitect, runFixer, aiLoading, syncVisualsToCode };
}