"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { FaArrowRight, FaArrowLeft, FaRocket } from "react-icons/fa6";

import HeroSection from "@/components/HeroSection";
import StoryCard from "@/components/StoryCard";

// Slide Data Types
interface SlideBase {
  id: number;
  type: string;
  bgColor: string;
}

interface HeroSlide extends SlideBase {
  type: "HERO";
}

interface StorySlide extends SlideBase {
  type: "STORY";
  lottie: string;
  title: string;
  funFact: string;
  description: string;
  punchline: string;
  accent: string;
}

type Slide = HeroSlide | StorySlide;

const SLIDES: Slide[] = [
  { id: 0, type: "HERO", bgColor: "#000000" },
  {
    id: 1,
    type: "STORY",
    bgColor: "#1a0505",
    lottie: "https://lottie.host/50dec128-d902-4255-bdda-2251f37109a1/f96LFVkQ1J.lottie",
    title: "Lost in the AWS Maze?",
    funFact: "AWS has 200+ services.",
    description: "Choosing the right VPC, EC2, and RDS is overwhelming. One wrong click, and your app is down.",
    punchline: "We handle the configuration for you.",
    accent: "text-red-400",
  },
  {
    id: 2,
    type: "STORY",
    bgColor: "#0f051a",
    lottie: "https://lottie.host/2096bd16-1ef9-4b20-b520-2edf4710a709/07BkL3KyHI.lottie",
    title: "We Generate Your Infrastructure",
    funFact: "Writing Terraform manually takes hours.",
    description: "Nebula generates Production-Ready Infrastructure as Code instantly. No manual config needed.",
    punchline: "Infrastructure as Code, automated.",
    accent: "text-purple-400",
  },
  {
    id: 3,
    type: "STORY",
    bgColor: "#05101a",
    lottie: "https://lottie.host/eea4f60f-f08a-4060-8f02-8c1341d526e0/9mmfZznZFC.lottie",
    title: "Visualize Before You Deploy",
    funFact: "Text-based configs are impossible to visualize.",
    description: "We turn your infrastructure into a live node graph. See exactly how your server connects to your database.",
    punchline: "Visual clarity for complex systems.",
    accent: "text-cyan-400",
  },
  {
    id: 4,
    type: "STORY",
    bgColor: "#051a0a",
    lottie: "https://lottie.host/dd1bb864-6c37-4dee-b115-bc4c625e28a5/T2J4JWPPPj.lottie",
    title: "One Command. That's It.",
    funFact: "Manual deployment takes hours.",
    description: "Just type 'nebula deploy' and watch your site go live globally in seconds.",
    punchline: "From localhost to global. Instantly.",
    accent: "text-green-400",
  },
];

//  Define Prop Type: Parent se signal lega ki kya karna hai
interface NebulaJourneyProps {
  onComplete?: () => void;
}

const variants: Variants = {
  enter: (direction: number) => ({
    scale: direction > 0 ? 0.85 : 1.15,
    opacity: 0.4,
    filter: "blur(8px)",
    zIndex: 0,
  }),
  center: {
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    zIndex: 1,
    transition: {
      duration: 1.2,
      ease: [0.25, 1, 0.5, 1] as [number, number, number, number]
    }
  },
  exit: (direction: number) => ({
    scale: direction > 0 ? 1.15 : 0.85,
    opacity: 0,
    filter: "blur(12px)",
    zIndex: 0,
    transition: {
      duration: 1.2,
      ease: [0.25, 1, 0.5, 1] as [number, number, number, number]
    }
  }),
};

//  Props receive kar rahe hain
const NebulaJourney: React.FC<NebulaJourneyProps> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const nextSlide = () => {
    if (index === SLIDES.length - 1) {
      handleExit();
      return;
    }

    if (index < SLIDES.length - 1) {
      setDirection(1);
      setIndex(index + 1);
    }
  };

  const prevSlide = () => {
    if (index > 0) {
      setDirection(-1);
      setIndex(index - 1);
    }
  };

  const handleExit = () => {
    setIsExiting(true);
    // Router.push hata diya. Ab ye Parent ka function call karega.
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1200);
  };

  const activeSlide = SLIDES[index];
  const progressPercentage = Math.round(((index) / (SLIDES.length - 1)) * 100);
  const isLastSlide = index === SLIDES.length - 1;

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center transition-colors duration-1000 ease-in-out"
      style={{ backgroundColor: activeSlide.bgColor }}
    >
      {/*WARP OVERLAY */}
      <AnimatePresence>
        {isExiting && (
          <motion.div
            className="absolute inset-0 z-[100] flex items-center justify-center bg-black pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-[200vw] h-[200vw] rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 blur-3xl opacity-50"
              initial={{ scale: 0 }}
              animate={{ scale: 20 }}
              transition={{ duration: 1.5, ease: "easeIn" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative w-full h-full flex items-center justify-center transition-all duration-700 ${isExiting ? 'scale-[5] opacity-0 filter blur-xl' : ''}`}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute w-full h-full flex items-center justify-center"
          >
            {activeSlide.type === "HERO" ? (
              <HeroSection onStart={nextSlide} />
            ) : (
              <StoryCard slide={activeSlide as any} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {index > 0 && !isExiting && (
        <div className="absolute bottom-12 z-50 w-full px-6 md:px-16 flex items-center justify-between pointer-events-none">
          <div className="w-20 hidden md:block"></div>

          <div className="flex items-center gap-4 pointer-events-auto">
            <button
              onClick={prevSlide}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-lg`}
            >
              <FaArrowLeft size={18} />
            </button>

            <button
              onClick={nextSlide}
              className={`h-12 px-8 flex items-center gap-3 rounded-2xl bg-white text-black font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg`}
            >
              <span>{isLastSlide ? "Enter Nebula" : "Next"}</span>
              {isLastSlide ? <FaRocket size={18} /> : <FaArrowRight size={18} />}
            </button>
          </div>

          <div className="text-white/80 font-medium text-lg tracking-wide w-32 text-right pointer-events-auto">
            Progress <span className="font-bold text-white">{progressPercentage}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NebulaJourney;

