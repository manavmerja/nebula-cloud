import React from 'react';
import { Play, Loader2, Save, LayoutGrid } from 'lucide-react';
import Link from "next/link";
import AuthButton from "@/components/AuthButton";

interface HeaderProps {
    session: any;       // Login session data
    onSave: () => void; // Save function
    onRun: () => void;  // Run function
    saving: boolean;    // Save loading state
    loading: boolean;   // Run loading state
}

export default function Header({ session, onSave, onRun, saving, loading }: HeaderProps) {
    return (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
            
            {/* 1. Login/Logout Button */}
            <AuthButton />

            {/* 2. DASHBOARD BUTTON (Show only if logged in) */}
            {session && (
                <Link 
                    href="/dashboard"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-600 transition-all"
                    title="My Projects"
                >
                    <LayoutGrid size={18} />
                </Link>
            )}

            {/* 3. SAVE BUTTON */}
            <button
                onClick={onSave}
                disabled={saving}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-all border border-gray-600 ${
                    saving 
                    ? 'bg-gray-800 text-gray-400 cursor-wait' 
                    : 'bg-gray-800 hover:bg-gray-700 text-green-400 hover:text-green-300'
                }`}
                title="Save Project"
            >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span className="hidden sm:inline">Save</span>
            </button>

            {/* 4. RUN ARCHITECT BUTTON (Jo Gayab ho gaya tha!) */}
            <button
                onClick={onRun}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 ${
                    loading 
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20'
                }`}
            >
                {loading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                {loading ? 'Architecting...' : 'Run Architect'}
            </button>
        </div>
    );
}