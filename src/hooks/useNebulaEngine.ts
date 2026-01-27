// AI Engine ne Sambhade che like Call karawo te and Smart Sync Logic pan che 

import { useState, useCallback } from 'react';
import { Node, Edge, MarkerType, useReactFlow } from 'reactflow';
import { getLayoutedElements } from '../components/layoutUtils';

// Interface defined at top
interface CloudNode {
    id: string;
    type: string;
    data: { label: string };
}

export function useNebulaEngine(
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
    updateResultNode: (data: any) => void
) {
    const [aiLoading, setAiLoading] = useState(false);
    const { getNodes, getEdges } = useReactFlow();

    // --- HELPER: Process & Layout Data ---
    const processLayout = useCallback((rawNodes: any[], rawEdges: any[], direction = 'TB') => {
        // 👇 FIX: Added 'index' to ensure Unique IDs
        const processedEdges = rawEdges.map((edge: any, index: number) => ({
            id: edge.id ? `${edge.id}-${index}` : `edge-${index}-${Date.now()}`, // Unique ID guaranteed
            source: edge.source,
            target: edge.target,
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            rawNodes,
            processedEdges, // Use the new unique edges
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
    const runArchitect = useCallback(async (promptText: string) => {
        if (!promptText) {
            alert("Please enter a prompt first!");
            return;
        }

        setAiLoading(true);
        updateResultNode({ output: "Generating Architecture & Auditing Security..." });

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
    const runFixer = useCallback(async (fixResult: any) => {
        console.log("Applying Fixes...", fixResult);

       const rawNodes = fixResult.nodes.map((node: any) => ({
            id: node.id,
            type: 'cloudNode',
            data: { 
                // Label dhoondo: Ya to node.label, ya node.data.label, ya fallback "Resource"
                label: node.label || node.data?.label || "Resource", 
                status: 'active' 
            },
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

    // --- 3. SMART SYNC (Fixed: Updates Visuals too) ---
    const syncVisualsToCode = useCallback(async () => {
        setAiLoading(true);
        updateResultNode({ output: "🤖 Analyzing Visual Changes, Fixing Issues & Updating Code..." });

        const currentNodes = getNodes();
        const currentEdges = getEdges();
        
        // 1. Get Existing Code
        const resultNode = currentNodes.find(n => n.id === '3');
        let existingCode = "";
        if (resultNode?.data?.terraformCode) {
            existingCode = resultNode.data.terraformCode;
        }

        // 2. Prepare Topology
        const topology = {
            nodes: currentNodes
                .filter(n => n.type === 'cloudNode')
                .map((n: any) => ({ id: n.id, label: n.data.label })),
            edges: currentEdges
                .filter(e => e.source !== '1' && e.target !== '3') 
                .map(e => ({ source: e.source, target: e.target }))
        };

        if (topology.nodes.length === 0) {
             updateResultNode({
                output: "// Canvas is empty. Drag resources to start.",
                terraformCode: "",
                summary: "Canvas Cleared",
                auditReport: []
            });
            setAiLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    terraformCode: existingCode || "# No existing code", 
                    auditReport: [
                        { 
                            level: "info", 
                            message: "SYNC_REQUEST_INCREMENTAL: The user updated the diagram visually. Compare the provided TOPOLOGY_DATA with the provided TERRAFORM_CODE. Add missing resources, remove deleted ones, update connections, and FIX any security issues found in the process. Return the UPDATED nodes and edges JSON." 
                        },
                        {
                            level: "info",
                            message: `TOPOLOGY_DATA: ${JSON.stringify(topology)}`
                        }
                    ]
                })
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            // AI ne jo naye nodes/edges bheje hain (jisme red color nahi hai), unhe process karo
            console.log("Sync Result Nodes:", result.nodes);

          const rawNodes = result.nodes.map((node: any) => ({
                id: node.id,
                type: 'cloudNode',
                data: { 
                    // Same robust check here
                    label: node.label || node.data?.label || "Resource", 
                    status: node.data?.status || 'active' 
                },
                position: { x: 0, y: 0 }
            }));
            
            // Layout calculate karo
            const { finalNodes, layoutedEdges } = processLayout(rawNodes, result.edges || [], 'TB');

            // Canvas update karo (Purane UI nodes + Naye Cloud nodes)
            setNodes(prev => [
                ...prev.filter(n => ['1', '2', '3'].includes(n.id)),
                ...finalNodes
            ]);

            setEdges(prev => [
                ...prev.filter(e => ['e1-2', 'e2-3'].includes(e.id)),
                ...layoutedEdges
            ]);

            updateResultNode({
                output: `SUMMARY:\n${result.summary}\n\nTERRAFORM CODE:\n${result.terraformCode}`,
                terraformCode: result.terraformCode,
                auditReport: [] // Clear errors in editor
            });

        } catch (error: any) {
            console.error("Sync Error:", error);
            updateResultNode({ output: `Sync Error: ${error.message}` });
        } finally {
            setAiLoading(false);
        }
    }, [getNodes, getEdges, updateResultNode, processLayout, setNodes, setEdges]); 

    return { runArchitect, runFixer, syncVisualsToCode, aiLoading };
}