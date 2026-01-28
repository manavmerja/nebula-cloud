import { useState, useCallback } from 'react';
import { Node, Edge, MarkerType, useReactFlow } from 'reactflow';
import { getLayoutedElements } from '../components/layoutUtils';
import { useToast } from '@/context/ToastContext';

const extractLabel = (node: any) => {
    if (node.label) return node.label;
    if (node.data?.label) return node.data.label;
    if (node.data?.serviceType) return node.data.serviceType;
    if (node.name) return node.name;
    return "Resource";
};

export function useNebulaEngine(
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
    updateResultNode: (data: any) => void
) {
    const [aiLoading, setAiLoading] = useState(false);
    const { getNodes, getEdges, fitView } = useReactFlow(); 
    const toast = useToast();

    const focusOnCloudNodes = useCallback((nodesToFocus: Node[]) => {
        if (nodesToFocus.length === 0) return;
        const cloudNodeIds = nodesToFocus.filter(n => n.type === 'cloudNode').map(n => n.id);
        if (cloudNodeIds.length > 0) {
            setTimeout(() => {
                fitView({ nodes: cloudNodeIds.map(id => ({ id })), duration: 1000, padding: 0.2 });
            }, 100);
        }
    }, [fitView]);

    //  CHANGED BACK TO 'TB' (Top-Bottom)
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

    // --- 1. RUN ARCHITECT ---
    const runArchitect = useCallback(async (promptText: string) => {
        if (!promptText) { toast.error("Please enter a prompt first!"); return; }
        setAiLoading(true);
        toast.info("Architect is thinking...");
        updateResultNode({ output: "Generating Architecture & Auditing Security..." });

        const currentNodes = getNodes();
        const currentEdges = getEdges();

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptText, currentState: { nodes: currentNodes, edges: currentEdges } }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const staticNodeIds = ['1', '2', '3'];
            const newNodes = data.nodes
                .filter((n: any) => !staticNodeIds.includes(n.id))
                .map((n: any) => ({
                    id: n.id,
                    type: 'cloudNode',
                    data: { label: extractLabel(n), status: 'active' },
                    position: { x: 0, y: 0 }
                }));

            const staticEdgeIds = ['e1-2', 'e2-3'];
            const newEdges = data.edges ? data.edges.filter((e: any) => !staticEdgeIds.includes(e.id)) : [];

            //  'TB' Layout
            const { finalNodes, layoutedEdges } = processLayout(newNodes, newEdges, 'TB');

            const auditedNodes = finalNodes.map(node => {
                const lowerLabel = node.data.label.toLowerCase();
                if (data.auditReport) {
                    const error = data.auditReport.find((err: any) => {
                         const msg = err.message.toLowerCase();
                         return msg.includes(lowerLabel) || (lowerLabel.includes('s3') && msg.includes('bucket')) || (lowerLabel.includes('db') && msg.includes('database'));
                    });
                    if (error) { node.data.status = 'error'; node.data.errorMessage = error.message; }
                }
                return node;
            });

            setNodes(prev => [...prev.filter(n => staticNodeIds.includes(n.id)), ...auditedNodes]);
            setEdges(prev => [...prev.filter(e => staticEdgeIds.includes(e.id)), ...layoutedEdges]);
            updateResultNode({ output: `SUMMARY:\n${data.summary}\n\nTERRAFORM CODE:\n${data.terraformCode}`, terraformCode: data.terraformCode, summary: data.summary, auditReport: data.auditReport });
            toast.success("Architecture Generated!");
            focusOnCloudNodes(finalNodes);

        } catch (error: any) {
            updateResultNode({ output: `Error: ${error.message}` });
            toast.error(`Generation Failed: ${error.message}`);
        } finally {
            setAiLoading(false);
        }
    }, [getNodes, getEdges, processLayout, setNodes, setEdges, updateResultNode, toast, focusOnCloudNodes]);

    // --- 2. RUN FIXER ---
    const runFixer = useCallback(async (fixResult: any) => {
        toast.info("Applying Security Fixes...");
        const rawNodes = fixResult.nodes.map((node: any) => ({
            id: node.id, type: 'cloudNode', data: { label: extractLabel(node), status: 'active' }, position: { x: 0, y: 0 }
        }));
        //  'TB' Layout
        const { finalNodes, layoutedEdges } = processLayout(rawNodes, fixResult.edges || [], 'TB');
        setNodes(prev => [...prev.filter(n => ['1', '2', '3'].includes(n.id)), ...finalNodes]);
        setEdges(prev => [...prev.filter(e => ['e1-2', 'e2-3'].includes(e.id)), ...layoutedEdges]);
        updateResultNode({ output: `SUMMARY:\n${fixResult.summary}\n\nTERRAFORM CODE:\n${fixResult.terraformCode}`, terraformCode: fixResult.terraformCode, auditReport: [] });
        toast.success("Infrastructure Fixed & Secured! 🛡️");
        focusOnCloudNodes(finalNodes);
    }, [processLayout, setNodes, setEdges, updateResultNode, toast, focusOnCloudNodes]);

    // --- 3. SMART SYNC ---
    const syncVisualsToCode = useCallback(async () => {
        setAiLoading(true);
        toast.info("Syncing Visual Changes...");
        updateResultNode({ output: "🤖 Analyzing Visual Changes..." });

        const currentNodes = getNodes();
        const currentEdges = getEdges();
        const resultNode = currentNodes.find(n => n.id === '3');
        let existingCode = "";
        if (resultNode?.data?.terraformCode) { existingCode = resultNode.data.terraformCode; }
        else if (resultNode?.data?.output && !resultNode.data.output.startsWith('//')) {
             const parts = resultNode.data.output.split('TERRAFORM CODE:');
             if(parts.length > 1) existingCode = parts[1];
        }

        const topology = {
            nodes: currentNodes.filter(n => n.type === 'cloudNode').map((n: any) => ({ id: n.id, label: n.data.label })),
            edges: currentEdges.filter(e => e.source !== '1' && e.target !== '3').map(e => ({ source: e.source, target: e.target }))
        };

        if (topology.nodes.length === 0) {
             updateResultNode({ output: "// Canvas is empty. Drag resources to start.", terraformCode: "", summary: "Canvas Cleared", auditReport: [] });
            setAiLoading(false); return;
        }

        try {
            const response = await fetch('/api/fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    terraformCode: existingCode || "# No existing code", 
                    auditReport: [{ level: "info", message: `SYNC_REQUEST: Rebuild Terraform from this TOPOLOGY: ${JSON.stringify(topology)}` }]
                })
            });
            const result = await response.json();
            if (result.error) throw new Error(result.error);
            const rawNodes = result.nodes.map((node: any) => ({
                id: node.id, type: 'cloudNode', data: { label: extractLabel(node), status: 'active' }, position: { x: 0, y: 0 }
            }));
            //  'TB' Layout
            const { finalNodes, layoutedEdges } = processLayout(rawNodes, result.edges || [], 'TB');
            setNodes(prev => [...prev.filter(n => ['1', '2', '3'].includes(n.id)), ...finalNodes]);
            setEdges(prev => [...prev.filter(e => ['e1-2', 'e2-3'].includes(e.id)), ...layoutedEdges]);
            updateResultNode({ output: `SUMMARY:\n${result.summary}\n\nTERRAFORM CODE:\n${result.terraformCode}`, terraformCode: result.terraformCode, auditReport: [] });
            toast.success("Code Synced with Visuals!");
            focusOnCloudNodes(finalNodes);
        } catch (error: any) {
            updateResultNode({ output: `Sync Error: ${error.message}` });
            toast.error("Sync Failed");
        } finally {
            setAiLoading(false);
        }
    }, [getNodes, getEdges, updateResultNode, processLayout, setNodes, setEdges, toast, focusOnCloudNodes]);

    // --- 4. AUTO-LAYOUT ---
    const triggerAutoLayout = useCallback(() => {
        const currentNodes = getNodes();
        const currentEdges = getEdges();
        const staticNodes = currentNodes.filter(n => ['1', '2', '3'].includes(n.id));
        const cloudNodes = currentNodes.filter(n => !['1', '2', '3'].includes(n.id));

        if (cloudNodes.length === 0) { toast.info("No cloud resources to arrange."); return; }
        toast.info("Arranging Layout...");

        //  'TB' Layout
        const { finalNodes, layoutedEdges } = processLayout(cloudNodes, currentEdges, 'TB');

        setNodes([...staticNodes, ...finalNodes]);
        setEdges(layoutedEdges);
        setTimeout(() => toast.success("Layout Organized! ✨"), 500);
        focusOnCloudNodes(finalNodes);
    }, [getNodes, getEdges, processLayout, setNodes, setEdges, toast, focusOnCloudNodes]);

    return { runArchitect, runFixer, syncVisualsToCode, triggerAutoLayout, aiLoading };
}