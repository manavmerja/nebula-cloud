"use client";

import React from 'react';
import { Play, Loader2, Save, LayoutDashboard } from 'lucide-react'; // ✅ Added LayoutDashboard import
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import Image from "next/image";

interface HeaderProps {
    session: any;       // Login session data
    onSave: () => void; // Save function
    onRun: () => void;  // Run function
    saving: boolean;    // Save loading state
    loading: boolean;   // Run loading state
}

export default function Header({
    session,
    onSave,
    onRun,
    saving,
    loading
}: HeaderProps) {
    return (
        <header className="w-full flex items-center justify-between px-6 py-4 bg-gray-900/90 border-b border-gray-800 backdrop-blur-md">

            {/* LEFT — LOGO + NAME */}
            <div className="flex items-center gap-3">
                <Image
                    src="/nebula-new.png"
                    alt="Nebula Cloud"
                    width={56}
                    height={56}
                    className="rounded-full"
                    style={{ width: 'auto', height: 'auto' }}
                />
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-white tracking-wide">
                        Nebula Cloud
                    </span>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">Infrastructure Engine</div>
                </div>
            </div>

            {/* RIGHT — RUN + SAVE + DASHBOARD + AUTH */}
            <div className="flex items-center gap-3">

                {/* 1. RUN BUTTON */}
                <button
                    onClick={onRun}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
                        loading
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/20'
                    }`}
                    title="Run Architect"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                    <span className="hidden sm:inline">Run</span>
                </button>

                {/* 2. SAVE BUTTON */}
                <button
                    onClick={onSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold border transition-all ${
                        saving
                            ? 'bg-gray-800 text-gray-400 cursor-wait'
                            : 'bg-gray-800 hover:bg-gray-700 text-green-400 hover:text-green-300 border-gray-600'
                    }`}
                    title="Save Project"
                >
                    {saving
                        ? <Loader2 size={16} className="animate-spin" />
                        : <Save size={16} />
                    }
                    <span className="hidden sm:inline">Save</span>
                </button>

                {/* 3.  DASHBOARD BUTTON (Only shows if logged in) */}
                {session && (
                    <Link href="/dashboard">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold border border-gray-600 bg-gray-800 hover:bg-gray-700 text-purple-400 hover:text-purple-300 transition-all">
                            <LayoutDashboard size={16} />
                            <span className="hidden sm:inline">Dashboard</span>
                        </button>
                    </Link>
                )}

                {/* 4. GITHUB + GOOGLE AUTH */}
                <AuthButton />
            </div>

        </header>
    );
}