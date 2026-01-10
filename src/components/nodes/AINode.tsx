'use client';

import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Server } from 'lucide-react';
import Lottie from 'lottie-react';

function AINode({ data }: { data: { model?: string } }) {
    const [animationData, setAnimationData] = useState<any>(null);

    // Load Lottie JSON from public/
    useEffect(() => {
        fetch('/lottie/ai-animation.json')
            .then(res => res.json())
            .then(setAnimationData)
            .catch(console.error);
    }, []);

    return (
        <div
            className="
                px-4 py-3
                min-w-[280px]
                rounded-xl
                bg-gray-900/90
                border-2 border-cyan-500
                shadow-[0_0_30px_rgba(34,211,238,0.25)]
                backdrop-blur-md
            "
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 !bg-cyan-400 !border-2 !border-white"
            />

            {/* Header */}
            <div className="flex items-center mb-3 border-b border-gray-700 pb-2">
                <Server className="w-4 h-4 text-cyan-400 mr-2" />
                <span className="text-gray-100 font-bold text-sm uppercase tracking-widest">
                    AI Engine
                </span>
            </div>

            {/* 🔮 AI Core – Radial Glow */}
<div className="flex flex-col items-center my-4 nodrag">
    <div className="relative flex items-center justify-center">

        {/* Outer Glow */}
        <div
            className="
                absolute
                w-36 h-36
                rounded-full
                bg-cyan-400/30
                blur-2xl
                animate-pulse
            "
        />

        {/* Inner Glow */}
        <div
            className="
                absolute
                w-18 h-18
                rounded-full
                bg-cyan-300/40
                blur-xl
            "
        />

        {/* Core */}
        <div
            className="
                relative
                w-24 h-24
                rounded-full
                bg-white
                shadow-[inset_0_0_20px_rgba(0,0,0,0.15)]
                flex items-center justify-center
            "
        >
            {animationData && (
                <Lottie
                    animationData={animationData}
                    loop
                    className="w-20 h-20"
                />
            )}
        </div>
    </div>

    {/* ✨ Nebula Text */}
    <div className="mt-3 text-center pointer-events-none select-none">
        <p
            className="
                text-sm
                font-orbitron
                tracking-[0.35em]
                uppercase
                text-cyan-300
                drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]
                font-family: 'Orbitron', sans-serif;
            "
        >
            Nebula
        </p>
    </div>
</div>


            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 !bg-cyan-400 !border-2 !border-white"
            />
        </div>
    );
}

export default memo(AINode);
