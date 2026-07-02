import React, { useState, useEffect } from 'react';
import { useProgressStore } from '../store/useProgressStore';
import { playSound, speakIndonesian, cancelSpeech } from '../utils/audio';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Volume2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface ExploreItem {
  id: string;
  title: string;
  emoji: string;
  image?: string;
  description: string;
  ecoLesson: string;
}

const ImageWithFallback: React.FC<{ src?: string; alt: string; fallback: string; className: string }> = ({
  src,
  alt,
  fallback,
  className
}) => {
  const [hasError, setHasError] = useState(false);
  if (hasError || !src) {
    return <span className={className}>{fallback}</span>;
  }
  return <img src={src} alt={alt} className={className} onError={() => setHasError(true)} />;
};

export const Eksplorasi: React.FC = () => {
  const { completedSteps, completeStep } = useProgressStore();
  const [selectedItem, setSelectedItem] = useState<ExploreItem | null>(null);

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  const items: ExploreItem[] = [
    {
      id: 'eksplorasi_enggang',
      title: 'Burung Enggang',
      emoji: '🦜',
      image: '/images/burung_enggang.png',
      description: 'Burung Enggang adalah burung suci bagi masyarakat Dayak. Bulunya melambangkan kesucian dan perdamaian.',
      ecoLesson: 'Habitat Burung Enggang adalah di atas pohon-pohon tinggi di hutan lebat. Jika pohon ditebang, burung cantik ini tidak punya rumah lagi.'
    },
    {
      id: 'eksplorasi_hutan',
      title: 'Hutan Hujan',
      emoji: '🌳',
      image: '/images/hutan_hujan.png',
      description: 'Hutan hujan Kalimantan adalah paru-paru dunia. Di sini tumbuh beraneka jenis pohon besar, bunga, dan buah liar.',
      ecoLesson: 'Menjaga hutan dari kebakaran dan pembalakan liar membantu menyeimbangkan suhu bumi serta menghindari banjir bandang.'
    },
    {
      id: 'eksplorasi_orangutan',
      title: 'Orangutan Kaltim',
      emoji: '🦧',
      image: '/images/orangutan.png',
      description: 'Orangutan adalah kera besar berambut merah khas Kalimantan. Mereka sangat cerdas dan menghabiskan sebagian besar hidupnya di atas pohon.',
      ecoLesson: 'Ketika hutan ditebang atau dibakar, mereka kehilangan rumah dan makanan. Ayo lindungi hutan tempat tinggal orangutan!'
    },
    {
      id: 'eksplorasi_sungai',
      title: 'Sungai Mahakam',
      emoji: '🌊',
      image: '/images/sungai_mahakam.png',
      description: 'Sungai Mahakam adalah sungai terpanjang di Kalimantan Timur. Sungai ini menjadi sumber air kehidupan bagi tumbuhan, hewan, dan manusia.',
      ecoLesson: 'Sungai Mahakam harus dijaga agar airnya tetap bersih sehingga semua makhluk hidup bisa memanfaatkan airnya tanpa khawatir sakit.'
    },
    {
      id: 'eksplorasi_pesut',
      title: 'Pesut Mahakam',
      emoji: '🐬',
      image: '/images/pesut_mahakam.png',
      description: 'Pesut Mahakam adalah lumba-lumba air tawar ramah yang merupakan hewan endemik Sungai Mahakam. Jumlah mereka kini sangat sedikit.',
      ecoLesson: 'Membuang sampah plastik dan limbah ke sungai dapat meracuni air dan membahayakan pesut. Mari kita jaga sungai agar pesut tetap lestari!'
    },
    {
      id: 'eksplorasi_lamin',
      title: 'Rumah Lamin',
      emoji: '🏠',
      image: '/images/rumah_lamin.png',
      description: 'Rumah Lamin adalah rumah adat suku Dayak berbentuk panggung panjang. Di sini, banyak keluarga tinggal bersama-sama.',
      ecoLesson: 'Rumah Lamin mengajarkan kita nilai gotong royong dan menjaga kebersihan pekarangan rumah bersama tetangga.'
    },
    {
      id: 'eksplorasi_sape',
      title: 'Musik Tradisional Sape',
      emoji: '🎸',
      image: '/images/musik_sape.png',
      description: 'Sape adalah alat musik petik tradisional Dayak yang suaranya merdu sekali seperti kicau burung di hutan.',
      ecoLesson: 'Suku Dayak memainkan Sape untuk mengungkapkan rasa syukur atas limpahan hasil panen dan keindahan alam ciptaan Tuhan.'
    }
  ];

  const handleSelectItem = (item: ExploreItem) => {
    playSound('pop');
    setSelectedItem(item);
    // Auto speak title & description
    const fullText = `${item.title}. ${item.description} ${item.ecoLesson}`;
    speakIndonesian(fullText);
  };

  const handleComplete = async (itemId: string) => {
    playSound('success');
    const isNew = await completeStep(itemId, 2);
    if (isNew) {
      speakIndonesian("Hebat! Kamu mendapatkan dua bintang!");
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-md p-4 rounded-3xl border-3 border-emerald-100/85 shadow-sm">
        <Link to="/" onClick={() => playSound('click')} className="p-3 bg-white rounded-2xl border-2 border-emerald-100 hover:bg-emerald-50 transition text-slate-700 shrink-0">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-emerald-800">Eksplorasi Budaya & Alam</h2>
          <p className="text-slate-600 font-bold text-sm">Ketuk gambar untuk mendengarkan cerita dan dapatkan bintang!</p>
        </div>
      </div>

      {/* Grid of gallery items */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item, index) => {
          const isCompleted = completedSteps.includes(item.id);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => handleSelectItem(item)}
              className="bg-white rounded-3xl p-5 border-4 border-emerald-100 text-center cursor-pointer shadow-playful hover:border-emerald-400 hover:translate-y-[-4px] transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px]"
            >
              {isCompleted && (
                <div className="absolute top-3 right-3 text-emerald-500">
                  <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                </div>
              )}
              <ImageWithFallback
                src={item.image}
                alt={item.title}
                fallback={item.emoji}
                className="w-24 h-24 object-contain mx-auto my-2 animate-float-delayed rounded-xl flex items-center justify-center text-6xl"
              />
              <h3 className="font-extrabold text-xl text-emerald-950">{item.title}</h3>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Overlay Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-emerald-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border-4 border-blue-400 shadow-2xl relative"
            >
              <button 
                onClick={() => { playSound('click'); cancelSpeech(); setSelectedItem(null); }}
                className="absolute top-4 right-4 bg-slate-100 text-slate-500 p-2 rounded-full font-bold hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>

              <div className="text-center space-y-4">
                <ImageWithFallback
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  fallback={selectedItem.emoji}
                  className="w-36 h-36 object-contain mx-auto animate-float rounded-2xl flex items-center justify-center text-8xl"
                />
                <h3 className="text-3xl font-extrabold text-blue-900 flex justify-center items-center gap-2">
                  {selectedItem.title}
                  <button
                    onClick={() => { playSound('click'); speakIndonesian(`${selectedItem.title}. ${selectedItem.description} ${selectedItem.ecoLesson}`); }}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition cursor-pointer"
                    title="Suara Panduan"
                  >
                    <Volume2 size={20} />
                  </button>
                </h3>
              </div>

              <div className="mt-6 space-y-4 text-slate-700">
                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                  <h4 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-1">📖 Budaya Dayak</h4>
                  <p className="font-semibold text-base leading-relaxed">{selectedItem.description}</p>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-100">
                  <h4 className="font-extrabold text-emerald-800 text-sm tracking-wider uppercase mb-1">🌳 Nilai Ekologi</h4>
                  <p className="font-semibold text-base leading-relaxed text-emerald-950">{selectedItem.ecoLesson}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse md:flex-row gap-3">
                <button
                  onClick={() => { playSound('click'); cancelSpeech(); setSelectedItem(null); }}
                  className="w-full md:w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition cursor-pointer"
                >
                  Tutup
                </button>
                {completedSteps.includes(selectedItem.id) ? (
                  <button
                    disabled
                    className="w-full md:w-2/3 py-4 bg-emerald-100 text-emerald-600 font-bold rounded-2xl flex items-center justify-center space-x-2 border-2 border-emerald-200 cursor-not-allowed opacity-80"
                  >
                    <CheckCircle2 size={22} className="shrink-0" />
                    <span>Sudah Selesai ✅</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleComplete(selectedItem.id)}
                    className="w-full md:w-2/3 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-playful-primary flex items-center justify-center space-x-2 cursor-pointer btn-bouncy transition-all"
                  >
                    <CheckCircle2 size={22} className="shrink-0" />
                    <span>Selesai & Ambil Bintang (+2 ⭐)</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
