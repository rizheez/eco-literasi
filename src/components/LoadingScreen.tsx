import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { playSound } from '../utils/audio';

const ASSETS_TO_PRELOAD = [
  '/images/burung_enggang.png',
  '/images/hutan_hujan.png',
  '/images/orangutan.png',
  '/images/sungai_mahakam.png',
  '/images/pesut_mahakam.png',
  '/images/rumah_lamin.png',
  '/images/musik_sape.png',
  '/images/hutan_rusak.png',
  '/images/hutan_subur.png',
  '/images/sungai_kotor.png',
  '/images/sungai_bersih.png'
];

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const totalAssets = ASSETS_TO_PRELOAD.length;

    if (totalAssets === 0) {
      setProgress(100);
      setIsReady(true);
      return;
    }

    ASSETS_TO_PRELOAD.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        setProgress(Math.round((loadedCount / totalAssets) * 100));
        if (loadedCount === totalAssets) {
          setTimeout(() => setIsReady(true), 500); // slight delay for smooth transition
        }
      };
      img.onerror = () => {
        // Even if one fails, we should still progress to avoid getting stuck
        loadedCount++;
        setProgress(Math.round((loadedCount / totalAssets) * 100));
        if (loadedCount === totalAssets) {
          setTimeout(() => setIsReady(true), 500);
        }
      };
    });
  }, []);

  const handleStart = () => {
    playSound('success');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[999] bg-gradient-to-b from-emerald-100 to-teal-200 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
        className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-playful border-4 border-emerald-300 max-w-sm w-full"
      >
        <div className="text-7xl mb-4 animate-float">🌳</div>
        <h1 className="text-3xl font-black text-emerald-900 mb-2">Eco Dayak Kids</h1>
        <p className="text-slate-600 font-bold mb-8">Eksplorasi Alam Kalimantan</p>

        <div className="h-4 bg-emerald-100 rounded-full overflow-hidden border-2 border-emerald-200 mb-4 relative">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        </div>
        
        <AnimatePresence mode="wait">
          {!isReady ? (
            <motion.p
              key="loading-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-emerald-700 font-extrabold"
            >
              Menyiapkan Petualangan... {progress}%
            </motion.p>
          ) : (
            <motion.button
              key="start-btn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-playful-primary flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
            >
              <Play fill="currentColor" size={24} />
              <span>Mulai Bermain!</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
