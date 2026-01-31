"use client";

import React, { useState } from 'react';
import { Save, LayoutDashboard, ChevronRight } from 'lucide-react';
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import RunArchitectButton from "@/components/RunArchitectButton";

interface HeaderProps {
    session: any;
    onSave: () => void;
    onRun: () => void;
    saving: boolean;
    loading: boolean;
    // 🟢 NEW: Receive state from Parent (FlowEditor)
    title: string;
    setTitle: (newTitle: string) => void;
}

export default function Header({
    session,
    onSave,
    onRun,
    saving,
    loading,
    title,     // 👈 Destructure
    setTitle   // 👈 Destructure
}: HeaderProps) {
    // We only keep "isEditing" local because it's just UI state.
    // The actual data (title) now lives in FlowEditor.
    const [isEditing, setIsEditing] = useState(false);

    return (
        <header className="h-16 w-full flex items-center justify-between px-6 border-b border-gray-800 bg-[#0F1117] sticky top-0 z-40">

            {/* --- LEFT: Context & Breadcrumbs --- */}
            <div className="flex items-center gap-4">
                {/* Logo or Brand */}
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                    <span className="hover:text-gray-300 cursor-pointer transition-colors">Nebula Cloud</span>
                    <ChevronRight size={14} className="text-gray-700" />

                    {/* EDITABLE TITLE LOGIC */}
                    {isEditing ? (
                        <input
                            autoFocus
                            value={title} // 🟢 Uses Prop
                            onChange={(e) => setTitle(e.target.value)} // 🟢 Updates Parent
                            onBlur={() => setIsEditing(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                            className="bg-[#151921] text-gray-200 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-2 py-0.5 -ml-2 w-48 transition-all"
                        />
                    ) : (
                        <span
                            onClick={() => setIsEditing(true)}
                            className="text-gray-200 font-medium flex items-center gap-2 cursor-text hover:bg-gray-800/50 rounded px-2 py-0.5 -ml-2 transition-colors border border-transparent hover:border-gray-700/50"
                            title="Click to rename"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                            {title} {/* 🟢 Uses Prop */}
                        </span>
                    )}
                </div>
            </div>

            {/* --- RIGHT: Professional Action Bar --- */}
            <div className="flex items-center gap-3">

                {/* 1. Save Button */}
                <div className="flex items-center bg-[#0A0C10] p-1 rounded-lg border border-gray-800/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSave}
                        isLoading={saving}
                        icon={<Save size={14} />}
                        className="text-gray-400 hover:text-white"
                    >
                        Save
                    </Button>
                </div>

                {/* 2. Run Architect Button */}
                <div id="nebula-header-run">
                <RunArchitectButton onRun={onRun} loading={loading} />
                </div>

                <div className="h-6 w-px bg-gray-800 mx-2" />

                {/* 3. Dashboard Link */}
                {session && (
                    <Link href="/dashboard">
                        <Button variant="surface" size="sm" icon={<LayoutDashboard size={15} />}>
                            Dashboard
                        </Button>
                    </Link>
                )}

                {/* 4. Auth */}
                <AuthButton />
            </div>
        </header>
    );
}