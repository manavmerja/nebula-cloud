"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NebulaCard from "@/components/NebulaCard";
import FloatingLayer from "@/components/FloatingLayer"; // This brings back the icons!

interface HeroSectionProps {
  onStart: () => void; // Trigger to go to next slide
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStart }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      
      {/* 1. BACKGROUND ICONS (Floating Layer) - Only visible here */}
      <motion.div 
        className="absolute inset-0 z-0"
        animate={{ x: mousePosition.x * -20, y: mousePosition.y * -20 }}
      >
        <FloatingLayer />
      </motion.div>

      {/* 2. CENTER HERO CARD */}
      <motion.div
        className="relative z-20 cursor-pointer"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={onStart} // Clicking card starts the journey
        animate={{
          x: isHovering ? 0 : mousePosition.x * 120,
          y: isHovering ? 0 : mousePosition.y * 120,
          rotateX: isHovering ? 0 : mousePosition.y * -10,
          rotateY: isHovering ? 0 : mousePosition.x * 10,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
      >
        {/* We wrap the Start Button click inside NebulaCard via parent div click for now, 
            or you can pass onStart prop to NebulaCard if you prefer specific button click */}
        <div className="pointer-events-none"> 
            {/* Pointer events none on card lets the click pass through to the motion div container */}
            <NebulaCard />
        </div>
      </motion.div>

    </div>
  );
};

export default HeroSection;