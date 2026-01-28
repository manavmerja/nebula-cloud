import { useState, useCallback } from 'react';
import { Node, Edge, MarkerType, useReactFlow } from 'reactflow';
import { getLayoutedElements } from '../components/layoutUtils';
import { useToast } from '@/context/ToastContext'; // 🔔 Import Toast

// 👇👇👇 1. LABEL FIX HELPER (RESTORED) 👇👇👇
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

export function useNebulaEngine(
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
    updateResultNode: (data: any) => void
) {
    const [aiLoading, setAiLoading] = useState(false);
    const { getNodes, getEdges } = useReactFlow();
    const toast = useToast();

    // --- HELPER: Process & Layout Data ---
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
            toast.error("Please enter a prompt first!");
            return;
        }

        setAiLoading(true);
        toast.info("Architect is thinking...");
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
                        label: extractLabel(n), // 👈 Using Helper
                        status: 'active'
                    },
                    position: { x: 0, y: 0 }
                }));

            const staticEdgeIds = ['e1-2', 'e2-3'];
            const newEdges = data.edges ? data.edges.filter((e: any) => !staticEdgeIds.includes(e.id)) : [];

            const { finalNodes, layoutedEdges } = processLayout(newNodes, newEdges, 'TB');

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

            toast.success("Architecture Generated!");

        } catch (error: any) {
            console.error(error);
            updateResultNode({ output: `Error: ${error.message}` });
            toast.error(`Generation Failed: ${error.message}`);
        } finally {
            setAiLoading(false);
        }
    }, [getNodes, getEdges, processLayout, setNodes, setEdges, updateResultNode, toast]);


    // --- 2. AGENT C: FIXER (Robust Labeling Restored) ---
    const runFixer = useCallback(async (fixResult: any) => {
        console.log("Applying Fixes...", fixResult);
        toast.info("Applying Security Fixes...");

        const currentNodes = getNodes();

        // 1. Process Nodes
        const finalNodes = fixResult.nodes.map((fixedNode: any) => {
            const existingNode = currentNodes.find(n => n.id === fixedNode.id);
            const position = existingNode ? existingNode.position : { x: 50, y: 50 };

            return {
                id: fixedNode.id,
                type: 'cloudNode',
                data: {
                    label: extractLabel(fixedNode), // 👈 Using Helper
                    status: 'active'
                },
                position: position
            };
        });

        // 2. Validate IDs
        const validNodeIds = new Set([
            '1', '2', '3',
            ...finalNodes.map((n: any) => n.id)
        ]);

        // 3. Process Edges
        const newEdges = (fixResult.edges || [])
            .filter((e: any) => validNodeIds.has(e.source) && validNodeIds.has(e.target))
            .map((e: any, i: number) => ({
                 id: e.id || `edge-${i}-${Date.now()}`,
                 source: e.source,
                 target: e.target,
                 animated: true,
                 style: { stroke: '#94a3b8', strokeWidth: 2 },
                 type: 'smoothstep',
                 markerEnd: { type: MarkerType.ArrowClosed },
            }));

        // 4. Update State
        setNodes(prev => [
            ...prev.filter(n => ['1', '2', '3'].includes(n.id)),
            ...finalNodes
        ]);

        setEdges(prev => {
            const staticEdges = prev.filter(e =>
                ['1', '2', '3'].includes(e.source) ||
                ['1', '2', '3'].includes(e.target)
            );
            return [...staticEdges, ...newEdges];
        });

        updateResultNode({
            output: `SUMMARY:\n${fixResult.summary}\n\nTERRAFORM CODE:\n${fixResult.terraformCode}`,
            terraformCode: fixResult.terraformCode,
            auditReport: []
        });

        toast.success("Infrastructure Fixed & Secured! 🛡️");
    }, [getNodes, setNodes, setEdges, updateResultNode, toast]);


    // --- 3. SMART SYNC (FIXED: Empty Code Bug & Label Issue) ---
    const syncVisualsToCode = useCallback(async () => {
        setAiLoading(true);
        toast.info("Syncing Visual Changes...");
        updateResultNode({ output: "🤖 Analyzing Visual Changes..." });

        const currentNodes = getNodes();
        const currentEdges = getEdges();

        // 1. Get Existing Code (Node 3)
        const resultNode = currentNodes.find(n => n.id === '3');
        let existingCode = "";
        
        // Handle different data structures safely
        if (resultNode?.data?.terraformCode) {
            existingCode = resultNode.data.terraformCode;
        } else if (resultNode?.data?.output && !resultNode.data.output.startsWith('//')) {
             // Fallback: If output has code but not in terraformCode prop
             const parts = resultNode.data.output.split('TERRAFORM CODE:');
             if(parts.length > 1) existingCode = parts[1];
        }

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
                    // 👇 FIX 1: Send placeholder if code is empty to pass API validation
                    terraformCode: existingCode || "# No existing code", 
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

            // Treat Sync as a "Regenerate" event which allows layout updates/cleanups
            const rawNodes = result.nodes.map((node: any) => ({
                id: node.id,
                type: 'cloudNode',
                data: { 
                    label: extractLabel(node), // 👈 FIX 2: Use Helper
                    status: 'active' 
                },
                position: { x: 0, y: 0 }
            }));

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

            toast.success("Code Synced with Visuals!");

        } catch (error: any) {
            console.error("Sync Error:", error);
            updateResultNode({ output: `Sync Error: ${error.message}` });
            toast.error("Sync Failed");
        } finally {
            setAiLoading(false);
        }
    }, [getNodes, getEdges, updateResultNode, processLayout, setNodes, setEdges, toast]);

    // --- 4. 🧹 MANUAL AUTO-LAYOUT ---
    const triggerAutoLayout = useCallback(() => {
        const currentNodes = getNodes();
        const currentEdges = getEdges();

        const staticNodes = currentNodes.filter(n => ['1', '2', '3'].includes(n.id));
        const cloudNodes = currentNodes.filter(n => !['1', '2', '3'].includes(n.id));

        if (cloudNodes.length === 0) {
            toast.info("No cloud resources to arrange.");
            return;
        }

        toast.info("Arranging Layout...");

        const { finalNodes, layoutedEdges } = processLayout(cloudNodes, currentEdges, 'TB');

        setNodes([...staticNodes, ...finalNodes]);
        setEdges(layoutedEdges);

        setTimeout(() => toast.success("Layout Organized! ✨"), 500);

    }, [getNodes, getEdges, processLayout, setNodes, setEdges, toast]);

    return { runArchitect, runFixer, syncVisualsToCode, triggerAutoLayout, aiLoading };
}