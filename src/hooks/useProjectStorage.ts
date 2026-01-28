// Save and Load Project ne Sambhade che

import { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { useSession } from "next-auth/react";
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation'; // 👈 Import Router

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
    const router = useRouter(); // 👈 Initialize Router

    // --- SAVE PROJECT ---
    const saveProject = async (customName: string) => {
        if (!session?.user?.email) {
            toast.error("Please login to save your project! 🔒");
            return;
        }

        setSaving(true);
        toast.info("Saving project...");

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
                name: customName,
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

            setProjectName(customName);
            toast.success("Project Saved Successfully! 💾");

            // 🚀 REDIRECT TO INTRO ON SAVE
            setTimeout(() => {
                router.push('/intro');
            }, 1000); // 1s delay so user sees the success toast first

        } catch (error: any) {
            console.error("Save Error:", error);
            toast.error(`Save Failed: ${error.message}`);
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
            if (data.name) setProjectName(data.name);

            console.log(`Project loaded: ${data.name}`);
            toast.success(`Project Loaded: ${data.name} 📂`);

            // 🚀 REDIRECT TO INTRO ON LOAD (Optional)
            // Note: Usually you want to STAY in the editor after loading.
            // If you really want to show the intro animation again:
            // router.push('/intro');

        } catch (error: any) {
            console.error("Load Error:", error);
            toast.error(`Load Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return { saveProject, loadProject, saving, loading };
}