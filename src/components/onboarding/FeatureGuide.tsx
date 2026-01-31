import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, X, MapPin } from 'lucide-react';

  const TOUR_STEPS = [
    // 0. SIDEBAR
    {
    targetId: 'nebula-sidebar',
    title: 'Resource Library',
    text: 'Your toolbox. Drag and drop Cloud Nodes (EC2, S3) or AI Agents directly onto the canvas.',
    position: 'right'
  },
  // 1. TOOLBAR
  {
    targetId: 'nebula-toolbar',
    title: 'Command Deck',
    text: 'Start here. Use "Auto Layout" to organize messy nodes, take screenshots, or use the "Search" (Ctrl+K) to find specific resources.',
    position: 'top'
  },
  // 2. INPUT NODE (The Prompt)
  {
    targetId: 'nebula-input-node',
    title: 'AI Architect Input',
    text: 'Describe what you want to build here (e.g., "I want to deploy a scalable e-commerce app"). The AI will generate the visual architecture for you.',
    position: 'right'
  },
  // 3. RUN BUTTON (Header)
  {
    targetId: 'nebula-header-run',
    title: 'Run Architect',
    text: 'Click this to trigger the NEBULA AI Engine. It will analyze your prompt and generate the necessary infrastructure nodes on the canvas.',
    position: 'bottom'
  },
  // 4. RESULT NODE (The Output)
  {
    targetId: 'nebula-result-node',
    title: 'Intelligence Console',
    text: 'This is your mission control. View the generated Terraform code, sync visuals, and check for "Security Issues" or "Fix" recommendations here.',
    position: 'left'
  },
  // 5. MINIMAP
  {
    targetId: 'nebula-minimap',
    title: 'Nav System',
    text: 'Lost in a large diagram? Use the minimap to quickly navigate around your infrastructure.',
    position: 'top' // Appear above the map
  }
];

export default function FeatureGuide() {
  const [status, setStatus] = useState<'idle' | 'ask' | 'tour' | 'complete'>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenGuide');
    if (!seen) {
      const timer = setTimeout(() => setStatus('ask'), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // 1. ESCAPE KEY LISTENER (Safety Hatch) 🛡️
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && (status === 'tour' || status === 'ask')) {
            skipTour();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  const updateSpotlight = useCallback(() => {
    if (status !== 'tour') return;

    const step = TOUR_STEPS[stepIndex];
    const element = document.getElementById(step.targetId);

    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 8;
      setSpotlight({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + (padding * 2),
        height: rect.height + (padding * 2)
      });
    } else {
        // 🚨 SAFETY: If element not found, log warning and skip to next or finish
        console.warn(`FeatureGuide: Target ID "${step.targetId}" not found.`);
        // Optional: Auto-skip if target missing to prevent getting stuck
        // if (stepIndex < TOUR_STEPS.length - 1) setStepIndex(prev => prev + 1);
        // else skipTour();
    }
  }, [stepIndex, status]);

  useEffect(() => {
    // Small delay to ensure DOM is ready during transitions
    requestAnimationFrame(updateSpotlight);
    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight);
    return () => {
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight);
    };
  }, [updateSpotlight]);

  const startTour = () => setStatus('tour');
  const skipTour = () => {
    setStatus('complete');
    localStorage.setItem('hasSeenGuide', 'true');
  };

  const handleNext = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      skipTour();
    }
  };

  // 2. DYNAMIC POSITIONING STYLES 📐
  // Using 'transform' guarantees we never overlap the highlight box
  const getTooltipStyles = () => {
      if (!spotlight) return {};
      const step = TOUR_STEPS[stepIndex];
      const gap = 16; // Distance from highlight box

      // Base: Center horizontally/vertically relative to spotlight
      let styles: React.CSSProperties = { position: 'absolute' };

      switch (step.position) {
          case 'top':
              styles.top = spotlight.top - gap;
              styles.left = spotlight.left + (spotlight.width / 2);
              styles.transform = 'translate(-50%, -100%)'; // Move UP by 100% of own height
              break;
          case 'bottom':
              styles.top = spotlight.top + spotlight.height + gap;
              styles.left = spotlight.left + (spotlight.width / 2);
              styles.transform = 'translate(-50%, 0)';
              break;
          case 'left':
              styles.top = spotlight.top + (spotlight.height / 2);
              styles.left = spotlight.left - gap;
              styles.transform = 'translate(-100%, -50%)';
              break;
          case 'right':
              styles.top = spotlight.top + (spotlight.height / 2);
              styles.left = spotlight.left + spotlight.width + gap;
              styles.transform = 'translate(0, -50%)';
              break;
      }
      return styles;
  };

  if (status === 'idle' || status === 'complete') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-auto font-sans">

      {/* ASK MODAL */}
      {status === 'ask' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500">
          <div className="bg-[#151921] border border-gray-800 p-6 rounded-2xl shadow-2xl max-w-sm text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-cyan-400">
              <MapPin size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Welcome to Nebula</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              New here? Take a quick interactive tour to learn the controls.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={skipTour} className="px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors font-medium">No, thanks</button>
              <button onClick={startTour} className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]">Start Tour</button>
            </div>
          </div>
        </div>
      )}

      {/* TOUR MODE */}
      {status === 'tour' && spotlight && (
        <>
          {/* DIMMED BACKGROUND (HOLE PUNCH) */}
          <div
            className="absolute transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-lg pointer-events-none"
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 0 2px rgba(6, 182, 212, 0.6)'
            }}
          />

          {/* TOOLTIP CARD */}
          <div
            className="w-[320px] bg-[#151921] border border-cyan-500/30 rounded-xl p-5 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={getTooltipStyles()}
          >
            <div className="flex items-center justify-between mb-3">
               <span className="text-[10px] font-bold text-cyan-500 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest">
                  Step {stepIndex + 1} of {TOUR_STEPS.length}
               </span>
               <button onClick={skipTour} className="text-gray-600 hover:text-white transition-colors">
                  <X size={14} />
               </button>
            </div>

            <h3 className="text-base font-bold text-white mb-2">{TOUR_STEPS[stepIndex].title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-5">{TOUR_STEPS[stepIndex].text}</p>

            <div className="flex items-center justify-between border-t border-gray-800 pt-3">
               <div className="flex gap-1">
                   {TOUR_STEPS.map((_, idx) => (
                       <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === stepIndex ? 'bg-cyan-500' : 'bg-gray-700'}`} />
                   ))}
               </div>
               <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-1.5 bg-white text-black hover:bg-gray-200 text-xs font-bold rounded-lg transition-colors"
               >
                  {stepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight size={14} />
               </button>
            </div>

            {/* DECORATIVE ARROW (Optional polish) */}
            <div className={`absolute w-3 h-3 bg-[#151921] border-cyan-500/30 rotate-45
                ${TOUR_STEPS[stepIndex].position === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r' : ''}
                ${TOUR_STEPS[stepIndex].position === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2 border-t border-l' : ''}
                ${TOUR_STEPS[stepIndex].position === 'right' ? '-left-1.5 top-1/2 -translate-y-1/2 border-b border-l' : ''}
            `} />
          </div>
        </>
      )}
    </div>,
    document.body
  );
}