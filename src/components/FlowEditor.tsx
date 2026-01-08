'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    ReactFlowProvider,
    useReactFlow,
    MarkerType, // Arrow heads ke liye
    Node,
} from 'reactflow';
import { Play, Loader2 } from 'lucide-react'; // Loader icon add kiya

import 'reactflow/dist/style.css';
import PromptNode from './nodes/PromptNode';
import AINode from './nodes/AINode';
import ResultNode from './nodes/ResultNode';
import CloudServiceNode from './nodes/CloudServiceNode';

// --- MOCK NODE GENERATOR FROM PROMPT ---
const generateMockNodesFromPrompt = (prompt: string) => {
    const lowerPrompt = prompt.toLowerCase();
    const mockNodes = [];
    
    // Simple keyword matching
    if (lowerPrompt.includes('ec2') || lowerPrompt.includes('server') || lowerPrompt.includes('instance')) {
        mockNodes.push({ data: { label: 'EC2 Instance' } });
    }
    if (lowerPrompt.includes('s3') || lowerPrompt.includes('storage') || lowerPrompt.includes('bucket')) {
        mockNodes.push({ data: { label: 'S3 Bucket' } });
    }
    if (lowerPrompt.includes('rds') || lowerPrompt.includes('database') || lowerPrompt.includes('mysql')) {
        mockNodes.push({ data: { label: 'RDS' } });
    }
    if (lowerPrompt.includes('lambda') || lowerPrompt.includes('function') || lowerPrompt.includes('serverless')) {
        mockNodes.push({ data: { label: 'Lambda' } });
    }
    if (lowerPrompt.includes('vpc') || lowerPrompt.includes('network')) {
        mockNodes.push({ data: { label: 'VPC' } });
    }
    
    // Default fallback
    if (mockNodes.length === 0) {
        mockNodes.push(
            { data: { label: 'EC2 Instance' } },
            { data: { label: 'S3 Bucket' } }
        );
    }
    
    return mockNodes;
};

// --- BASIC TERRAFORM GENERATOR (Local Generation) ---
const generateBasicTerraform = (cloudNodes: Node[]) => {
    let terraform = `# Generated Infrastructure\n# Services: ${cloudNodes.map(n => n.data.label).join(', ')}\n\n`;
    
    cloudNodes.forEach((node, index) => {
        const service = node.data.label;
        const resourceName = service.toLowerCase().replace(/\s+/g, '_');
        
        switch (service) {
            case 'EC2 Instance':
                terraform += `resource "aws_instance" "${resourceName}_${index}" {\n  ami           = "ami-0c55b159cbfafe1f0"\n  instance_type = "t3.micro"\n  \n  tags = {\n    Name = "${service}"\n  }\n}\n\n`;
                break;
            case 'S3 Bucket':
                terraform += `resource "aws_s3_bucket" "${resourceName}_${index}" {\n  bucket = "my-bucket-${Date.now()}"\n  \n  tags = {\n    Name = "${service}"\n  }\n}\n\n`;
                break;
            case 'RDS':
                terraform += `resource "aws_db_instance" "${resourceName}_${index}" {\n  engine         = "mysql"\n  engine_version = "8.0"\n  instance_class = "db.t3.micro"\n  allocated_storage = 20\n  db_name        = "mydb"\n  username       = "admin"\n  password       = "password"\n  \n  tags = {\n    Name = "${service}"\n  }\n}\n\n`;
                break;
            case 'Lambda':
                terraform += `resource "aws_lambda_function" "${resourceName}_${index}" {\n  filename      = "lambda_function.zip"\n  function_name = "${service.replace(/\s+/g, '_')}_function"\n  role          = aws_iam_role.lambda_role.arn\n  handler       = "index.handler"\n  runtime       = "nodejs18.x"\n  \n  tags = {\n    Name = "${service}"\n  }\n}\n\n`;
                break;
            case 'VPC':
                terraform += `resource "aws_vpc" "${resourceName}_${index}" {\n  cidr_block           = "10.0.0.0/16"\n  enable_dns_hostnames = true\n  enable_dns_support   = true\n  \n  tags = {\n    Name = "${service}"\n  }\n}\n\n`;
                break;
            case 'DynamoDB':
                terraform += `resource "aws_dynamodb_table" "${resourceName}_${index}" {\n  name           = "${service.replace(/\s+/g, '_')}_table"\n  billing_mode   = "PAY_PER_REQUEST"\n  hash_key       = "id"\n  \n  attribute {\n    name = "id"\n    type = "S"\n  }\n  \n  tags = {\n    Name = "${service}"\n  }\n}\n\n`;
                break;
            default:
                terraform += `# ${service} configuration\n# Add specific resource configuration here\n\n`;
        }
    });
    
    return terraform;
};

