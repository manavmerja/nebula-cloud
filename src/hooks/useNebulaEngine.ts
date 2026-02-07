import { useState, useCallback } from 'react';
import { Node, Edge, MarkerType, useReactFlow } from 'reactflow';
import { getLayoutedElements } from '../components/layoutUtils';
import { useToast } from '@/context/ToastContext';

// --- 🛠️ HELPER: Label Extraction ---
const extractLabel = (node: any) => {
    if (node.label) return node.label;
    if (node.data?.label) return node.data.label;
    return "Resource";
};

// --- 🧠 SMART PARSER v3.1: Fixed Logic Hierarchy ---
const parseTerraformToNodes = (code: string) => {
    const nodes: any[] = [];
    const edges: any[] = [];
    const lines = code.split('\n');
    
    // 1. IGNORE LIST
    const IGNORED_TYPES = [
        'aws_route_table_association',
        'aws_route',
        'aws_eip',
        'aws_autoscaling_attachment',
        'aws_lb_target_group_attachment',
        'aws_lb_listener'
    ];

    // 2. RESOURCE MAPPING
    const RESOURCE_MAP: Record<string, string> = {
        'aws_instance': 'EC2 Instance',
        'aws_db_instance': 'RDS Database',
        'aws_s3_bucket': 'S3 Bucket',
        'aws_vpc': 'VPC',
        'aws_subnet': 'Subnet',
        'aws_internet_gateway': 'Internet Gateway',
        'aws_nat_gateway': 'NAT Gateway',
        'aws_lb': 'Load Balancer',
        'aws_security_group': 'Security Group',
        'aws_apprunner_service': 'App Runner Service'
    };

    let vpcId: string | null = null;
    const subnetIds: string[] = [];
    const computeIds: string[] = []; // EC2, AppRunner, Lambda
    const dbIds: string[] = [];      // RDS, Dynamo
    const otherIds: string[] = [];

    // --- PASS 1: CREATE NODES ---
    lines.forEach((line, index) => {
        const resourceMatch = line.match(/resource\s+"([^"]+)"\s+"([^"]+)"/);
        
        if (resourceMatch) {
            const type = resourceMatch[1];
            const name = resourceMatch[2];
            
            if (IGNORED_TYPES.includes(type)) return;

            let label = RESOURCE_MAP[type];
            if (!label) {
                label = type.replace('aws_', '').split('_')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }

            if (type === 'aws_subnet') {
                if (name.includes('public')) label = 'Public Subnet';
                else if (name.includes('private')) label = 'Private Subnet';
            }

            const nodeId = `${type}-${name}`; // Unique ID
            
            // Duplicate Guard
            if (nodes.find(n => n.id === nodeId)) return;

            // 🛑 FIXED LOGIC ORDER HERE 🛑
            if (type === 'aws_vpc') {
                vpcId = nodeId;
            } 
            else if (type === 'aws_subnet') {
                subnetIds.push(nodeId);
            }
            // 1. Check DB FIRST (So it doesn't get caught by 'instance')
            else if (type.includes('db') || type.includes('rds') || type.includes('dynamo') || type.includes('redis')) {
                dbIds.push(nodeId);
            }
            // 2. Check COMPUTE SECOND
            else if (type.includes('instance') || type.includes('apprunner') || type.includes('lambda') || type.includes('ecs') || type.includes('fargate')) {
                computeIds.push(nodeId);
            }
            else {
                otherIds.push(nodeId);
            }

            nodes.push({
                id: nodeId,
                type: 'cloudNode',
                data: { label: label, status: 'active', serviceType: type },
                position: { x: 0, y: 0 }
            });
        }
    });

    // Helper for Edge
    const createEdge = (source: string, target: string) => ({
        id: `e-${source}-${target}`,
        source, target, type: 'nebula', animated: true,
        style: { stroke: '#475569', strokeWidth: 2 }
    });

    // --- PASS 2: HIERARCHY LINKS (VPC -> Subnet -> Resources) ---
    if (vpcId) {
        subnetIds.forEach(subId => edges.push(createEdge(vpcId!, subId)));
        otherIds.forEach(id => edges.push(createEdge(vpcId!, id)));
    }

    if (subnetIds.length > 0) {
        // Distribute Compute across subnets
        computeIds.forEach((compId, index) => {
            const targetSubnet = subnetIds[index % subnetIds.length];
            edges.push(createEdge(targetSubnet, compId));
        });
        
        // Distribute DBs across subnets
        dbIds.forEach((dbId, index) => {
             const targetSubnet = subnetIds[(index + 1) % subnetIds.length];
             edges.push(createEdge(targetSubnet, dbId));
        });

    } else if (vpcId) {
        // Fallback: If no subnets, connect everything to VPC
        computeIds.forEach(compId => edges.push(createEdge(vpcId!, compId)));
        dbIds.forEach(dbId => edges.push(createEdge(vpcId!, dbId)));
    }

    // --- PASS 3: LOGICAL CONNECTIONS (Compute <-> Database) ---
    // Now that dbIds are correctly populated, this will draw the line!
    if (computeIds.length > 0 && dbIds.length > 0) {
        computeIds.forEach(compId => {
            dbIds.forEach(dbId => {
                edges.push(createEdge(compId, dbId));
            });
        });
    }

    return { nodes, edges };
};

