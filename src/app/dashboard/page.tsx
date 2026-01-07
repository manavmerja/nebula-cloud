'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Layout, Trash2 } from "lucide-react"; // 🗑️ Trash2 Icon Added

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null); // New State for delete loading

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://manavmerja-nebula-backend-live.hf.space";

  // --- FETCH PROJECTS ---
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    const fetchProjects = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await fetch(`${API_BASE}/api/v1/projects/${session.user.email}`);
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) {
      fetchProjects();
    }
  }, [session, status, router, API_BASE]);

  // --- DELETE LOGIC 🗑️ ---
  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Card click hone se roko (sirf delete hoga)
    
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) {
      return;
    }

    setDeletingId(projectId);

    try {
      const res = await fetch(`${API_BASE}/api/v1/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error("Failed to delete");

      // UI se project hatao bina page refresh kiye
      setProjects(prev => prev.filter(p => p._id !== projectId));
      
    } catch (error) {
      alert("Failed to delete project");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-black text-cyan-500">Loading Projects... ⏳</div>;
  if (error) return <div className="flex h-screen items-center justify-center bg-black text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10 flex justify-between items-center border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Manage your cloud architectures</p>
        </div>
        <button 
          onClick={() => router.push("/")}
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-full border border-gray-700 transition-all"
        >
          + New Project
        </button>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
            <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No projects found. Create your first architecture! 🚀</p>
          </div>
        ) : (
          projects.map((project) => (
            <div 
              key={project._id} 
              onClick={() => router.push(`/?id=${project._id}`)}
              className="group relative bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 hover:bg-gray-900 transition-all cursor-pointer overflow-hidden"
            >
              {/* Decoration Gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400 group-hover:text-white group-hover:bg-blue-500 transition-colors">
                  <Layout size={24} />
                </div>
                
                {/* 🗑️ DELETE BUTTON */}
                <button 
                  onClick={(e) => handleDelete(project._id, e)}
                  disabled={deletingId === project._id}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors z-10"
                  title="Delete Project"
                >
                  {deletingId === project._id ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>

              <h2 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                {project.name}
              </h2>
              <p className="text-sm text-gray-400 line-clamp-2 mb-6">
                {project.description}
              </p>

              <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-800 pt-4">
                <span>📦 {project.nodes?.length || 0} Resources</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-blue-400">
                  Open <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}