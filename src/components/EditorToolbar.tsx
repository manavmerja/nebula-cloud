"use client";

import React, { useState, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import {
    Plus, Minus, Maximize, LayoutGrid, Search, Camera
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { useToast } from '@/context/ToastContext';

interface EditorToolbarProps {
    onAutoLayout?: () => void;
    onOpenCommandPalette: () => void;
}

export default function EditorToolbar({ onAutoLayout, onOpenCommandPalette }: EditorToolbarProps) {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const [isFlashing, setIsFlashing] = useState(false);
    const toast = useToast();

    // --- DOWNLOAD SNAPSHOT LOGIC ---
    const handleDownload = useCallback(async () => {
        const flowElement = document.querySelector('.react-flow') as HTMLElement;
        if (!flowElement) return;

        // 1. Trigger Flash & Toast
        setIsFlashing(true);
        toast.info("Capturing Layout...");

        // 2. Wait 100ms for Flash to render before freezing UI
        setTimeout(async () => {
            try {
                const dataUrl = await toPng(flowElement, {
                    backgroundColor: '#000',
                    width: flowElement.offsetWidth,
                    height: flowElement.offsetHeight,
                    style: {
                        transform: 'scale(1)',
                    }
                });

                // 3. Trigger Download
                const a = document.createElement('a');
                a.setAttribute('download', 'nebula-architecture.png');
                a.setAttribute('href', dataUrl);
                a.click();

                toast.success("Snapshot Saved to Downloads! 🖼️");
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
            {/* 📸 CAMERA FLASH OVERLAY */}
            <div
                className={`fixed inset-0 z-[100] bg-white pointer-events-none transition-opacity duration-500 ease-out ${
                    isFlashing ? 'opacity-80' : 'opacity-0'
                }`}
            />

            {/* 🛠️ MAIN TOOLBAR */}
            <aside className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">

                {/* Group 1: View Controls */}
                <div className="bg-[#151921]/90 backdrop-blur-md border border-gray-800 rounded-full shadow-2xl px-2 py-1.5 flex items-center gap-1">
                    <ToolbarButton icon={Minus} label="Zoom Out" onClick={() => zoomOut({ duration: 300 })} />
                    <ToolbarButton icon={Plus} label="Zoom In" onClick={() => zoomIn({ duration: 300 })} />

                    <div className="h-4 w-px bg-gray-700/50 mx-1" />

                    <ToolbarButton icon={Maximize} label="Fit View" onClick={() => fitView({ duration: 500, padding: 0.2 })} />
                </div>

                {/* Group 2: Actions */}
                <div className="bg-[#151921]/90 backdrop-blur-md border border-gray-800 rounded-full shadow-2xl px-2 py-1.5 flex items-center gap-1">

                    {/* Search / Command Palette */}
                    <ToolbarButton
                        icon={Search}
                        label="Search Resources (Ctrl + K)"
                        onClick={onOpenCommandPalette}
                        active
                    />

                    <div className="h-4 w-px bg-gray-700/50 mx-1" />

                    {onAutoLayout && (
                        <ToolbarButton icon={LayoutGrid} label="Auto Layout" onClick={onAutoLayout} />
                    )}

                    <ToolbarButton icon={Camera} label="Export Image" onClick={handleDownload} />
                </div>

            </aside>
        </>
    );
}

// --- HELPER COMPONENT ---
interface ToolbarButtonProps {
    icon: any;
    label: string;
    onClick: () => void;
    active?: boolean;
}

const ToolbarButton = ({ icon: Icon, label, onClick, active }: ToolbarButtonProps) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-lg transition-all group relative flex items-center justify-center
            ${active
                ? "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }
        `}
        title={label}
    >
        <Icon size={18} />

        {/* Tooltip (Appears Above) */}
        <span className="absolute bottom-full mb-2 px-2 py-1 bg-black border border-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            {label}
        </span>
    </button>
);