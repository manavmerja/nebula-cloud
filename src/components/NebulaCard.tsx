"use client";

import React from "react";
import Image from "next/image";

const NebulaCard = () => {
  return (
    <div className="relative group">
      
      {/* 1. THE LIGHTWEIGHT GLASS CONTAINER 
          (Removed heavy shadows and complex borders for max FPS)
      */}
      <div className="relative w-[350px] md:w-[480px] p-8 rounded-3xl overflow-hidden
        bg-white/5 backdrop-blur-xl 
        border border-white/10
        shadow-2xl" 
      >
        
        {/* Simple Shine on Hover (Performance friendly) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex flex-col items-center text-center z-10 relative">
          
          {/* --- LOGO SECTION (Clean & Simple) --- */}
          <div className="relative w-full h-28 mb-4 flex items-center justify-center">
            {/* No Back Glow - Just the pure logo */}
            <Image 
              src="/nebula-new.png" 
              alt="Nebula Cloud" 
              width={280} 
              height={100}
              className="object-contain" // Removed drop-shadow for zero lag
              priority // Fatafat load hoga
            />
          </div>

          {/* TEXT SECTION */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Deployment. <span className="text-cyan-400">Redefined.</span>
          </h2>
          
          <p className="text-gray-400 text-sm md:text-base mb-8 font-light max-w-[90%] mx-auto">
            Instant previews, zero-config pipelines, and AI-powered debugging.
          </p>

          {/* BUTTON SECTION */}
          <button className="px-8 py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform duration-200">
            Start the Journey →
          </button>

        </div>
      </div>
      
      {/* Very Subtle Outer Border Glow (Optional - Low Cost) */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500 -z-10" />

    </div>
  );
};

export default NebulaCard;