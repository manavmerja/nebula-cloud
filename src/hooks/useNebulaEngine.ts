// AI Engine ne Sambhade che like Call karawo te and Smart Sync Logic pan che

import { useState, useCallback } from 'react';
import { Node, Edge, MarkerType, useReactFlow } from 'reactflow';
import { getLayoutedElements } from '../components/layoutUtils';

export function useNebulaEngine(
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
    updateResultNode: (data: any) => void
) {
    const [aiLoading, setAiLoading] = useState(false);
    const { getNodes, getEdges } = useReactFlow();

    const extractLabel = (node: any) => {
        // 1. Direct Label
        if (node.label) return node.label;
        // 2. Data Label
        if (node.data?.label) return node.data.label;
        // 3. Service Type (fallback)
        if (node.data?.serviceType) return node.data.serviceType;
        // 4. Name (fallback)
        if (node.name) return node.name;
        // 5. Final Default
        return "Resource";
    };

    // --- HELPER: Process & Layout Data ---
    // --- HELPER: Process & Layout Data (Used for NEW generations only) ---
    const processLayout = useCallback((rawNodes: any[], rawEdges: any[], direction = 'TB') => {
        const processedEdges = rawEdges.map((edge: any, index: number) => ({
            id: edge.id ? `${edge.id}-${index}` : `edge-${index}-${Date.now()}`,
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

        // Shift layout down to avoid overlapping the prompt/result nodes
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

            // Filter out the static nodes (1, 2, 3)
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

            // Apply Layout for NEW architecture
            const { finalNodes, layoutedEdges } = processLayout(newNodes, newEdges, 'TB');

            // Apply Audit Results (Red Borders)
            const auditedNodes = finalNodes.map(node => {
                const lowerLabel = node.data.label.toLowerCase();
                if (data.auditReport) {
                    const error = data.auditReport.find((err: any) => {
                         const msg = err.message.toLowerCase();
                         return msg.includes(lowerLabel) ||
                                (lowerLabel.includes('s3') && msg.includes('bucket')) ||
                                (lowerLabel.includes('db') && msg.includes('database'));
                    });

                    if (error) {
                        node.data.status = 'error';
                        node.data.errorMessage = error.message;
                    }
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

            updateResultNode({
                output: `SUMMARY:\n${data.summary}\n\nTERRAFORM CODE:\n${data.terraformCode}`,
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

    // --- 2. AGENT C: FIXER (✅ FIXED: "NO SCATTERING" LOGIC) ---
    const runFixer = useCallback(async (fixResult: any) => {
        console.log("Applying Fixes (Preserving Layout)...", fixResult);

        // 🟢 STEP 1: Get the exact current positions from the screen
        const currentNodes = getNodes();
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

        // 🟢 STEP 2: Smart Merge - Keep position if node exists
        const finalNodes = fixResult.nodes.map((fixedNode: any) => {
            // Find the node on screen that matches the ID from the fix result
            const existingNode = currentNodes.find(n => n.id === fixedNode.id);

            // If it exists, KEEP its position. If it's new, put it at 50,50.
            const position = existingNode ? existingNode.position : { x: 50, y: 50 };

            return {
                id: fixedNode.id,
                type: 'cloudNode',
                data: {
                    label: fixedNode.label || fixedNode.data?.label || "Resource",
                    status: 'active' // Force Green status
                },
                position: position // 👈 THIS LINE PREVENTS SCATTERING
            };
        });

        // 3. Update Nodes
        setNodes(prev => [
            ...prev.filter(n => ['1', '2', '3'].includes(n.id)), // Keep static nodes
            ...finalNodes // Add fixed nodes with preserved positions
        ]);

        // 4. Update Edges
        // We trust the fixResult edges, but ensure they are formatted for React Flow
        const newEdges = (fixResult.edges || []).map((e: any, i: number) => ({
             id: e.id || `edge-${i}-${Date.now()}`,
             source: e.source,
             target: e.target,
             animated: true,
             style: { stroke: '#94a3b8', strokeWidth: 2 },
             type: 'smoothstep',
             markerEnd: { type: MarkerType.ArrowClosed },
        }));

        setEdges(prev => [
            ...prev.filter(e => ['e1-2', 'e2-3'].includes(e.id)),
            ...newEdges
        ]);

        updateResultNode({
            output: `SUMMARY:\n${fixResult.summary}\n\nTERRAFORM CODE:\n${fixResult.terraformCode}`,
            terraformCode: fixResult.terraformCode,
            auditReport: [] // Clear errors
        });
    }, [getNodes, setNodes, setEdges, updateResultNode]);

    // --- 3. SMART SYNC (Visuals -> Code) ---
    const syncVisualsToCode = useCallback(async () => {
        setAiLoading(true);
        updateResultNode({ output: "🤖 Analyzing Visual Changes..." });

        const currentNodes = getNodes();
        const currentEdges = getEdges();

        // Prepare Topology
        const topology = {
            nodes: currentNodes
                .filter(n => n.type === 'cloudNode')
                .map((n: any) => ({ id: n.id, label: n.data.label })),
            edges: currentEdges
                .filter(e => e.source !== '1' && e.target !== '3')
                .map(e => ({ source: e.source, target: e.target }))
        };

        try {
            const response = await fetch('/api/fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    terraformCode: "", // Empty so it regenerates based on topology
                    auditReport: [
                        {
                            level: "info",
                            message: `SYNC_REQUEST: Rebuild Terraform from this TOPOLOGY: ${JSON.stringify(topology)}`
                        }
                    ]
                })
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            // Re-run the Fixer logic (which now preserves layout!)
            // Or if you want a full re-layout for Sync, you can use processLayout here.
            // For now, let's treat Sync as a "Regenerate" event which allows layout updates.

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
                auditReport: []
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