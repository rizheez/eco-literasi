import React, { useEffect } from 'react';
import { useChildStore } from '../store/useChildStore';
import { useProgressStore } from '../store/useProgressStore';
import { playSound, speakIndonesian } from '../utils/audio';
import { ChevronLeft, Award, BookOpen, Trash2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Progress: React.FC = () => {
  const { activeChild } = useChildStore();
  const { completedSteps, badges, loadProgress, resetProgress } = useProgressStore();

  useEffect(() => {
    if (activeChild?.id) {
      loadProgress(activeChild.id);
    }
  }, [activeChild, loadProgress]);

  const learningSteps = [
    { id: 'eksplorasi_enggang', label: 'Eksplorasi: Burung Enggang 🦜' },
    { id: 'eksplorasi_hutan', label: 'Eksplorasi: Hutan Hujan 🌳' },
    { id: 'eksplorasi_orangutan', label: 'Eksplorasi: Orangutan Kaltim 🦧' },
    { id: 'eksplorasi_sungai', label: 'Eksplorasi: Sungai Mahakam 🌊' },
    { id: 'eksplorasi_pesut', label: 'Eksplorasi: Pesut Mahakam 🐬' },
    { id: 'eksplorasi_lamin', label: 'Eksplorasi: Rumah Lamin 🏠' },
    { id: 'eksplorasi_sape', label: 'Eksplorasi: Musik Sape 🎸' },
    { id: 'konstruksi_matching', label: 'Konstruksi: Cocokkan Kosakata 🎮' },
    { id: 'konstruksi_cerita', label: 'Konstruksi: Cerita & Tanya Jawab 📚' },
    { id: 'internalisasi_forest', label: 'Internalisasi: Jaga Hutan Kaltim 🌲' },
    { id: 'internalisasi_river', label: 'Internalisasi: Jaga Sungai Mahakam 💧' },
    { id: 'aksi_wordbuilder', label: 'Aksi Kreasi: Susun Huruf Kosakata 🔠' },
    { id: 'aksi_sebab_akibat', label: 'Aksi Kreasi: Hubungkan Sebab-Akibat 🔗' },
    { id: 'aksi_puzzle', label: 'Aksi Kreasi: Puzzle Gambar Alam 🧩' },
    { id: 'aksi_memory', label: 'Aksi Kreasi: Memori Alam 🧠' },
  ];

  const handleReset = async () => {
    playSound('error');
    if (activeChild?.id && window.confirm('Bapak/Ibu Guru & Orang Tua: Apakah Anda yakin ingin menyetel ulang (reset) seluruh perkembangan belajar anak ini? Tindakan ini tidak dapat dibatalkan.')) {
      await resetProgress(activeChild.id);
      speakIndonesian("Data belajar kamu sudah dibersihkan. Mari mulai dari awal!");
    }
  };

  const getBadgesString = () => {
    if (badges.length === 0) return 'Belum ada lencana yang didapatkan. Ayo belajar lebih rajin!';
    return `Kamu sudah mendapatkan ${badges.length} lencana hebat!`;
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-md p-4 rounded-3xl border-3 border-emerald-100/85 shadow-sm">
        <Link to="/" onClick={() => playSound('click')} className="p-3 bg-white rounded-2xl border-2 border-emerald-100 hover:bg-emerald-50 transition text-slate-700 shrink-0">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-emerald-800 font-sans">Laporan Progress Belajar</h2>
          <p className="text-slate-600 font-bold text-sm">Lihat pencapaian belajarmu, bintang, dan lencana yang berhasil kamu kumpulkan!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Stats & Badge overview */}
        <div className="md:col-span-1 space-y-6">
          {/* Level Card */}
          <div className="bg-white rounded-3xl p-6 border-4 border-emerald-350 shadow-playful text-center space-y-4">
            <span className="text-6xl block animate-bounce">{activeChild?.avatar}</span>
            <div>
              <h3 className="text-2xl font-black text-emerald-950">{activeChild?.name}</h3>
              <p className="text-emerald-600 font-extrabold text-sm uppercase tracking-wide">Pemain Aktif</p>
            </div>
            
            <div className="flex items-center justify-around border-t-2 border-slate-100 pt-4 mt-2">
              <div className="text-center">
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase">Tingkat</span>
                <p className="text-3xl font-black text-emerald-950 mt-1">{activeChild?.level}</p>
              </div>
              <div className="text-center">
                <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase">Bintang</span>
                <p className="text-3xl font-black text-amber-600 mt-1 flex items-center justify-center gap-1">
                  ⭐ {activeChild?.totalStars}
                </p>
              </div>
            </div>
          </div>

          {/* Badge Milestones */}
          <div className="bg-white rounded-3xl p-6 border-4 border-purple-300 shadow-playful space-y-4">
            <h4 className="text-xl font-extrabold text-purple-900 flex items-center space-x-2">
              <Award size={24} />
              <span>Lencana Hebat</span>
            </h4>
            <p className="text-slate-600 font-bold text-xs">{getBadgesString()}</p>
            
            <div className="space-y-3">
              {badges.map((b) => (
                <div key={b.id} className="flex items-center space-x-3 bg-purple-50 p-3 rounded-2xl border border-purple-100">
                  <span className="text-3xl">{b.icon}</span>
                  <div>
                    <h5 className="font-extrabold text-purple-950 text-sm">{b.badgeName}</h5>
                    <p className="text-[10px] text-purple-600 font-bold">Diterima: {b.dateEarned}</p>
                  </div>
                </div>
              ))}
              {badges.length === 0 && (
                <div className="text-center py-6 text-slate-400 font-medium">Selesaikan modul untuk membuka lencana pertamamu!</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Step Checklist & Parent control */}
        <div className="md:col-span-2 space-y-6">
          {/* Checklist */}
          <div className="bg-white rounded-3xl p-6 border-4 border-blue-300 shadow-playful space-y-4">
            <h4 className="text-xl font-extrabold text-blue-900 flex items-center space-x-2">
              <BookOpen size={24} />
              <span>Petualangan yang Sudah Diselesaikan</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {learningSteps.map((step) => {
                const isDone = completedSteps.includes(step.id);
                return (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 p-3.5 rounded-2xl border-2 transition-all ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                        : 'bg-slate-50 border-slate-100 text-slate-400 font-semibold'
                    }`}
                  >
                    <span className="text-xl shrink-0">
                      {isDone ? '✅' : '🔒'}
                    </span>
                    <span className="text-sm">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset / Teacher panel */}
          <div className="bg-rose-50 rounded-3xl p-6 border-4 border-rose-200 shadow-playful space-y-4">
            <h4 className="text-xl font-extrabold text-rose-900 flex items-center space-x-2">
              <ShieldAlert size={24} className="text-rose-600 animate-pulse" />
              <span>Kontrol Guru & Orang Tua</span>
            </h4>
            <p className="text-rose-800 text-sm font-semibold leading-relaxed">
              Tombol di bawah ini digunakan untuk menghapus semua progress belajar dan menyetel ulang level & bintang untuk profil petualang saat ini.
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-extrabold flex items-center justify-center space-x-2 shadow-playful-rose transition cursor-pointer active:translate-y-[2px]"
            >
              <Trash2 size={20} />
              <span>Set Ulang Perkembangan Belajar Anak</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
