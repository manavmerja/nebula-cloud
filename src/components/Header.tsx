"use client";

import React, { useState } from 'react';
import { Save, LayoutDashboard, ChevronRight, Loader2, Check, AlertCircle } from 'lucide-react';
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import { Button } from "@/components/ui/Button";
import RunArchitectButton from "@/components/RunArchitectButton";

interface HeaderProps {
    session: any;
    onSave: () => void;
    onRun: () => void;
    saving: boolean;
    loading: boolean;
    title: string;
    setTitle: (newTitle: string) => void;
    // 🟢 NEW: Props for Auto-Save Indicator
    saveStatus?: 'saved' | 'saving' | 'error';
    lastSavedTime?: Date;
}

export default function Header({
    session,
    onSave,
    onRun,
    saving,
    loading,
    title,
    setTitle,
    saveStatus = 'saved', // Default to 'saved' if not provided yet
    lastSavedTime = new Date()
}: HeaderProps) {
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
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
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
                            {title}
                        </span>
                    )}
                </div>

                {/* 🚀 AUTO-SAVE INDICATOR */}
                {/* This sits right next to the title for reassurance */}
                <div className="hidden lg:flex items-center gap-2 text-[10px] font-medium px-3 border-l border-gray-800 ml-2 h-6 transition-all duration-300">

                    {saveStatus === 'saving' && (
                        <div className="flex items-center gap-1.5 text-yellow-500 animate-pulse">
                            <Loader2 size={10} className="animate-spin" />
                            <span>Saving...</span>
                        </div>
                    )}

                    {saveStatus === 'saved' && (
                        <div className="flex items-center gap-1.5 text-gray-500 group relative cursor-help">
                            <Check size={10} className="text-emerald-500" />
                            <span>Saved</span>

                            {/* Hover Tooltip: Shows exact time */}
                            <div className="absolute top-full mt-2 left-0 bg-[#151921] border border-gray-700 px-2 py-1 rounded text-gray-300 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                                Last synced {lastSavedTime.toLocaleTimeString()}
                            </div>
                        </div>
                    )}

                    {saveStatus === 'error' && (
                        <div className="flex items-center gap-1.5 text-red-400">
                            <AlertCircle size={10} />
                            <span>Sync Error</span>
                            <button onClick={onSave} className="underline hover:text-red-300 ml-1">Retry</button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- RIGHT: Professional Action Bar --- */}
            <div className="flex items-center gap-3">

                {/* 1. Manual Save Button (Still useful for forcing a save) */}
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