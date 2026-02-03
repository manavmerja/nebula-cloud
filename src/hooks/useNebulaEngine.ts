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

// --- 🧠 SMART PARSER v2: Logical Hierarchy (Train Fix + Grouping) ---
const parseTerraformToNodes = (code: string) => {
    const nodes: any[] = [];
    const edges: any[] = [];
    const lines = code.split('\n');
    
    // 1. IGNORE LIST (Noise Reduction)
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
        'aws_lb_target_group': 'Target Group',
        'aws_security_group': 'Security Group',
        'aws_route_table': 'Route Table',
        'aws_launch_template': 'Launch Template',
        'aws_autoscaling_group': 'Auto Scaling Group'
    };

    let vpcId: string | null = null;
    const subnetIds: string[] = [];
    const gatewayIds: string[] = [];
    const computeIds: string[] = [];
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

            const nodeId = `${type}-${name}-${index}`;
            
            if (type === 'aws_vpc') vpcId = nodeId;
            else if (type === 'aws_subnet') subnetIds.push(nodeId);
            else if (type.includes('gateway')) gatewayIds.push(nodeId);
            else if (type.includes('instance') || type.includes('rds') || type.includes('autoscaling') || type.includes('lb')) computeIds.push(nodeId);
            else otherIds.push(nodeId);

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

    // --- PASS 2: SMART LINKING ---
    if (vpcId) {
        gatewayIds.forEach(gwId => edges.push(createEdge(vpcId!, gwId)));
        subnetIds.forEach(subId => edges.push(createEdge(vpcId!, subId)));
        otherIds.forEach(id => edges.push(createEdge(vpcId!, id)));
    }

    if (subnetIds.length > 0) {
        computeIds.forEach((compId, index) => {
            const targetSubnet = subnetIds[index % subnetIds.length];
            edges.push(createEdge(targetSubnet, compId));
        });
    } else if (vpcId) {
        computeIds.forEach(compId => edges.push(createEdge(vpcId!, compId)));
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

    const focusOnCloudNodes = useCallback((nodesToFocus: Node[]) => {
        if (nodesToFocus.length === 0) return;
        const cloudNodeIds = nodesToFocus.filter(n => n.type === 'cloudNode').map(n => ({ id: n.id }));
        if (cloudNodeIds.length > 0) {
            setTimeout(() => fitView({ nodes: cloudNodeIds, duration: 1000, padding: 0.2 }), 100);
        }
    }, [fitView]);

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

    // --- HELPER: APPLY AUDIT TO NODES ---
    const applyAuditToNodes = (nodes: Node[], auditReport: any[]) => {
        if (!auditReport || auditReport.length === 0) return nodes;

        return nodes.map(node => {
            const lowerLabel = (node.data.label || "").toLowerCase();
            // const lowerType = (node.data.serviceType || "").toLowerCase(); // Optional usage

            // Find if any error matches this node
            const issue = auditReport.find((err: any) => {
                const msg = err.message.toLowerCase();
                
                // 🧠 Smart Matching Logic v2
                const isDatabase = (lowerLabel.includes('rds') || lowerLabel.includes('database')) && (msg.includes('rds') || msg.includes('database'));
                const isS3 = (lowerLabel.includes('s3') || lowerLabel.includes('bucket')) && (msg.includes('s3') || msg.includes('bucket') || msg.includes('public read'));
                
                // 👇 Improved SG Matching: Matches "0.0.0.0/0", "security group", OR "ssh"
                const isSG = (lowerLabel.includes('security group')) && (
                    msg.includes('0.0.0.0/0') || 
                    msg.includes('security group') || 
                    msg.includes('ssh') ||
                    msg.includes('port')
                );

                const isInstance = (lowerLabel.includes('instance') || lowerLabel.includes('ec2')) && (msg.includes('instance') || msg.includes('cost'));

                return isDatabase || isS3 || isSG || isInstance;
            });

            if (issue) {
                // Determine Status Color based on Severity
                const isWarning = issue.severity === 'WARNING';
                
                return {
                    ...node,
                    data: { 
                        ...node.data, 
                        // Note: Currently UI only supports 'error' (Red) or 'active' (Green).
                        // Future: Add 'warning' status for Yellow.
                        status: 'error', 
                        errorMessage: issue.message 
                    }
                };
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
            
            const staticNodeIds = ['1', '2', '3'];
            const staticNodes = currentNodes.filter(n => staticNodeIds.includes(n.id));
            const staticEdges = currentEdges.filter(e => ['e1-2', 'e2-3'].includes(e.id));

            // Apply Layout
            const { finalNodes, layoutedEdges } = processLayout(parsedNodes, parsedEdges, 'LR');

            // 🔴 APPLY AUDIT RESULTS TO VISUALS
            const auditedNodes = applyAuditToNodes(finalNodes, data.auditReport || []);

            setNodes([...staticNodes, ...auditedNodes]);
            setEdges([...staticEdges, ...layoutedEdges]);

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

        // Fixer successful means no errors, so no applyAuditToNodes needed (or empty list)
        
        const staticNodeIds = ['1', '2', '3'];
        setNodes(prev => [...prev.filter(n => staticNodeIds.includes(n.id)), ...finalNodes]);
        setEdges(prev => [...prev.filter(e => ['e1-2', 'e2-3'].includes(e.id)), ...layoutedEdges]);

        updateResultNode({
            output: `SUMMARY:\n${fixResult.summary}\n\nTERRAFORM CODE:\n${fixResult.terraformCode}`,
            terraformCode: fixResult.terraformCode,
            auditReport: []
        });
        toast.success("Infrastructure Fixed! 🛡️");
        focusOnCloudNodes(finalNodes);
    }, [processLayout, setNodes, setEdges, updateResultNode, toast, focusOnCloudNodes]);

    const syncVisualsToCode = useCallback(async () => { setAiLoading(false); }, []);
    
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