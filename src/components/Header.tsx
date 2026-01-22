"use client";

import React from 'react';
import { Play, Save, LayoutDashboard, ChevronRight } from 'lucide-react';
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import Image from "next/image";
import { Button } from "@/components/ui/Button"; // <--- Import your new component

interface HeaderProps {
    session: any;
    onSave: () => void;
    onRun: () => void;
    saving: boolean;
    loading: boolean;
}

export default function Header({ session, onSave, onRun, saving, loading }: HeaderProps) {
    return (
        <header className="h-16 w-full flex items-center justify-between px-5 border-b border-gray-800/60 bg-[#0F1117]/90 backdrop-blur-xl z-40 sticky top-0">

            {/* LEFT: Branding */}
            <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer">
                    <div className="absolute -inset-1 bg-cyan-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Image src="/nebula-new.png" alt="Nebula Cloud" width={32} height={32} className="relative rounded-lg shadow-lg shadow-cyan-900/20" style={{ objectFit: 'cover' }} />
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                        <span>Nebula Cloud</span>
                        <ChevronRight size={14} className="text-gray-600" />
                        <span className="text-gray-500">New Project</span>
                    </div>
                </div>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-3">

                {/* 1. SAVE (Secondary) */}
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onSave}
                    isLoading={saving}
                    icon={<Save size={14} />}
                >
                    <span className="hidden sm:inline">Save</span>
                </Button>

                {/* 2. RUN (Primary - The "Hero" Button) */}
                <Button
                    variant="primary"
                    size="sm"
                    onClick={onRun}
                    isLoading={loading}
                    icon={<Play size={14} className="fill-current" />}
                >
                    Run Architect
                </Button>

                <div className="h-6 w-px bg-gray-800 mx-1" />

                {/* 3. DASHBOARD (Ghost) */}
                {session && (
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" icon={<LayoutDashboard size={16} />}>
                            <span className="hidden lg:inline">Dashboard</span>
                        </Button>
                    </Link>
                )}

                <AuthButton />
            </div>
        </header>
    );
}