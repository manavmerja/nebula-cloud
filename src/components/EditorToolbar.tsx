"use client";

import React, { useState, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import {
    Plus, Minus, Maximize, LayoutGrid, Search, Camera, Undo, Redo,
    MousePointer2, Hand // Optional: If you want to add mode switching later
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { useToast } from '@/context/ToastContext';

interface EditorToolbarProps {
    onAutoLayout?: () => void;
    onOpenCommandPalette: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onOpenTemplates?: () => void; // If you added this
    canUndo?: boolean;
    canRedo?: boolean;
}

export default function EditorToolbar({
    onAutoLayout,
    onOpenCommandPalette,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false
}: EditorToolbarProps) {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const [isFlashing, setIsFlashing] = useState(false);
    const toast = useToast();

    // --- DOWNLOAD LOGIC ---
    const handleDownload = useCallback(async () => {
        const flowElement = document.querySelector('.react-flow') as HTMLElement;
        if (!flowElement) return;

        setIsFlashing(true);
        toast.info("Capturing Layout...");

        setTimeout(async () => {
            try {
                const dataUrl = await toPng(flowElement, {
                    backgroundColor: '#000',
                    width: flowElement.offsetWidth,
                    height: flowElement.offsetHeight,
                    style: { transform: 'scale(1)' }
                });

                const a = document.createElement('a');
                a.setAttribute('download', `nebula-arch-${Date.now()}.png`);
                a.setAttribute('href', dataUrl);
                a.click();
                toast.success("Snapshot Saved! 📸");
            } catch (err) {
                console.error(err);
                toast.error("Failed to capture screenshot.");
            } finally {
                setIsFlashing(false);
            }
        }, 100);
    }, [toast]);

    return (
        <>
            {/* Flash Effect Overlay */}
            <div
                className={`fixed inset-0 z-[100] bg-white pointer-events-none transition-opacity duration-500 ease-out ${
                    isFlashing ? 'opacity-80' : 'opacity-0'
                }`}
            />

            {/* 🚀 UNIFIED DOCK CONTAINER */}
            <aside
            id="nebula-toolbar"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">

                <div className="bg-[#151921]/95 backdrop-blur-xl border border-gray-800/80 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-1.5 flex items-center gap-1 ring-1 ring-white/5">

                    {/* SECTION 1: HISTORY (Safety) */}
                    <div className="flex items-center gap-0.5">
                        <ToolbarButton
                            icon={Undo}
                            label="Undo"
                            shortcut="Ctrl+Z"
                            onClick={onUndo || (() => {})}
                            disabled={!canUndo}
                        />
                        <ToolbarButton
                            icon={Redo}
                            label="Redo"
                            shortcut="Ctrl+Y"
                            onClick={onRedo || (() => {})}
                            disabled={!canRedo}
                        />
                    </div>

                    {/* DIVIDER */}
                    <div className="w-px h-5 bg-gray-700/50 mx-1.5" />

                    {/* SECTION 2: ACTIONS (The "Doing" Tools) */}
                    <div className="flex items-center gap-0.5 border border-cyan-500 border-opacity-30 rounded-lg p-1">                        <ToolbarButton
                            icon={Search}
                            label="Search"
                            shortcut="Ctrl+K"
                            onClick={onOpenCommandPalette}
                            // active // Optional: Highlight if active
                        />
                        {onAutoLayout && (
                            <ToolbarButton
                                icon={LayoutGrid}
                                label="Auto Layout"
                                onClick={onAutoLayout}
                            />
                        )}
                        <ToolbarButton
                            icon={Camera}
                            label="Export PNG"
                            onClick={handleDownload}
                        />
                    </div>

                    {/* DIVIDER */}
                    <div className="w-px h-5 bg-gray-700/50 mx-1.5" />

                    {/* SECTION 3: VIEW (Navigation) */}
                    <div className="flex items-center gap-0.5">
                        <ToolbarButton
                            icon={Minus}
                            label="Zoom Out"
                            onClick={() => zoomOut({ duration: 300 })}
                        />
                         {/* Optional: Display Zoom Level here if you want */}
                        <ToolbarButton
                            icon={Plus}
                            label="Zoom In"
                            onClick={() => zoomIn({ duration: 300 })}
                        />
                        <ToolbarButton
                            icon={Maximize}
                            label="Fit View"
                            onClick={() => fitView({ duration: 500, padding: 0.2 })}
                        />
                    </div>

                </div>

            </aside>
        </>
    );
}

// Helper Component for consistent buttons
interface ToolbarButtonProps {
    icon: any;
    label: string;
    shortcut?: string;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
}

const ToolbarButton = ({ icon: Icon, label, shortcut, onClick, active, disabled }: ToolbarButtonProps) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`relative group p-2 rounded-xl transition-all duration-200 flex items-center justify-center
            ${disabled
                ? "text-gray-700 cursor-not-allowed opacity-50"
                : active
                    ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)] ring-1 ring-cyan-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105"
            }
        `}
    >
        <Icon size={18} strokeWidth={2} />

        {/* Tooltip (Appears on Hover) */}
        {!disabled && (
            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-[#0d1117] border border-gray-700 text-gray-200 text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50 flex gap-2 items-center scale-95 group-hover:scale-100 origin-bottom">
                <span>{label}</span>
                {shortcut && (
                    <span className="bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded text-[9px] font-mono border border-gray-700">
                        {shortcut}
                    </span>
                )}
                {/* Little arrow pointing down */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0d1117] border-b border-r border-gray-700 rotate-45" />
            </div>
        )}
    </button>
);