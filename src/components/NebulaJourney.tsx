"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FloatingLayer from "@/components/FloatingLayer"; 
import NebulaCard from "@/components/NebulaCard";     

const NebulaJourney = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false); // 👈 New State: Track Hover

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Range: -1 to 1
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden perspective-1000"> 
      
      {/* LAYER 1: BACKGROUND */}
      <motion.div 
        className="absolute inset-0 z-10"
        animate={{
            // Background hamesha hilta rahega (Depth ke liye)
            x: mousePosition.x * -20, 
            y: mousePosition.y * -20
        }}
        transition={{ type: "spring", stiffness: 30, damping: 20 }}
      >
        <FloatingLayer />
      </motion.div>

      {/* LAYER 2: HERO CARD (Intelligent Movement) */}
      <motion.div 
        className="relative z-20"
        // 👇 DETECT HOVER: Jab mouse card ke upar aaye, state change karo
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        
        animate={{
          // 👇 LOGIC: Agar Hover kar rahe ho toh '0' (Center), nahi toh 'Float' karo
          x: isHovering ? 0 : mousePosition.x * 150,   
          y: isHovering ? 0 : mousePosition.y * 150,   
          rotateX: isHovering ? 0 : mousePosition.y * -5, 
          rotateY: isHovering ? 0 : mousePosition.x * 5,
        }}
        transition={{ 
            type: "spring", 
            stiffness: 60,  
            damping: 15     
        }}
      >
         <NebulaCard />
      </motion.div>

      {/* LAYER 3: ATMOSPHERE */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-900/10 pointer-events-none z-0" />

    </div>
  );
};

export default NebulaJourney;