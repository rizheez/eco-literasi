import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakIndonesian, cancelSpeech, playSound } from '../utils/audio';
import { ArrowRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

// Simple check to resolve missing import/typing issue
declare global {
  interface Window {
    confetti?: any;
  }
}

interface OnboardingTourProps {
  onComplete: () => void;
  activeChildName: string;
}

const STEPS = [
  {
    targetSelector: '.onboarding-profile',
    text: 'Selamat datang! Aku Enggo yang akan memandu petualangan belajarmu. Di sebelah kiri atas adalah profil petualanganmu, tempat melihat namamu, level, dan bintangmu!',
    placement: 'right' as const,
  },
  {
    targetSelector: '.onboarding-nav-eksplorasi',
    text: 'Ayo ketuk menu Eksplorasi di sini untuk melihat peta petualangan dan belajar tentang budaya Dayak!',
    placement: 'right' as const,
  },
  {
    targetSelector: '.onboarding-mascot',
    text: 'Jika kamu butuh bantuan atau ingin mendengar petunjuk suara, cukup ketuk aku di sini!',
    placement: 'left' as const,
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, activeChildName }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Update window dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getTargetElement = () => {
    const step = STEPS[currentStep];
    const elements = document.querySelectorAll(step.targetSelector);
    for (let i = 0; i < elements.length; i++) {
      const rect = elements[i].getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return elements[i];
      }
    }
    return null;
  };

  useEffect(() => {
    const updateRect = () => {
      const el = getTargetElement();
      if (el) {
        const rect = el.getBoundingClientRect();
        setSpotlightRect({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setSpotlightRect(null);
      }
    };

    updateRect();
    const timer = setTimeout(updateRect, 200); // wait for layouts and router animations

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      clearTimeout(timer);
    };
  }, [currentStep]);

  // Speak narration when step changes
  useEffect(() => {
    let speechText = STEPS[currentStep].text;
    if (currentStep === 0) {
      speechText = `Selamat datang teman! Aku Enggo yang akan memandu petualangan belajarmu. Di sebelah kiri atas adalah profil petualanganmu, tempat melihat namamu, level, dan bintangmu!`;
    }
    
    // Brief delay to allow transitions to complete before speaking
    const speakTimer = setTimeout(() => {
      speakIndonesian(speechText);
    }, 150);

    return () => {
      clearTimeout(speakTimer);
      cancelSpeech();
    };
  }, [currentStep]);

  const handleNext = () => {
    playSound('click');
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    playSound('success');
    try {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn("Confetti failed", e);
    }
    onComplete();
  };

  const handleSkip = () => {
    playSound('error');
    onComplete();
  };

  if (!spotlightRect) return null;

  const pad = 12;
  const rx = spotlightRect.left - pad;
  const ry = spotlightRect.top - pad;
  const rw = spotlightRect.width + pad * 2;
  const rh = spotlightRect.height + pad * 2;
  const w = dimensions.width;
  const h = dimensions.height;

  // Hollow mask path
  const svgPath = `M 0,0 L ${w},0 L ${w},${h} L 0,${h} Z M ${rx},${ry} L ${rx},${ry + rh} L ${rx + rw},${ry + rh} L ${rx + rw},${ry} Z`;

  const isMobile = w < 768;

  // Calculate bubble positioning for desktop
  let bubbleStyle: React.CSSProperties = {};
  if (!isMobile) {
    const step = STEPS[currentStep];
    const bubbleWidth = 340;

    if (step.placement === 'right') {
      bubbleStyle.left = `${rx + rw + 24}px`;
    } else if (step.placement === 'left') {
      bubbleStyle.left = `${rx - bubbleWidth - 24}px`;
    }

    // Vertical positioning: prevent bottom/top screen overflow
    const targetCenterY = ry + rh / 2;
    const viewportHalfY = h / 2;

    if (targetCenterY > viewportHalfY) {
      // Target is in the bottom half of the screen: position from bottom upwards
      const bottomDistance = h - (ry + rh);
      bubbleStyle.bottom = `${Math.max(16, bottomDistance)}px`;
      bubbleStyle.top = 'auto';
    } else {
      // Target is in the top half of the screen: position from top downwards
      bubbleStyle.top = `${Math.max(16, ry)}px`;
      bubbleStyle.bottom = 'auto';
    }
  }

  // Determine mobile positioning class to avoid covering active highlights
  let mobilePlacementClass = 'fixed bottom-8';
  if (isMobile) {
    const targetCenterY = ry + rh / 2;
    const viewportHalfY = h / 2;
    if (targetCenterY > viewportHalfY) {
      // Highlight is at the bottom half, place dialog bubble at the top
      mobilePlacementClass = 'fixed top-20';
    } else {
      // Highlight is at the top half, place dialog bubble at the bottom
      mobilePlacementClass = 'fixed bottom-8';
    }
  }

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none select-none">
      {/* Background overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <motion.path
          fill="rgba(15, 23, 42, 0.75)"
          fillRule="evenodd"
          d={svgPath}
          animate={{ d: svgPath }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        />
      </svg>

      {/* Dialogue bubble */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: isMobile ? (mobilePlacementClass.includes('top') ? -50 : 50) : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: isMobile ? (mobilePlacementClass.includes('top') ? -50 : 50) : 0 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            className={`pointer-events-auto w-[90%] max-w-[350px] bg-white border-4 border-emerald-400 p-5 rounded-[2rem] shadow-2xl flex flex-col md:absolute ${
              isMobile ? mobilePlacementClass : ''
            }`}
            style={isMobile ? undefined : bubbleStyle}
          >
            {/* Mascot header */}
            <div className="flex items-center space-x-3 border-b-2 border-emerald-50 pb-2 mb-3">
              <img 
                src="/images/mascot_enggo.png" 
                alt="Enggo Mascot" 
                className="w-12 h-12 object-contain animate-float"
              />
              <div>
                <h5 className="font-black text-emerald-950 text-sm leading-none">Pemandu Enggo</h5>
                <span className="text-[10px] text-slate-400 font-bold">Langkah {currentStep + 1} dari {STEPS.length}</span>
              </div>
            </div>

            {/* Instruction Text */}
            <p className="text-slate-700 font-bold text-sm leading-relaxed mb-4">
              {currentStep === 0 
                ? `Selamat datang ${activeChildName}! Aku Enggo yang akan memandu petualangan belajarmu. Di sebelah kiri atas adalah profil petualanganmu, tempat melihat namamu, level, dan bintangmu!`
                : STEPS[currentStep].text
              }
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-between mt-auto">
              <button
                onClick={handleSkip}
                className="text-slate-400 hover:text-rose-500 font-black text-xs px-3 py-2 rounded-xl transition cursor-pointer"
              >
                Lewati
              </button>

              <button
                onClick={handleNext}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-2xl font-black text-sm flex items-center space-x-1.5 shadow-md btn-bouncy transition cursor-pointer"
              >
                <span>{currentStep === STEPS.length - 1 ? 'Selesai' : 'Lanjut'}</span>
                {currentStep === STEPS.length - 1 ? <Check size={16} /> : <ArrowRight size={16} />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
