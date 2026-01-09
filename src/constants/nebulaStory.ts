// constants/nebulaStory.ts

import { Code2, Server, Globe, Cpu, Rocket } from "lucide-react"; // Icons for Slide 0

export const STORY_SLIDES = [
  {
    id: 0,
    title: "Deployment. Redefined.",
    subtitle: "Experience the future of student developer tools.",
    bgClass: "bg-black", // Slide 0: Pitch Black
    textClass: "text-white",
    themeColor: "#000000", 
    buttonText: "Start the Journey →",
  },
  {
    id: 1,
    title: "The Deployment Bottleneck.",
    subtitle: "Complex configurations, terminal errors, and endless documentation. Why should shipping code be harder than writing it?",
    bgClass: "bg-gradient-to-br from-gray-900 to-red-900", // Slide 1: Stress/Dark
    textClass: "text-red-100",
    themeColor: "#4a0404",
    floatingText: ["404 Error", "Build Failed", "Timeout"], // Background floating text
  },
  {
    id: 2,
    title: "Enter Cloud Nebula.",
    subtitle: "An intelligent developer platform built for students. Simple, visual, and powerful.",
    bgClass: "bg-[#0a0a2e]", // Slide 2: Deep Space Blue/Purple
    textClass: "text-cyan-100",
    themeColor: "#0a0a2e",
  },
  {
    id: 3,
    title: "Push. Build. Deploy.",
    subtitle: "Connect your repository and let Nebula handle the rest. We auto-detect your framework and build your app in seconds.",
    bgClass: "bg-gradient-to-r from-cyan-600 to-blue-600", // Slide 3: Electric/Action
    textClass: "text-white",
    themeColor: "#0891b2",
  },
  {
    id: 4,
    title: "You Are Live.",
    subtitle: "Your project is online with a secure, shareable link. Focus on coding, not operations.",
    bgClass: "bg-teal-700", // Slide 4: Success/Calm
    textClass: "text-white",
    themeColor: "#0f766e",
    isFinal: true,
  },
];

// Icons specifically for the Floating Hero Section (Slide 0)
export const HERO_ICONS = [
  { Icon: Code2, delay: 0, x: -100, y: -50 },
  { Icon: Server, delay: 2, x: 120, y: -80 },
  { Icon: Globe, delay: 4, x: -80, y: 100 },
  { Icon: Cpu, delay: 1, x: 150, y: 60 },
  { Icon: Rocket, delay: 3, x: 0, y: -120 },
];