// --- TYPES ---
type NodeData = {
    text?: string;
    model?: string;
    output?: string;
    label?: string;
    onSync?: (newCode: string) => Promise<void>; // For synchronizing code with visuals
};

// --- INITIAL DATA ---
const initialNodes: Node<NodeData>[] = [
    { id: '1', type: 'promptNode', data: { text: '' }, position: { x: 50, y: 250 } },
    { id: '2', type: 'aiNode', data: { model: 'groq-llama' }, position: { x: 450, y: 250 } },
    { id: '3', type: 'resultNode', data: { output: '' }, position: { x: 900, y: 250 } },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#22d3ee' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#22c55e' } },
];

const nodeTypes = {
    promptNode: PromptNode,
    aiNode: AINode,
    resultNode: ResultNode,
    cloudNode: CloudServiceNode,
};

interface FlowEditorProps {
  isDark: boolean;
  onCodeUpdate?: (code: string) => void;
}

function Flow({ isDark, onCodeUpdate }: FlowEditorProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    // --- NEW: Visual -> Code Sync Logic ---
    const triggerVisualSync = useCallback(async (currentNodes: Node[], currentEdges: Edge[]) => {
        console.log("🔄 Auto-Syncing Code from Visuals...");
        
        // 1. UI Update: User ko dikhao ki kaam chal raha hai
        setNodes((nds) => nds.map((n) => 
            n.id === '3' ? { ...n, data: { ...n.data, output: "Syncing changes..." } } : n
        ));

        // Get cloud nodes for processing
        const cloudNodes = currentNodes.filter(n => n.type === 'cloudNode');
        
        if (cloudNodes.length === 0) {
            console.log("⚠️ No cloud nodes to sync");
            return;
        }

        console.log("🔍 Cloud nodes found for sync:", cloudNodes);

        // Generate code locally (bypass API for now)
        const generatedCode = generateBasicTerraform(cloudNodes);
        const summary = `Generated infrastructure with ${cloudNodes.length} services: ${cloudNodes.map(n => n.data.label).join(', ')}`;
        
        // Update Result Node with generated code
        const finalOutput = `SUMMARY:\n${summary}\n\nTERRAFORM CODE:\n${generatedCode}`;
        
        setNodes((nds) => nds.map((n) => 
            n.id === '3' ? { ...n, data: { ...n.data, output: finalOutput } } : n
        ));

        // Update main code editor
        if (onCodeUpdate) {
            onCodeUpdate(generatedCode);
            console.log("✅ Code updated in main editor (local generation)");
        }
    }, [setNodes, onCodeUpdate]);

    const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        event.stopPropagation();
        setShowDeleteConfirm(edge.id);
    }, []);

    const onDeleteNode = useCallback((nodeId: string) => {
        const deletedNode = nodes.find(node => node.id === nodeId);
        
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
        
        // Update result node to show deletion
        if (deletedNode && deletedNode.type === 'cloudNode') {
            setNodes((nds) => nds.map((n) => 
                n.id === '3' ? { 
                    ...n, 
                    data: { 
                        ...n.data, 
                        output: `Deleted ${deletedNode.data.label} service from architecture` 
                    } 
                } : n
            ));
        }
    }, [setNodes, setEdges, nodes]);

    // Input sync logic
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === '1') {
                    node.data = { ...node.data, text: userInput };
                }
                return node;
            })
        );
    }, [userInput, setNodes]);

   const onConnect = useCallback(
        (params: Edge | Connection) => {
            // 1. Edge Create Karo
            setEdges((eds) => addEdge(params, eds));
            
            // 2. Naya Edge List calculate karo
            const newEdges = addEdge(params, edges);

            // 3. TRIGGER SYNC - Only if both nodes are cloudNodes
            const sourceNode = nodes.find(n => n.id === params.source);
            const targetNode = nodes.find(n => n.id === params.target);
            
            if (sourceNode?.type === 'cloudNode' && targetNode?.type === 'cloudNode') {
                console.log("⚡ Connection made between cloud nodes - triggering sync...");
                triggerVisualSync(nodes, newEdges);
            }
        },
        [setEdges, nodes, edges, triggerVisualSync],
    );

    // --- DRAG & DROP LOGIC START ---
    
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            // Check karo ki React Flow load hua hai ya nahi
            if (!reactFlowInstance) return;

            // Sidebar se data nikalo
            const dataStr = event.dataTransfer.getData('application/reactflow');
            if (!dataStr) return;

            const { type, label } = JSON.parse(dataStr);

            // 1. Mouse position calculate karo
            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // 2. Naya Node banao
            const newNode: Node = {
                id: `${type}-${Date.now()}`, // Unique ID based on time
                type,
                position,
                data: { label: label, isDark, onDelete: onDeleteNode }, // EC2, S3, etc.
            };

            // 3. State update karo (Visual add ho jayega)
            setNodes((nds) => nds.concat(newNode));
            
            // 4. TRIGGER SYNC (Backend ko batane ke liye)
            // Hum 'nodes.concat(newNode)' bhej rahe hain taaki latest list jaye
            console.log("⚡ New cloud service added - triggering sync...");
            // Use setTimeout to ensure state is updated first
            setTimeout(() => {
                triggerVisualSync(nodes.concat(newNode), edges);
            }, 50); 
        },
        [reactFlowInstance, nodes, edges, setNodes, triggerVisualSync, onDeleteNode],

    );

    // --- DRAG & DROP LOGIC END ---

    // --- THE REAL LOGIC (Local Generation) ---
    const runFlow = async () => {
        // 1. Get Input
        const inputNode = nodes.find(n => n.id === '1');
        const promptText = inputNode?.data?.text;

        if (!promptText) {
            alert("Please enter a prompt first!");
            return;
        }

        setLoading(true);

        // UI Update: Show "Processing..." in Result Node
        setNodes((nds) => nds.map((n) =>
            n.id === '3' ? { ...n, data: { ...n.data, output: "Generating Architecture..." } } : n
        ));

        try {
            // Generate basic infrastructure based on prompt
            const mockNodes = generateMockNodesFromPrompt(promptText);
            const mockCode = generateBasicTerraform(mockNodes);
            const summary = `Generated architecture from prompt: "${promptText}"`;
            
            const finalOutput = `SUMMARY:\n${summary}\n\nTERRAFORM CODE:\n${mockCode}`;

            setNodes((nds) => nds.map((n) =>
                n.id === '3' ? { ...n, data: { ...n.data, output: finalOutput } } : n
            ));

            // Create visual nodes
            const newGeneratedNodes = mockNodes.map((node: any, index: number) => ({
                id: `generated-${Date.now()}-${index}`,
                type: 'cloudNode',
                data: { label: node.data.label, isDark, onDelete: onDeleteNode },
                position: { x: 250 + (index * 180), y: 450 + (index % 2 * 80) },
            }));

            // Update Graph
            setNodes((prev) => [...prev, ...newGeneratedNodes]);

            // Update main code editor
            if (onCodeUpdate) {
                onCodeUpdate(mockCode);
                console.log("✅ Generated code updated in main editor (local generation)");
            }

        } catch (error: any) {
            console.error("Error:", error);
            setNodes((nds) => nds.map((n) =>
                n.id === '3' ? { ...n, data: { ...n.data, output: `Error: ${error.message}` } } : n
            ));
        } finally {
            setLoading(false);
        }
    };



    // --- NEW: Handle Sync (Code -> Visual) ---
    const onSyncCode = async (newCode: string) => {
        console.log("Syncing visuals from code...");

        // 1. Current State (JSON) taiyar karo
        // Note: Asli project me humein 'currentState' ko state me store karna chahiye.
        // Abhi ke liye hum assume kar rahe hain ki backend sirf code se naya bana dega.
        // Lekin hamara backend schema "current_state" mangta hai.

        // Hack: Hum backend ko dummy state bhejenge + new Code,
        // Kyunki hamara Agent itna smart hai ki wo New Code se pura naya JSON bana dega.

        const inputNode = nodes.find(n => n.id === '1');
        const resultNode = nodes.find(n => n.id === '3');

        // Previous JSON construct kar rahe hain (Optional but good)
        const currentState = {
            summary: "Existing State",
            nodes: nodes.filter(n => n.type === 'cloudNode').map(n => ({
                id: n.id, label: n.data.label, type: n.type, provider: 'aws', serviceType: n.data.label
            })),
            edges: [],
            terraform_code: ""
        };

        try {
            const response = await fetch('https://manavmerja-nebula-backend-live.hf.space/api/v1/sync/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_state: currentState,
                    updated_code: newCode
                }),
            });

            const data = await response.json();
            if (data.detail) throw new Error(data.detail);

            // --- UPDATE VISUALS (Nodes & Edges) ---

            // 1. Naye Nodes Banao
            const syncedNodes = data.nodes.map((node: any, index: number) => ({
                id: node.id,
                type: 'cloudNode',
                data: { label: node.label },
                position: { x: 250 + (index * 180), y: 450 + (index % 2 * 80) },
            }));

            // 2. Naye Edges Banao
            const syncedEdges = data.edges.map((edge: any) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                animated: true,
                style: { stroke: '#94a3b8' },
                markerEnd: { type: MarkerType.ArrowClosed },
            }));

            // 3. Graph Update Karo (Purane Generated nodes hata kar naye lagao)
            // Note: Hum Input/AI/Result node (id 1,2,3) ko nahi hatayenge.
            const staticNodes = nodes.filter(n => ['1', '2', '3'].includes(n.id));
            setNodes([...staticNodes, ...syncedNodes]);
            setEdges([...initialEdges, ...syncedEdges]); // initialEdges me wiring hai 1->2->3

            // 4. Result Node ko update karo (Taaki summary update ho jaye)
            const finalOutput = `SUMMARY:\n${data.summary}\n\nTERRAFORM CODE:\n${data.terraform_code}`;

            setNodes((nds) => nds.map((n) =>
                n.id === '3' ? { ...n, data: { ...n.data, output: finalOutput } } : n
            ));

            alert("Diagram Updated Successfully! 🚀");

        } catch (error: any) {
            console.error("Sync Error:", error);
            alert(`Sync Failed: ${error.message}`);
        }
    };

    // Pass 'onSyncCode' function to ResultNode
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === '3') {
                    // Hum data me function inject kar rahe hain
                    node.data = { ...node.data, onSync: onSyncCode };
                }
                return node;
            })
        );
    }, [setNodes]); // Dependency array

   return (
        <div className={`w-full h-full relative ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={runFlow}
                    disabled={loading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 ${
                        loading 
                        ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20'
                    }`}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                    {loading ? 'Architecting...' : 'Run Architect'}
                </button>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeClick={onEdgeClick}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
                style={{ background: isDark ? '#030712' : '#ffffff' }}
            >
                <Controls style={{ filter: isDark ? 'invert(1)' : 'invert(0)' }} />
                <MiniMap 
                    nodeColor={isDark ? "#6865A5" : "#3b82f6"} 
                    style={{ backgroundColor: isDark ? '#141414' : '#f8fafc' }} 
                    maskColor={isDark ? "rgba(0,0,0, 0.7)" : "rgba(255,255,255, 0.7)"} 
                />
                <Background color={isDark ? "#555" : "#e2e8f0"} gap={20} size={1} />
            </ReactFlow>

            {/* Delete Confirmation Popup */}
            {showDeleteConfirm && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className={`p-6 rounded-lg shadow-xl ${
                        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}>
                        <h3 className={`text-lg font-semibold mb-4 ${
                            isDark ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                            Delete Connection?
                        </h3>
                        <p className={`mb-6 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            Are you sure you want to delete this connection?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    const deletedEdge = edges.find(e => e.id === showDeleteConfirm);
                                    setEdges((eds) => eds.filter((e) => e.id !== showDeleteConfirm));
                                    
                                    // Update code after edge deletion
                                    const updatedEdges = edges.filter((e) => e.id !== showDeleteConfirm);
                                    const cloudNodes = nodes.filter(n => n.type === 'cloudNode');
                                    
                                    if (cloudNodes.length > 0) {
                                        console.log("⚡ Edge deleted - triggering sync...");
                                        triggerVisualSync(nodes, updatedEdges);
                                    }
                                    
                                    setShowDeleteConfirm(null);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    isDark 
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function FlowEditor({ isDark, onCodeUpdate }: FlowEditorProps) {
    return (
        <ReactFlowProvider>
            <Flow isDark={isDark} onCodeUpdate={onCodeUpdate} />
        </ReactFlowProvider>
    )
}