export function useNebulaEngine(
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
    updateResultNode: (data: any) => void
) {
    const [aiLoading, setAiLoading] = useState(false);
    const { getNodes, getEdges, fitView } = useReactFlow();
    const toast = useToast();

    // Focus Helper
    const focusOnCloudNodes = useCallback((nodesToFocus: Node[]) => {
        if (nodesToFocus.length === 0) return;
        const cloudNodeIds = nodesToFocus.filter(n => n.type === 'cloudNode').map(n => ({ id: n.id }));
        if (cloudNodeIds.length > 0) {
            setTimeout(() => fitView({ nodes: cloudNodeIds, duration: 1000, padding: 0.2 }), 100);
        }
    }, [fitView]);

    // Layout Processor
    const processLayout = useCallback((rawNodes: any[], rawEdges: any[], direction = 'LR') => {
        const processedEdges = rawEdges.map((edge: any) => ({
            ...edge,
            type: 'nebula', 
            markerEnd: { type: MarkerType.ArrowClosed },
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, processedEdges, direction);
        
        const Y_OFFSET = 450;
        const X_OFFSET = 100;

        const finalNodes = layoutedNodes.map((n) => ({
            ...n,
            position: { x: n.position.x + X_OFFSET, y: n.position.y + Y_OFFSET }
        }));

        return { finalNodes, layoutedEdges };
    }, []);

    // --- HELPER: APPLY AUDIT ---
    const applyAuditToNodes = (nodes: Node[], auditReport: any[]) => {
        if (!auditReport || auditReport.length === 0) return nodes;

        return nodes.map(node => {
            const lowerLabel = (node.data.label || "").toLowerCase();
            const serviceType = (node.data.serviceType || "").toLowerCase();

            const issue = auditReport.find((err: any) => {
                const msg = err.message.toLowerCase();
                
                if (serviceType.includes('db') || serviceType.includes('rds')) return msg.includes('rds') || msg.includes('database');
                if (serviceType.includes('security_group')) return msg.includes('security') || msg.includes('port');
                if (serviceType.includes('s3')) return msg.includes('s3') || msg.includes('bucket');
                return false;
            });

            if (issue) {
                return { ...node, data: { ...node.data, status: 'error', errorMessage: issue.message } };
            }
            return node;
        });
    };

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

            console.log("🎨 Parsing Terraform Code...");
            const { nodes: parsedNodes, edges: parsedEdges } = parseTerraformToNodes(data.terraformCode);
            const { finalNodes, layoutedEdges } = processLayout(parsedNodes, parsedEdges, 'LR');
            const auditedNodes = applyAuditToNodes(finalNodes, data.auditReport || []);
            
            const staticNodeIds = ['1', '2', '3'];
            const staticNodes = currentNodes.filter(n => staticNodeIds.includes(n.id));

            setNodes([...staticNodes, ...auditedNodes]);
            setEdges(layoutedEdges);

            updateResultNode({
                output: `SUMMARY:\n${data.summary}\n\nTERRAFORM CODE:\n${data.terraformCode}`,
                terraformCode: data.terraformCode,
                summary: data.summary,
                auditReport: data.auditReport
            });

            toast.success("Architecture Generated! 🏗️");
            focusOnCloudNodes(auditedNodes);

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
        const { nodes: parsedNodes, edges: parsedEdges } = parseTerraformToNodes(fixResult.terraformCode);
        const { finalNodes, layoutedEdges } = processLayout(parsedNodes, parsedEdges, 'LR');
        const staticNodeIds = ['1', '2', '3'];
        
        setNodes(prev => [...prev.filter(n => staticNodeIds.includes(n.id)), ...finalNodes]);
        setEdges(prev => [...prev.filter(e => ['e1-2', 'e2-3'].includes(e.id)), ...layoutedEdges]); // Keep UI edges

        updateResultNode({
            output: `SUMMARY:\n${fixResult.summary}\n\nTERRAFORM CODE:\n${fixResult.terraformCode}`,
            terraformCode: fixResult.terraformCode,
            auditReport: []
        });
        toast.success("Infrastructure Fixed! 🛡️");
        focusOnCloudNodes(finalNodes);
    }, [processLayout, setNodes, setEdges, updateResultNode, toast, focusOnCloudNodes]);

    // --- 3. SMART SYNC (The Real Fix) ---
    const syncVisualsToCode = useCallback(async () => {
        const currentNodes = getNodes();
        const currentEdges = getEdges();
        
        const resultNode = currentNodes.find(n => n.id === '3');
        const currentCode = resultNode?.data?.terraformCode || "";
        const cloudNodes = currentNodes.filter(n => n.type === 'cloudNode');

        if (cloudNodes.length === 0 && !currentCode) {
            toast.error("Nothing to sync yet.");
            return;
        }

        setAiLoading(true);
        toast.info("Syncing Visual Changes to Terraform... 🔄");

        try {
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    terraformCode: currentCode, 
                    nodes: cloudNodes,
                    edges: currentEdges 
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            console.log("🎨 Re-drawing from Synced Code...");
            const { nodes: parsedNodes, edges: parsedEdges } = parseTerraformToNodes(data.terraformCode);
            const { finalNodes, layoutedEdges } = processLayout(parsedNodes, parsedEdges, 'LR');

            const staticNodeIds = ['1', '2', '3'];
            setNodes(prev => [...prev.filter(n => staticNodeIds.includes(n.id)), ...finalNodes]);
            setEdges(prev => [...prev.filter(e => ['e1-2', 'e2-3'].includes(e.id)), ...layoutedEdges]);

            updateResultNode({
                output: `SYNC COMPLETE:\n${data.summary}\n\nUPDATED CODE:\n${data.terraformCode}`,
                terraformCode: data.terraformCode,
                summary: data.summary,
                auditReport: []
            });

            toast.success("Visuals Synced Successfully! ✅");
            focusOnCloudNodes(finalNodes);

        } catch (error: any) {
            updateResultNode({ output: `Sync Error: ${error.message}` });
            toast.error("Sync Failed. Check console.");
        } finally {
            setAiLoading(false);
        }
    }, [getNodes, getEdges, updateResultNode, processLayout, setNodes, setEdges, toast, focusOnCloudNodes]);
    
    // --- 4. AUTO LAYOUT ---
    const triggerAutoLayout = useCallback(() => {
        const currentNodes = getNodes();
        const currentEdges = getEdges();
        const staticNodes = currentNodes.filter(n => ['1', '2', '3'].includes(n.id));
        const cloudNodes = currentNodes.filter(n => !['1', '2', '3'].includes(n.id));

        if (cloudNodes.length === 0) return;
        
        const { finalNodes, layoutedEdges } = processLayout(cloudNodes, currentEdges, 'LR');
        setNodes([...staticNodes, ...finalNodes]);
        setEdges(layoutedEdges);
        focusOnCloudNodes(finalNodes);
        toast.success("Layout Organized! ✨");
    }, [getNodes, getEdges, processLayout, setNodes, setEdges, focusOnCloudNodes, toast]);

    return { runArchitect, runFixer, syncVisualsToCode, triggerAutoLayout, aiLoading };
}