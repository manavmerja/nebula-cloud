"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Server, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Project {
  _id: string;
  name: string;
  description: string;
  created_at: string;
  nodes: any[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Agar login nahi hai, toh home par bhej do
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // 2. Projects Fetch Karo
  useEffect(() => {
    if (session?.user?.email) {
      fetchProjects(session.user.email);
    }
  }, [session]);

  const fetchProjects = async (email: string) => {
    try {
      // Backend API call
      const res = await fetch(`http://127.0.0.1:8000/api/v1/projects/${email}`);
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            My Projects
            </h1>
            <p className="text-gray-400 mt-1">Manage your cloud architectures</p>
        </div>
        
        {/* New Project Button */}
        <Link 
            href="/"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
        >
            + New Project
        </Link>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {projects.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800">
                <p className="text-gray-500 text-lg">No projects found yet.</p>
                <Link href="/" className="text-cyan-400 hover:underline mt-2 inline-block">
                    Create your first architecture -{">"}
                </Link>
            </div>
        ) : (
            projects.map((project) => (
            <div 
                key={project._id} 
                className="bg-gray-900/50 border border-gray-800 hover:border-cyan-500/50 p-6 rounded-xl transition-all hover:shadow-lg hover:shadow-cyan-500/10 group"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-cyan-900/20 transition-colors">
                        <Server className="text-cyan-400 w-6 h-6" />
                    </div>
                    <span className="text-xs text-gray-500 font-mono border border-gray-700 px-2 py-1 rounded">
                        {project.nodes.length} Nodes
                    </span>
                </div>

                <h3 className="text-xl font-bold text-gray-200 mb-2">{project.name}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {project.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-800 pt-4">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.created_at).toLocaleDateString()}
                    </div>
                    
                    {/* Open Button (Abhi sirf Home par le jayega, baad mein Edit logic lagayenge) */}
                    <button className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold">
                        Open <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
            ))
        )}

      </div>
    </div>
  );
}