import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChildStore } from '../store/useChildStore';
import { useProgressStore } from '../store/useProgressStore';
import { playSound, speakIndonesian } from '../utils/audio';
import { motion } from 'framer-motion';
import { Compass, Languages, Leaf, Gamepad2, Award } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { activeChild } = useChildStore();
  const { completedSteps, badges, loadProgress } = useProgressStore();

  useEffect(() => {
    if (activeChild?.id) {
      loadProgress(activeChild.id);
    }
  }, [activeChild, loadProgress]);

  const stages = [
    {
      id: 'eksplorasi',
      title: '1. Eksplorasi Budaya',
      description: 'Kenali flora, fauna & budaya Dayak Kaltim!',
      icon: Compass,
      color: 'bg-gradient-to-br from-blue-400 to-sky-500',
      shadowClass: 'shadow-playful-blue',
      path: '/eksplorasi',
      items: ['eksplorasi_enggang', 'eksplorasi_hutan', 'eksplorasi_sungai']
    },
    {
      id: 'konstruksi',
      title: '2. Konstruksi Bahasa',
      description: 'Latih mendengar, mencocokkan & melafalkan kosakata!',
      icon: Languages,
      color: 'bg-gradient-to-br from-amber-400 to-orange-500',
      shadowClass: 'shadow-playful-secondary',
      path: '/konstruksi',
      items: ['konstruksi_matching']
    },
    {
      id: 'internalisasi',
      title: '3. Internalisasi Eco',
      description: 'Lihat apa yang terjadi jika kita menjaga hutan dan sungai!',
      icon: Leaf,
      color: 'bg-gradient-to-br from-emerald-400 to-green-500',
      shadowClass: 'shadow-playful-primary',
      path: '/internalisasi',
      items: ['internalisasi_forest', 'internalisasi_river']
    },
    {
      id: 'aksi',
      title: '4. Aksi & Kreasi',
      description: 'Bermain game ejaan kata & selesaikan puzzle alam!',
      icon: Gamepad2,
      color: 'bg-gradient-to-br from-rose-400 to-pink-500',
      shadowClass: 'shadow-playful-rose',
      path: '/aksi',
      items: ['aksi_wordbuilder', 'aksi_puzzle']
    }
  ];

  const getCompletionPercentage = (items: string[]) => {
    if (items.length === 0) return 0;
    const completedCount = items.filter(step => completedSteps.includes(step)).length;
    return Math.round((completedCount / items.length) * 100);
  };

  const handleStageClick = (path: string, title: string) => {
    playSound('pop');
    speakIndonesian(`Mari bermain ${title.substring(3)}`);
    navigate(path);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl p-6 md:p-8 border-4 border-emerald-300 shadow-playful flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-800">
            Halo, {activeChild?.name}! 👋
          </h2>
          <p className="text-slate-600 text-lg md:text-xl font-bold">
            Siap untuk petualangan seru hari ini? Pilih salah satu petualangan di bawah ya!
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0 bg-emerald-50 px-6 py-3 rounded-2xl border-2 border-emerald-100">
          <span className="text-5xl animate-float">🦜</span>
          <div>
            <p className="text-xs text-emerald-700 font-black tracking-widest uppercase">Maskot Petualang</p>
            <p className="text-lg font-extrabold text-emerald-950">Enggang Cerdik</p>
          </div>
        </div>
      </motion.div>

      {/* Grid of Learning Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const pct = getCompletionPercentage(stage.items);
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleStageClick(stage.path, stage.title)}
              className={`${stage.color} text-white rounded-3xl p-6 cursor-pointer shadow-playful hover:translate-y-[-4px] active:translate-y-[4px] transition-all flex flex-col justify-between min-h-[190px] border-4 border-white/40`}
            >
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Icon size={32} className="text-white" />
                </div>
                {pct === 100 ? (
                  <span className="bg-white text-emerald-600 font-bold px-3 py-1 rounded-full text-sm shadow-sm flex items-center space-x-1">
                    <span>Selesai</span> ✅
                  </span>
                ) : pct > 0 ? (
                  <span className="bg-white/30 text-white font-bold px-3 py-1 rounded-full text-sm">
                    {pct}% Selesai
                  </span>
                ) : (
                  <span className="bg-white/20 text-white/90 font-bold px-3 py-1 rounded-full text-xs">
                    Mulai ⭐
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-2xl font-black">{stage.title}</h3>
                <p className="text-white/90 text-sm font-semibold mt-1 leading-snug">{stage.description}</p>
              </div>

              {/* Minimal Progress Bar */}
              <div className="w-full bg-white/25 rounded-full h-3 mt-4 overflow-hidden border border-white/20">
                <div className="bg-white h-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Badges Carousel / Banner */}
      {badges.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl p-6 border-4 border-purple-200 shadow-playful"
        >
          <div className="flex items-center space-x-2 text-purple-800 mb-4">
            <Award size={28} />
            <h3 className="text-2xl font-extrabold">Lencana Penghargaan</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                title={`Didapatkan pada ${badge.dateEarned}`}
                className="flex items-center space-x-2 bg-purple-50 px-4 py-2.5 rounded-2xl border-2 border-purple-100 shadow-sm"
              >
                <span className="text-3xl">{badge.icon}</span>
                <span className="font-extrabold text-purple-950 text-sm">{badge.badgeName}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
