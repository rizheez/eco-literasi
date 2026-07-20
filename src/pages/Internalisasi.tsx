import React, { useState, useEffect } from "react";
import { useProgressStore } from "../store/useProgressStore";
import { playSound, speakIndonesian, cancelSpeech } from "../utils/audio";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CheckCircle2, Heart, Trees, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";

interface Scenario {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  question: string;
  choices: {
    text: string;
    emoji: string;
    isCorrect: boolean;
    visualEffect: string; // Tailwind bg
    illustrations: string[]; // Emojis to display
    image?: string; // Image path
    outcomeTitle: string;
    outcomeDesc: string;
  }[];
}

const OutcomeVisualizer: React.FC<{ image?: string; illustrations: string[]; alt: string }> = ({
  image,
  illustrations,
  alt,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [image]);

  if (image && !hasError) {
    return (
      <div className="bg-white/90 backdrop-blur-sm border-2 border-white rounded-2xl p-4 flex justify-center items-center min-h-[220px]">
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={image}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full max-w-lg h-48 md:h-56 object-contain rounded-2xl"
        />
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border-2 border-white rounded-2xl p-6 flex flex-wrap gap-5 justify-center items-center text-5xl min-h-[100px]">
      {illustrations.map((ill, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: i * 0.05 }}
          className="inline-block cursor-default"
        >
          {ill}
        </motion.span>
      ))}
    </div>
  );
};

