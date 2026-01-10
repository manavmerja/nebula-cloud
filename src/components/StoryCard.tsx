"use client";

import React from "react";
import { motion, Variants } from "framer-motion"; // 👈 Variants import kiya error fix ke liye
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface StoryCardProps {
  slide: {
    title: string;
    funFact: string;
    description: string;
    punchline: string;
    lottie: string;
    accent: string;
  };
}

const StoryCard: React.FC<StoryCardProps> = ({ slide }) => {
  // Animation variants with explicit type
  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: custom * 0.1 + 0.3, 
        duration: 0.5, 
        ease: "easeOut" 
      }
    })
  };

  return (
    <div className="w-full max-w-7xl h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-6">
      
      {/* --- LEFT: TEXT CONTENT (INSIDE GLASS BOX) --- */}
      {/* 👇 Sirf is div par Glass Effect lagaya hai */}
      <div className="flex-1 p-10 md:p-14 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl flex flex-col justify-center min-h-[400px]">
        
        {/* 1. TAG (Simple Bold Text) */}
        <motion.div 
          custom={0}
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="mb-4"
        >
          <p className={`text-sm font-extrabold tracking-widest uppercase ${slide.accent}`}>
            Did you know?
          </p>
        </motion.div>

        {/* 2. TITLE */}
        <motion.h2 
          custom={1}
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6"
        >
          {slide.title}
        </motion.h2>

        {/* 3. DESCRIPTION */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={textVariants}
        >
          <p className="text-lg md:text-xl text-gray-300 font-light mb-8 leading-relaxed">
            <span className="font-semibold text-white">{slide.funFact}</span> {slide.description}
          </p>
          
          {/* 4. PUNCHLINE (No Italics, No Dash) */}
          <p className={`text-2xl font-semibold ${slide.accent}`}>
            {slide.punchline}
          </p>
        </motion.div>
      </div>

      {/* --- RIGHT: ANIMATION (TRANSPARENT / NO BOX) --- */}
      <div className="flex-1 relative flex items-center justify-center h-[400px] md:h-[500px]">
         {/* Inner Glow (Piche ka light effect) */}
         <div className={`absolute inset-0 opacity-20 bg-gradient-to-tr from-transparent via-current to-transparent ${slide.accent} blur-[60px]`} />
         
         <div className="w-full h-full relative z-10 drop-shadow-2xl">
            <DotLottieReact
              src={slide.lottie}
              loop
              autoplay
            />
         </div>
      </div>

    </div>
  );
};

export default StoryCard;