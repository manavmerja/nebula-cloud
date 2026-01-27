// Save and Load Project ne Sambhade che

import { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { useSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://manavmerja-nebula-backend-live.hf.space";

export function useProjectStorage(
    nodes: Node[], 
    edges: Edge[], 
    setNodes: (nds: Node[]) => void, 
    setEdges: (eds: Edge[]) => void
) {
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- SAVE PROJECT ---
    const saveProject = async () => {
        if (!session?.user?.email) {
            alert("Please login to save your project! 🔒");
            return;
        }

        const projectName = prompt("Enter project name:", "My Awesome Cloud");
        if (!projectName) return;

        setSaving(true);
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
                user_email: session.user.email,
                name: projectName,
                description: "Created via Nebula Cloud",
                nodes,
                edges,
                terraform_code: terraformCode
            };

            const response = await fetch(`${API_BASE}/api/v1/projects/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to save");
            alert("Project Saved Successfully! 💾");

        } catch (error: any) {
            console.error("Save Error:", error);
            alert(`Save Failed: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    // --- LOAD PROJECT ---
    const loadProject = async (projectId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/v1/project/${projectId}`);
            if (!response.ok) throw new Error("Project not found");

            const data = await response.json();
            if (data.nodes) setNodes(data.nodes);
            if (data.edges) setEdges(data.edges);

            console.log(`Project loaded: ${data.name}`);
        } catch (error) {
            console.error("Load Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return { saveProject, loadProject, saving, loading };
}