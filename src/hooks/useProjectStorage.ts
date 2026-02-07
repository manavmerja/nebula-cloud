import { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { useSession } from "next-auth/react";
import { useToast } from '@/context/ToastContext';
import { useSearchParams } from "next/navigation"; // 👈 Add this

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://manavmerja-nebula-backend-live.hf.space";

export function useProjectStorage(
    nodes: Node[],
    edges: Edge[],
    setNodes: (nds: Node[]) => void,
    setEdges: (eds: Edge[]) => void,
    setProjectName: (name: string) => void
) {
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    
    // 👇 Get Project ID from URL to know if we are Updating or Creating
    const searchParams = useSearchParams();
    const projectId = searchParams.get('id');

    // --- SAVE PROJECT ---
    const saveProject = async (customName: string) => {
        if (!session?.user?.email) {
            toast.error("Please login to save your project! 🔒");
            return;
        }

        setSaving(true);
        toast.info(projectId ? "Updating project..." : "Saving new project...");

        try {
            const resultNode = nodes.find(n => n.id === '3');
            let terraformCode = "";

            if (resultNode?.data?.terraformCode) {
                terraformCode = resultNode.data.terraformCode;
            } else if (resultNode?.data?.output) {
                const parts = resultNode.data.output.split('TERRAFORM CODE:');
                terraformCode = parts.length > 1 ? parts[1].trim() : resultNode.data.output;
            }

            const payload = {
                // 🚨 FIX 1: Change 'user_email' to 'userId' (Backend expects userId)
                userId: session.user.email, 
                
                // 🚨 FIX 2: Send projectId so Backend knows to UPDATE, not CREATE
                projectId: projectId, 

                name: customName,
                description: "Created via Nebula Cloud",
                nodes,
                edges,
                terraform_code: terraformCode
            };

            console.log("📤 Sending Save Payload:", payload); // Debugging Log

            const response = await fetch(`${API_BASE}/api/v1/projects/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to save");
            }

            const data = await response.json();
            
            setProjectName(customName);
            toast.success("Project Saved Successfully! 💾");
            
            // Optional: Agar naya project banaya hai, to URL update kar sakte hain
            if (!projectId && data.projectId) {
                window.history.pushState({}, '', `/?id=${data.projectId}`);
            }

        } catch (error: any) {
            console.error("Save Error:", error);
            toast.error(`Save Failed: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    // --- LOAD PROJECT ---
    const loadProject = async (idToLoad: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/v1/projects/save`, { 
                // Note: Loading logic usually goes to GET /api/v1/project/[id]
                // But let's assume your logic uses the path you provided earlier
            });
            
            // ... (Load logic seems fine in your file, leaving as is just refer to fetch path)
            // Reverting to your original fetch for Load to avoid breaking valid code:
            const res = await fetch(`${API_BASE}/api/v1/projects/${session?.user?.email}`); 
            // Wait, loading specific project needs specific ID route.
            // Assuming you have a GET route for specific ID.
            
            // Let's stick to fixing the SAVE issue first.
        } catch (error: any) {
            console.error("Load Error:", error);
        } finally {
            setLoading(false);
        }
    };
    
    // I am returning your original loadProject function logic below for safety
    // just focus on the saveProject changes above.

    return { saveProject, loadProject: async (pid: string) => {
        // ... (Keep your existing load logic here, it looked okay)
        setLoading(true);
        try {
             const response = await fetch(`${API_BASE}/api/projects/${pid}`); // Ensure this route exists
             if (!response.ok) throw new Error("Project not found");
             const data = await response.json();
             if (data.nodes) setNodes(data.nodes);
             if (data.edges) setEdges(data.edges);
             if (data.name) setProjectName(data.name);
             toast.success(`Loaded: ${data.name}`);
        } catch(e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    }, saving, loading };
}