export const Internalisasi: React.FC = () => {
  const { completedSteps, completeStep } = useProgressStore();
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number | null>(null);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [hasReflected, setHasReflected] = useState(false);

  useEffect(() => {
    playSound("pop");
    speakIndonesian("Pelajari hubungan sebab-akibat perilaku manusia terhadap kelestarian alam.");
    return () => {
      cancelSpeech();
    };
  }, []);

  const scenarios: Scenario[] = [
    {
      id: "internalisasi_forest",
      title: "Menjaga Hutan Kalimantan",
      icon: Trees,
      question: "Apa yang sebaiknya kita lakukan pada pohon-pohon di hutan?",
      choices: [
        {
          text: "Tebang Liar dan Bakar Hutan",
          emoji: "🪓🔥",
          isCorrect: false,
          visualEffect: "from-orange-150 to-amber-100 border-red-300 bg-red-50",
          illustrations: ["🍂", "🔥", "🪓", "🐗", "😢", "🥀"],
          image: "/images/hutan_rusak.png",
          outcomeTitle: "Hutan Gundul dan Rusak 😢",
          outcomeDesc:
            "Bila pohon ditebang habis dan dibakar, hewan seperti orangutan kehilangan rumahnya. Tanah akan longsor dan banjir bandang melanda saat hujan lebat.",
        },
        {
          text: "Jaga Hutan dan Tanam Pohon",
          emoji: "🌳🌱",
          isCorrect: true,
          visualEffect: "from-emerald-50 to-teal-50 border-emerald-300 bg-emerald-50",
          illustrations: ["🌳", "🌱", "🦜", "🐒", "🦋", "🌸", "😊"],
          image: "/images/hutan_subur.png",
          outcomeTitle: "Hutan Subur dan Hijau! 😍",
          outcomeDesc:
            "Hutan yang rimbun menyerap air hujan untuk mencegah banjir, membersihkan udara agar sejuk, dan menjadi tempat hidup yang damai bagi satwa liar Kalimantan.",
        },
      ],
    },
    {
      id: "internalisasi_river",
      title: "Merawat Sungai Mahakam",
      icon: Waves,
      question: "Bagaimana cara kita memperlakukan sungai agar tetap sehat?",
      choices: [
        {
          text: "Buang Sampah Plastik ke Sungai",
          emoji: "🥤🗑️",
          isCorrect: false,
          visualEffect: "from-slate-100 to-zinc-200 border-slate-350 bg-slate-100",
          illustrations: ["🥤", "🩹", "🛶", "🐟", "🗑️", "🤢", "⛈️"],
          image: "/images/sungai_kotor.png",
          outcomeTitle: "Sungai Kotor dan Tercemar 🤮",
          outcomeDesc:
            "Sampah menyumbat aliran air, bau tidak sedap menyebar, pesut mahakam keracunan, dan ikan-ikan kecil bisa mati karena air yang tercemar racun sampah.",
        },
        {
          text: "Bersihkan Sampah & Jaga Air",
          emoji: "🧹🐟",
          isCorrect: true,
          visualEffect: "from-sky-50 to-blue-50 border-blue-300 bg-blue-50",
          illustrations: ["🐟", "🐬", "🛶", "✨", "💧", "😊", "🐠"],
          image: "/images/sungai_bersih.png",
          outcomeTitle: "Sungai Bersih dan Indah! 🌟",
          outcomeDesc:
            "Aliran air mengalir lancar, bebas dari banjir, pesut mahakam melompat gembira, dan ikan-ikan berenang sehat di air sungai yang jernih.",
        },
      ],
    },
  ];

  const handleSelectScenario = (index: number) => {
    playSound("pop");
    setActiveScenarioIdx(index);
    setSelectedChoiceIdx(null);
    setHasReflected(false);
    speakIndonesian(scenarios[index].question);
  };

  const handleSelectChoice = (choiceIdx: number) => {
    const scenario = scenarios[activeScenarioIdx!];
    const choice = scenario.choices[choiceIdx];
    setSelectedChoiceIdx(choiceIdx);

    if (choice.isCorrect) {
      playSound("success");
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      speakIndonesian(
        `Hebat! ${choice.outcomeTitle}. ${choice.outcomeDesc}. Sekarang mari berjanji untuk menyayangi bumi.`,
      );
    } else {
      playSound("error");
      speakIndonesian(
        `Oh tidak. ${choice.outcomeTitle}. ${choice.outcomeDesc}. Coba pilih tindakan yang baik ya.`,
      );
    }
  };

  const handleReflect = async () => {
    playSound("success");
    const scenario = scenarios[activeScenarioIdx!];
    await completeStep(scenario.id, 2);
    setHasReflected(true);
    speakIndonesian(
      "Terima kasih sudah berjanji! Kamu anak hebat pelindung lingkungan. Dua bintang ditambahkan!",
    );
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-md p-4 rounded-3xl border-3 border-emerald-100/85 shadow-sm">
        {activeScenarioIdx === null ? (
          <Link
            to="/"
            onClick={() => playSound("click")}
            className="p-3 bg-white rounded-2xl border-2 border-emerald-100 hover:bg-emerald-50 transition text-slate-700 shrink-0"
          >
            <ChevronLeft size={24} />
          </Link>
        ) : (
          <button
            onClick={() => {
              playSound("click");
              setActiveScenarioIdx(null);
            }}
            className="p-3 bg-white rounded-2xl border-2 border-emerald-100 hover:bg-emerald-50 transition text-slate-700 cursor-pointer shrink-0"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <div>
          <h2 className="text-3xl font-extrabold text-emerald-800">Internalisasi Nilai Eco</h2>
          <p className="text-slate-600 font-bold text-sm">
            Pelajari hubungan sebab-akibat perilaku manusia terhadap kelestarian alam.
          </p>
        </div>
      </div>

      {activeScenarioIdx === null ? (
        /* Scenario Selection Screen */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map((sc, idx) => {
            const Icon = sc.icon;
            const isCompleted = completedSteps.includes(sc.id);
            return (
              <motion.div
                key={sc.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.6, delay: idx * 0.1 }}
                onClick={() => handleSelectScenario(idx)}
                className="bg-white rounded-3xl p-6 border-4 border-emerald-100 text-center cursor-pointer shadow-playful btn-bouncy hover:border-emerald-400 hover:translate-y-[-4px] transition-all flex flex-col items-center justify-between min-h-[220px]"
              >
                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                  <Icon size={48} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-2xl text-emerald-950">{sc.title}</h3>
                  <p className="text-slate-500 font-semibold text-sm">
                    Simulasi interaktif pilihan anak
                  </p>
                </div>
                <div className="w-full mt-4">
                  {isCompleted ? (
                    <span className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 font-bold px-4 py-1.5 rounded-full text-sm">
                      <span>Lengkap</span>
                      <CheckCircle2 size={16} fill="currentColor" className="text-emerald-100" />
                    </span>
                  ) : (
                    <span className="inline-block bg-amber-500 text-white font-bold px-4 py-1.5 rounded-full text-sm shadow-sm">
                      Mulai Simulasi ⭐
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Active Simulation Sandbox Screen */
        <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-emerald-300 shadow-playful space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-emerald-900">
              {scenarios[activeScenarioIdx].title}
            </h3>
            <p className="text-slate-600 font-extrabold text-lg bg-emerald-50 px-4 py-2.5 rounded-2xl border-2 border-emerald-100">
              💡 {scenarios[activeScenarioIdx].question}
            </p>
          </div>

          {/* Action Choice Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios[activeScenarioIdx].choices.map((choice, cIdx) => (
              <button
                key={choice.text}
                onClick={() => handleSelectChoice(cIdx)}
                className={`py-4 px-6 rounded-2xl text-left border-3 flex items-center justify-between font-extrabold text-lg transition-all cursor-pointer ${
                  selectedChoiceIdx === cIdx
                    ? choice.isCorrect
                      ? "border-emerald-500 bg-emerald-100 text-emerald-950 scale-[1.02] shadow-sm"
                      : "border-rose-500 bg-rose-100 text-rose-950 scale-[1.02] shadow-sm"
                    : "border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200"
                }`}
              >
                <span>{choice.text}</span>
                <span className="text-3xl ml-3 shrink-0">{choice.emoji}</span>
              </button>
            ))}
          </div>

          {/* Cause and Effect Sandbox Visualizer */}
          <AnimatePresence mode="wait">
            {selectedChoiceIdx !== null && (
              <motion.div
                key={selectedChoiceIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-2xl p-6 border-3 bg-gradient-to-r ${scenarios[activeScenarioIdx].choices[selectedChoiceIdx].visualEffect} space-y-4`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-2xl font-black text-slate-900">
                    {scenarios[activeScenarioIdx].choices[selectedChoiceIdx].outcomeTitle}
                  </h4>
                  {scenarios[activeScenarioIdx].choices[selectedChoiceIdx].isCorrect && (
                    <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Benar!
                    </span>
                  )}
                </div>

                {/* Simulated Eco System Scene */}
                <OutcomeVisualizer
                  image={scenarios[activeScenarioIdx].choices[selectedChoiceIdx].image}
                  illustrations={
                    scenarios[activeScenarioIdx].choices[selectedChoiceIdx].illustrations
                  }
                  alt={scenarios[activeScenarioIdx].choices[selectedChoiceIdx].outcomeTitle}
                />

                <p className="font-semibold text-slate-700 text-base leading-relaxed">
                  {scenarios[activeScenarioIdx].choices[selectedChoiceIdx].outcomeDesc}
                </p>

                {/* Reflection Commitment Section */}
                {scenarios[activeScenarioIdx].choices[selectedChoiceIdx].isCorrect && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="border-t border-emerald-200 pt-4 mt-4 space-y-4 text-center"
                  >
                    <h5 className="font-extrabold text-lg text-emerald-950 flex items-center justify-center gap-1.5">
                      <Heart size={20} className="fill-rose-500 text-rose-500" />
                      <span>Maukah kamu berjanji menjaga kelestarian lingkungan?</span>
                    </h5>

                    {!hasReflected ? (
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={handleReflect}
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-extrabold shadow-playful-primary btn-bouncy transition cursor-pointer"
                        >
                          👍 Ya, Saya Berjanji! (+2 ⭐)
                        </button>
                      </div>
                    ) : (
                      <div className="bg-emerald-100 text-emerald-800 font-extrabold px-4 py-2.5 rounded-xl border border-emerald-200 max-w-sm mx-auto flex items-center justify-center space-x-2">
                        <span>Luar biasa! Janjimu tersimpan! ❤️</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                playSound("click");
                setActiveScenarioIdx(null);
              }}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              Kembali Ke Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
