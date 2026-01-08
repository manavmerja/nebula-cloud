"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { FaReact, FaPython, FaNodeJs, FaDocker, FaAws, FaLinux, FaGitAlt } from "react-icons/fa";
import { SiTypescript, SiMongodb, SiNextdotjs, SiTailwindcss } from "react-icons/si";
import { LuBinary, LuCode, LuCpu, LuTerminal, LuGlobe } from "react-icons/lu";
import { FiGithub } from "react-icons/fi";
import { VscCode } from "react-icons/vsc";

const FloatingLayer = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Mouse Move Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            setMousePosition({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const elements = [
        // --- 1. LOTTIE ANIMATIONS (Transparent URLs fixed) ---
    {
      id: "lottie-1",
      type: "lottie",
      // 👇 Maine '/embed/' hata diya hai taaki transparent rahe
      src: "https://lottie.host/83badb25-f21a-443a-8cc6-2aa1072f30b4/1fBlAE94FU.lottie", 
      size: "w-56 h-56", // Thoda size badhaya taaki rocket clear dikhe
      position: "top-[5%] right-[8%]",
      depth: 25,
    },
        // New Animation 1 (Bottom Left - Cloud/Tech)
        {
            id: "lottie-2",
            type: "lottie",
            src: "https://lottie.host/86f08e83-b124-4350-8b6a-8f8178f077eb/ns94KxvYsT.lottie", // FIXED URL
            size: "w-48 h-48",
            position: "bottom-[10%] left-[5%]",
            depth: 20,
        },
        // New Animation 2 (Top Left - AI/Brain)
        {
            id: "lottie-3",
            type: "lottie",
            src: "https://lottie.host/7f2a122a-4592-4b0e-a15e-aa0814e9799b/nFezS3Boe7.lottie", // FIXED URL
            size: "w-32 h-32",
            position: "top-[15%] left-[10%]",
            depth: 30,
        },

        // --- 2. TECH ICONS (Populated) ---
        { id: 1, component: <FaReact className="text-cyan-400" />, size: 35, position: "top-[25%] left-[20%]", depth: 15 },
        { id: 2, component: <FaPython className="text-yellow-400" />, size: 30, position: "bottom-[30%] right-[15%]", depth: 15 },
        { id: 3, component: <SiTypescript className="text-blue-500" />, size: 28, position: "bottom-[40%] left-[25%]", depth: 10 },
        { id: 4, component: <SiNextdotjs className="text-white" />, size: 32, position: "top-[15%] right-[30%]", depth: 12 },
        { id: 5, component: <VscCode className="text-blue-400" />, size: 28, position: "bottom-[20%] right-[35%]", depth: 18 },
        { id: 6, component: <FaAws className="text-orange-400" />, size: 30, position: "top-[40%] left-[5%]", depth: 14 },
        { id: 7, component: <FaDocker className="text-blue-600" />, size: 35, position: "top-[5%] right-[45%]", depth: 20 },
        { id: 8, component: <SiTailwindcss className="text-cyan-300" />, size: 25, position: "bottom-[50%] right-[5%]", depth: 10 },
        { id: 9, component: <FiGithub className="text-white" />, size: 30, position: "bottom-[15%] left-[45%]", depth: 15 },
        { id: 10, component: <FaLinux className="text-yellow-200" />, size: 26, position: "top-[60%] right-[10%]", depth: 12 },

        // --- 3. BACKGROUND PARTICLES (Subtle & Scattered) ---
        { id: 11, component: <LuBinary className="text-white/10" />, size: 18, position: "top-[30%] left-[40%]", depth: 5 },
        { id: 12, component: <LuCode className="text-white/10" />, size: 20, position: "top-[10%] right-[20%]", depth: 5 },
        { id: 13, component: <LuCpu className="text-white/10" />, size: 22, position: "bottom-[10%] left-[50%]", depth: 8 },
        { id: 14, component: <LuTerminal className="text-white/10" />, size: 20, position: "top-[50%] right-[40%]", depth: 6 },
        { id: 15, component: <LuGlobe className="text-white/10" />, size: 24, position: "bottom-[40%] left-[10%]", depth: 7 },
        { id: 16, component: <span className="text-white/10 font-mono">+</span>, size: 20, position: "top-[80%] left-[30%]", depth: 4 },
        { id: 17, component: <span className="text-white/10 font-mono">{"{ }"}</span>, size: 16, position: "top-[20%] left-[50%]", depth: 4 },
        { id: 18, component: <span className="text-white/10 font-mono">/</span>, size: 20, position: "bottom-[25%] right-[25%]", depth: 4 },
    ];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {elements.map((el) => (
                <motion.div
                    key={el.id}
                    className={`absolute ${el.position}`}
                    animate={{
                        x: mousePosition.x * el.depth * -1,
                        y: mousePosition.y * el.depth * -1,
                    }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                >
                    {el.type === "lottie" ? (
                        // Lottie Container (Ab transparent hai)
                        <div className={`${el.size} opacity-90 drop-shadow-[0_0_25px_rgba(100,100,255,0.3)]`}>
                            <DotLottieReact
                                src={el.src}
                                loop
                                autoplay
                            />
                        </div>
                    ) : (
                        // Icon Container
                        <div style={{ fontSize: el.size }} className="drop-shadow-lg opacity-80 hover:opacity-100 transition-opacity">
                            {el.component}
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
};

export default FloatingLayer;