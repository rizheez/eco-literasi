import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useChildStore } from '../../store/useChildStore';
import { playSound, speakIndonesian, cancelSpeech } from '../../utils/audio';
import { 
  Home, Compass, Languages, Leaf, Gamepad2, Award, Settings, LogOut, Volume2, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const guideTexts: Record<string, string> = {
  '/': 'Halo! Aku Enggo, teman belajarmu! Ayo pilih salah satu menu petualangan di sebelah kiri atau bawah untuk mulai belajar, bermain game seru, dan mengumpulkan bintang!',
  '/eksplorasi': 'Di sini kita bisa melihat keindahan alam Kalimantan! Ketuk salah satu kartu untuk mendengarkan cerita menarik tentang budaya dan hewan-hewan kita. Selesai membaca akan dapat bintang!',
  '/konstruksi': 'Ayo dengarkan cerita interaktif seru! Ketuk cerita yang kamu suka untuk mendengar petualangan Pongo dan sahabat-sahabatnya. Kamu juga bisa belajar mengeja kata di kamus kosakata!',
  '/internalisasi': 'Ayo bantu aku memilih tindakan yang baik untuk bumi! Ketuk salah satu tombol pilihan untuk melihat dampaknya terhadap alam Kalimantan. Jangan lupa berjanji untuk menyayangi bumi ya!',
  '/aksi': 'Waktunya bermain game seru! Ada susun huruf kosakata Dayak, mencocokkan sebab-akibat, menyusun puzzle alam, dan melatih memori. Setiap game yang selesai akan memberimu bintang!',
  '/progress': 'Wah, lihat semua pencapaian luar biasamu! Di sini kamu bisa melihat daftar tugas yang sudah selesai dan jumlah bintang serta medali yang berhasil kamu kumpulkan!',
  '/settings': 'Di menu pengaturan ini, kamu atau orang tuamu bisa mengatur besar kecilnya volume musik latar dan volume suara pemandu, atau menghapus data jika ingin mengulang dari awal.'
};

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { activeChild } = useChildStore();
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setShowHelp(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Mulai', path: '/', icon: Home, color: 'text-emerald-500' },
    { name: 'Eksplorasi', path: '/eksplorasi', icon: Compass, color: 'text-blue-500' },
    { name: 'Konstruksi', path: '/konstruksi', icon: Languages, color: 'text-amber-500' },
    { name: 'Internalisasi', path: '/internalisasi', icon: Leaf, color: 'text-green-500' },
    { name: 'Aksi Kreasi', path: '/aksi', icon: Gamepad2, color: 'text-rose-500' },
    { name: 'Piala', path: '/progress', icon: Award, color: 'text-purple-500' },
  ];

  const handleNavClick = () => {
    playSound('pop');
  };

  const handleLogout = () => {
    playSound('error');
    if (window.confirm('Keluar dari profil ini?')) {
      useChildStore.setState({ activeChild: null });
    }
  };

  const getGuideText = () => {
    const path = location.pathname;
    return guideTexts[path] || guideTexts['/'];
  };

  const handleToggleHelp = () => {
    if (showHelp) {
      cancelSpeech();
      setShowHelp(false);
    } else {
      playSound('pop');
      setShowHelp(true);
      speakIndonesian(getGuideText());
    }
  };

  const handleReplayHelp = () => {
    playSound('click');
    speakIndonesian(getGuideText());
  };

  if (!activeChild) {
    return <div className="min-h-screen bg-transparent">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-transparent">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-72 bg-white/90 backdrop-blur-xl border-r-2 border-white/50 p-6 space-y-8 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.05)]">
        {/* Child Profile Header */}
        <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-100 flex items-center space-x-3">
          <span className="text-4xl animate-bounce">{activeChild.avatar}</span>
          <div className="overflow-hidden">
            <h4 className="font-bold text-emerald-900 truncate">{activeChild.name}</h4>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="bg-emerald-200 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">Lvl {activeChild.level}</span>
              <span className="text-amber-500 font-bold text-sm">⭐ {activeChild.totalStars}</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-lg transition-all ${
                  isActive 
                    ? 'bg-emerald-500 text-white shadow-playful-primary' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={24} className={isActive ? 'text-white' : item.color} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Buttons */}
        <div className="space-y-2">
          <Link
            to="/settings"
            onClick={handleNavClick}
            className={`flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-lg transition-all ${
              location.pathname === '/settings' 
                ? 'bg-emerald-500 text-white shadow-playful-primary' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings size={24} className={location.pathname === '/settings' ? 'text-white' : 'text-slate-500'} />
            <span>Pengaturan</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
          >
            <LogOut size={24} />
            <span>Ganti Profil</span>
          </button>
        </div>
      </aside>

      {/* TOP HEADER FOR MOBILE */}
      <header className="md:hidden bg-white border-b-4 border-emerald-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <span className="text-3xl">{activeChild.avatar}</span>
          <div>
            <h4 className="font-bold text-emerald-950 text-sm truncate max-w-[120px]">{activeChild.name}</h4>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-px rounded font-bold">Lvl {activeChild.level}</span>
              <span className="text-amber-500 font-bold text-xs">⭐ {activeChild.totalStars}</span>
            </div>
          </div>
        </div>
        <h1 className="font-black text-xl text-emerald-800 tracking-wide">ECO-DAYAK</h1>
        <div className="flex items-center space-x-1">
          <Link
            to="/settings"
            onClick={handleNavClick}
            className={`p-2 rounded-xl text-slate-500 hover:bg-slate-100 ${location.pathname === '/settings' ? 'bg-emerald-500 text-white' : ''}`}
          >
            <Settings size={20} className={location.pathname === '/settings' ? 'text-white' : ''} />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto max-h-screen pb-24 md:pb-8">
        <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col justify-center">
          {children}
        </div>
      </main>

      {/* BOTTOM NAVIGATION FOR MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-emerald-100 flex justify-around py-2 px-1 z-40 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition ${
                isActive ? 'text-emerald-600 scale-105 font-bold' : 'text-slate-500'
              }`}
            >
              <Icon size={22} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* FLOATING MASCOT HELP BUTTON */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 flex flex-col items-end">
        {/* Help Speech Bubble */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="mb-3 w-72 md:w-80 bg-white border-4 border-emerald-400 p-4 rounded-3xl shadow-2xl relative flex flex-col space-y-3"
            >
              {/* Speech bubble tail pointer */}
              <div className="absolute bottom-[-16px] right-14 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-emerald-400"></div>
              <div className="absolute bottom-[-10px] right-14 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-white"></div>

              {/* Header inside bubble */}
              <div className="flex items-center justify-between border-b-2 border-emerald-50 pb-2">
                <div>
                  <h5 className="font-black text-emerald-900 text-sm leading-none flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Panduan Enggo</span>
                  </h5>
                </div>
                <button 
                  onClick={() => { playSound('click'); cancelSpeech(); setShowHelp(false); }}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-full hover:bg-rose-50 cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Text Inside Bubble */}
              <p className="text-slate-700 font-bold text-sm leading-relaxed">
                {getGuideText()}
              </p>

              {/* Replay voice button */}
              <button
                onClick={handleReplayHelp}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm btn-bouncy transition cursor-pointer"
              >
                <Volume2 size={14} />
                <span>Dengarkan Petunjuk</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Organic Mascot Trigger */}
        <motion.button
          onClick={handleToggleHelp}
          animate={showHelp ? {} : { y: [0, -8, 0] }}
          transition={showHelp ? {} : { repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative outline-none cursor-pointer group drop-shadow-2xl mt-2"
        >
          {/* Subtle glow/shadow behind the mascot */}
          <div className="absolute inset-2 bg-white/40 blur-xl rounded-full scale-125 z-0"></div>
          
          <img 
            src="/images/mascot_enggo.png" 
            alt="Maskot Enggo" 
            className="w-20 h-20 md:w-28 md:h-28 object-contain relative z-10 transition-transform drop-shadow-[0_10px_15px_rgba(0,0,0,0.25)]" 
          />
          
          {/* Little "Tanya?" indicator that appears on hover or idle */}
          {!showHelp && (
            <div className="absolute -top-1 -left-2 md:-top-2 md:-left-4 bg-white text-emerald-600 font-black text-[10px] md:text-xs px-2 py-1 rounded-xl shadow-md border-2 border-emerald-100 rotate-[-12deg] group-hover:rotate-0 transition-transform z-20">
              Tanya?
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
};
