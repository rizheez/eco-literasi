import React, { useState, useEffect } from 'react';
import { useProgressStore } from '../store/useProgressStore';
import { playSound, speakIndonesian } from '../utils/audio';
import { ChevronLeft, RotateCcw, HelpCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

// Word Builder Config
interface WordItem {
  word: string;
  emoji: string;
  clue: string;
  image?: string;
}

// Memory Game Config
interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Sebab Akibat Config
interface SebabAkibatPair {
  id: number;
  sebabText: string;
  sebabEmoji: string;
  akibatText: string;
  akibatEmoji: string;
  explanation: string;
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

const sebabAkibatData: SebabAkibatPair[] = [
  {
    id: 1,
    sebabText: 'Menebang liar & membakar hutan 🪓🔥',
    sebabEmoji: '🪓',
    akibatText: 'Banjir bandang & satwa sedih ⛈️😢',
    akibatEmoji: '⛈️',
    explanation: 'Pohon yang ditebang dan dibakar membuat tanah gundul, memicu banjir bandang, dan merusak tempat tinggal satwa liar.'
  },
  {
    id: 2,
    sebabText: 'Menanam bibit pohon & merawat hutan 🌱🌳',
    sebabEmoji: '🌱',
    akibatText: 'Hutan rimbun & udara sejuk segar 🌳✨',
    akibatEmoji: '🌳',
    explanation: 'Menanam bibit pohon membantu menghijaukan hutan kembali sehingga menghasilkan udara bersih dan mencegah banjir.'
  },
  {
    id: 3,
    sebabText: 'Membuang sampah plastik ke sungai 🥤🗑️',
    sebabEmoji: '🥤',
    akibatText: 'Ikan mati & air beracun kotor 💀🤢',
    akibatEmoji: '💀',
    explanation: 'Sampah plastik mencemari air sungai, membuat pesut mahakam sedih, dan merusak ekosistem sungai.'
  },
  {
    id: 4,
    sebabText: 'Membersihkan sungai dari sampah plastik 🧹🐟',
    sebabEmoji: '🧹',
    akibatText: 'Air jernih & pesut melompat gembira 🐬🌊',
    akibatEmoji: '🐬',
    explanation: 'Sungai yang bersih membuat pesut mahakam dan ikan-ikan hidup sehat serta aliran air mengalir lancar.'
  }
];

export const AksiKreasi: React.FC = () => {
  const { completedSteps, completeStep } = useProgressStore();
  const [activeTab, setActiveTab] = useState<'wordbuilder' | 'sebab_akibat' | 'puzzle' | 'memory'>('wordbuilder');

  // Word Builder State
  const wordList: WordItem[] = [
    { word: 'LAMIN', emoji: '🏠', clue: 'Rumah Adat Dayak yang panjang', image: '/images/rumah_lamin.png' },
    { word: 'SAPE', emoji: '🎸', clue: 'Alat musik tradisional Dayak', image: '/images/musik_sape.png' },
    { word: 'HUTAN', emoji: '🌳', clue: 'Tempat tumbuhnya banyak pohon', image: '/images/hutan_hujan.png' },
    { word: 'SUNGAI', emoji: '🐟', clue: 'Aliran air bersih tempat pesut hidup', image: '/images/sungai_mahakam.png' },
    { word: 'ENGGANG', emoji: '🦜', clue: 'Burung suci lambang persatuan', image: '/images/burung_enggang.png' }
  ];
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [wordGameWon, setWordGameWon] = useState(false);

  // Sebab Akibat State
  const [selectedSebab, setSelectedSebab] = useState<number | null>(null);
  const [selectedAkibat, setSelectedAkibat] = useState<number | null>(null);
  const [sebabAkibatMatches, setSebabAkibatMatches] = useState<number[]>([]); // matched IDs
  const [sebabAkibatWon, setSebabAkibatWon] = useState(false);
  const [shuffledSebab, setShuffledSebab] = useState<SebabAkibatPair[]>([]);
  const [shuffledAkibat, setShuffledAkibat] = useState<SebabAkibatPair[]>([]);

  // Puzzle State
  const [puzzleBoard, setPuzzleBoard] = useState<number[]>([0, 1, 2, 3]);
  const [selectedPuzzleTile, setSelectedPuzzleTile] = useState<number | null>(null);
  const [puzzleWon, setPuzzleWon] = useState(false);
  const [puzzleImage, setPuzzleImage] = useState('/images/burung_enggang.png');

  // Memory Game State
  const memoryIcons = ['🌳', '🐟', '🦜', '🏠', '🎸', '🐬'];
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryGameWon, setMemoryGameWon] = useState(false);

  // Initialize Word Builder
  const initWordBuilder = (index: number) => {
    const item = wordList[index];
    setSelectedLetters([]);
    setWordGameWon(false);
    
    const letters = item.word.split('');
    const scrambled = [...letters].sort(() => 0.5 - Math.random());
    setScrambledLetters(scrambled);
    
    speakIndonesian(`Susun kata: ${item.word}. Petunjuk: ${item.clue}`);
  };

  useEffect(() => {
    initWordBuilder(0);
  }, []);

  const handleLetterSelect = (letter: string, index: number) => {
    playSound('click');
    const newSelected = [...selectedLetters, letter];
    setSelectedLetters(newSelected);

    const newScrambled = [...scrambledLetters];
    newScrambled.splice(index, 1);
    setScrambledLetters(newScrambled);

    const targetWord = wordList[currentWordIdx].word;
    
    if (newSelected.length === targetWord.length) {
      const spelled = newSelected.join('');
      if (spelled === targetWord) {
        playSound('success');
        confetti({ particleCount: 60, spread: 50 });
        setWordGameWon(true);
        completeStep('aksi_wordbuilder', 2);
        speakIndonesian(`Benar! Kamu mengeja ${targetWord} dengan tepat. Dapat dua bintang!`);
      } else {
        playSound('error');
        speakIndonesian("Ejaannya belum pas. Ayo coba lagi!");
        setTimeout(() => {
          setSelectedLetters([]);
          setScrambledLetters(targetWord.split('').sort(() => 0.5 - Math.random()));
        }, 1500);
      }
    }
  };

  const handleResetWordBuilder = () => {
    playSound('pop');
    initWordBuilder(currentWordIdx);
  };

  const handleNextWord = () => {
    playSound('click');
    const nextIdx = (currentWordIdx + 1) % wordList.length;
    setCurrentWordIdx(nextIdx);
    initWordBuilder(nextIdx);
  };

  // Initialize Sebab-Akibat Game
  const initSebabAkibat = () => {
    playSound('pop');
    setSelectedSebab(null);
    setSelectedAkibat(null);
    setSebabAkibatMatches([]);
    setSebabAkibatWon(false);

    const shuffledS = [...sebabAkibatData].sort(() => 0.5 - Math.random());
    const shuffledA = [...sebabAkibatData].sort(() => 0.5 - Math.random());
    setShuffledSebab(shuffledS);
    setShuffledAkibat(shuffledA);

    speakIndonesian("Mari hubungkan tindakan dengan dampaknya terhadap alam.");
  };

  // Sebab-Akibat Matching Logic
  const handleSebabClick = (id: number) => {
    playSound('click');
    setSelectedSebab(id);
    if (selectedAkibat !== null) {
      checkSebabAkibatMatch(id, selectedAkibat);
    }
  };

  const handleAkibatClick = (id: number) => {
    playSound('click');
    setSelectedAkibat(id);
    if (selectedSebab !== null) {
      checkSebabAkibatMatch(selectedSebab, id);
    }
  };

  const checkSebabAkibatMatch = (sebabId: number, akibatId: number) => {
    if (sebabId === akibatId) {
      playSound('success');
      const newMatches = [...sebabAkibatMatches, sebabId];
      setSebabAkibatMatches(newMatches);
      setSelectedSebab(null);
      setSelectedAkibat(null);

      const pair = sebabAkibatData.find(p => p.id === sebabId);
      if (pair) {
        speakIndonesian(`Betul! ${pair.explanation}`);
      }

      if (newMatches.length === sebabAkibatData.length) {
        setSebabAkibatWon(true);
        completeStep('aksi_sebab_akibat', 2);
        confetti({ particleCount: 70, spread: 60 });
        speakIndonesian("Hebat! Kamu berhasil mencocokkan semua sebab akibat dengan benar. Dapat dua bintang!");
      }
    } else {
      playSound('error');
      setSelectedSebab(null);
      setSelectedAkibat(null);
      speakIndonesian("Akibatnya belum cocok dengan tindakan ini. Ayo cari lagi!");
    }
  };

  // Initialize Puzzle
  const initPuzzle = () => {
    playSound('pop');
    setSelectedPuzzleTile(null);
    setPuzzleWon(false);

    let shuffled = [0, 1, 2, 3];
    // Keep shuffling until it's not solved
    do {
      shuffled = [...shuffled].sort(() => 0.5 - Math.random());
    } while (shuffled[0] === 0 && shuffled[1] === 1 && shuffled[2] === 2 && shuffled[3] === 3);

    setPuzzleBoard(shuffled);

    const images = ['/images/burung_enggang.png', '/images/rumah_lamin.png', '/images/hutan_hujan.png'];
    const randomImg = images[Math.floor(Math.random() * images.length)];
    setPuzzleImage(randomImg);

    speakIndonesian("Ayo susun puzzle alam Kalimantan. Ketuk dua pecahan gambar untuk menukar posisinya.");
  };

  // Puzzle Tile Click
  const handlePuzzleTileClick = (index: number) => {
    if (puzzleWon) return;
    playSound('click');
    if (selectedPuzzleTile === null) {
      setSelectedPuzzleTile(index);
    } else {
      const newBoard = [...puzzleBoard];
      const temp = newBoard[selectedPuzzleTile];
      newBoard[selectedPuzzleTile] = newBoard[index];
      newBoard[index] = temp;
      
      setPuzzleBoard(newBoard);
      setSelectedPuzzleTile(null);
      
      if (newBoard[0] === 0 && newBoard[1] === 1 && newBoard[2] === 2 && newBoard[3] === 3) {
        playSound('success');
        setPuzzleWon(true);
        completeStep('aksi_puzzle', 2);
        confetti({ particleCount: 80, spread: 60 });
        speakIndonesian("Luar biasa! Gambar lingkungan berhasil terkumpul dengan rapi. Dapat dua bintang!");
      }
    }
  };

  // Initialize Memory Game
  const initMemoryGame = () => {
    playSound('pop');
    const shuffledList = [...memoryIcons, ...memoryIcons]
      .sort(() => 0.5 - Math.random())
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(shuffledList);
    setFlippedIndices([]);
    setMemoryGameWon(false);
    speakIndonesian("Mari bermain memori alam. Temukan pasangan gambar yang sama.");
  };

  // Handle Tab Switch Initializers
  useEffect(() => {
    if (activeTab === 'sebab_akibat') {
      initSebabAkibat();
    } else if (activeTab === 'puzzle') {
      initPuzzle();
    } else if (activeTab === 'memory') {
      initMemoryGame();
    }
  }, [activeTab]);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].isMatched || cards[index].isFlipped) return;

    playSound('click');
    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        playSound('success');
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);

          if (matchedCards.every(c => c.isMatched)) {
            setMemoryGameWon(true);
            completeStep('aksi_memory', 2);
            confetti({ particleCount: 70, spread: 60 });
            speakIndonesian("Luar biasa! Kamu berhasil memasangkan semua gambar alam. Dapat dua bintang!");
          }
        }, 600);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1200);
      }
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-md p-4 rounded-3xl border-3 border-emerald-100/85 shadow-sm">
        <Link to="/" onClick={() => { playSound('click'); window.speechSynthesis.cancel(); }} className="p-3 bg-white rounded-2xl border-2 border-emerald-100 hover:bg-emerald-50 transition text-slate-700 shrink-0">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-emerald-800">Aksi & Kreasi Digital</h2>
          <p className="text-slate-600 font-bold text-sm">Gunakan bahasamu dan aksi cerdasmu untuk melestarikan alam Dayak!</p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-emerald-100/50 p-2 rounded-2xl border-2 border-emerald-100">
        <button
          onClick={() => { playSound('pop'); window.speechSynthesis.cancel(); setActiveTab('wordbuilder'); }}
          className={`py-3 font-extrabold text-sm md:text-base rounded-xl transition cursor-pointer ${
            activeTab === 'wordbuilder' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-800 hover:bg-white/50'
          }`}
        >
          🔠 Susun Huruf
        </button>
        <button
          onClick={() => { playSound('pop'); window.speechSynthesis.cancel(); setActiveTab('sebab_akibat'); }}
          className={`py-3 font-extrabold text-sm md:text-base rounded-xl transition cursor-pointer ${
            activeTab === 'sebab_akibat' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-800 hover:bg-white/50'
          }`}
        >
          🔄 Sebab-Akibat
        </button>
        <button
          onClick={() => { playSound('pop'); window.speechSynthesis.cancel(); setActiveTab('puzzle'); }}
          className={`py-3 font-extrabold text-sm md:text-base rounded-xl transition cursor-pointer ${
            activeTab === 'puzzle' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-800 hover:bg-white/50'
          }`}
        >
          🧩 Puzzle Alam
        </button>
        <button
          onClick={() => { playSound('pop'); window.speechSynthesis.cancel(); setActiveTab('memory'); }}
          className={`py-3 font-extrabold text-sm md:text-base rounded-xl transition cursor-pointer ${
            activeTab === 'memory' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-800 hover:bg-white/50'
          }`}
        >
          🧠 Memori Alam
        </button>
      </div>

      {/* View Switcher */}
      <AnimatePresence mode="wait">
        {activeTab === 'wordbuilder' && (
          <motion.div
            key="wordbuilder"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-3xl p-6 md:p-8 border-4 border-rose-300 shadow-playful space-y-6 flex flex-col justify-between"
          >
            <div className="text-center space-y-2 relative">
              <h3 className="text-2xl font-black text-rose-900 flex items-center justify-between">
                <span>🔠 Susun Huruf: Kosakata Dayak</span>
                {completedSteps.includes('aksi_wordbuilder') && (
                  <span className="text-emerald-600 font-black text-xs bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-200">
                    Lulus ✅
                  </span>
                )}
              </h3>
              <div className="bg-rose-50 border-2 border-rose-100 rounded-2xl p-4 flex items-center justify-center gap-3">
                <ImageWithFallback 
                  src={wordList[currentWordIdx].image} 
                  alt={wordList[currentWordIdx].word} 
                  fallback={wordList[currentWordIdx].emoji}
                  className="w-16 h-16 object-contain rounded-xl animate-float flex items-center justify-center text-4xl" 
                />
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-wider text-rose-800">Petunjuk Gambar</p>
                  <p className="font-extrabold text-slate-700 text-sm leading-tight">{wordList[currentWordIdx].clue}</p>
                </div>
              </div>
            </div>

            {/* Letter Slots */}
            <div className="flex justify-center space-x-3 py-6">
              {wordList[currentWordIdx].word.split('').map((_, index) => {
                const selectedChar = selectedLetters[index];
                return (
                  <div
                    key={index}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl border-3 border-dashed font-black text-2xl md:text-3xl flex items-center justify-center transition-all ${
                      selectedChar 
                        ? 'border-rose-500 bg-rose-50 text-rose-900 scale-105' 
                        : 'border-slate-300 bg-slate-50 text-slate-300'
                    }`}
                  >
                    {selectedChar || ''}
                  </div>
                );
              })}
            </div>

            {/* Scrambled Bank */}
            {!wordGameWon && (
              <div className="flex flex-wrap justify-center gap-3 py-4">
                {scrambledLetters.map((letter, index) => (
                  <button
                    key={index}
                    onClick={() => handleLetterSelect(letter, index)}
                    className="w-14 h-14 rounded-2xl bg-white border-3 border-rose-100 hover:border-rose-400 font-black text-2xl text-slate-700 shadow-playful hover:translate-y-[-2px] active:translate-y-[2px] transition cursor-pointer"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            )}

            {wordGameWon ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-center space-y-4">
                <h4 className="font-extrabold text-2xl text-emerald-800">Hebat! Ejaan Benar! 🎉</h4>
                <p className="text-emerald-700 font-bold text-sm">Kamu berhasil menata huruf dengan tepat (+2 ⭐ Bintang)</p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={handleNextWord}
                    className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-playful-rose transition cursor-pointer"
                  >
                    Kata Selanjutnya ➡️
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleResetWordBuilder}
                  className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <RotateCcw size={18} />
                  <span>Ulangi</span>
                </button>
                <button
                  onClick={() => { playSound('click'); speakIndonesian(`Kata ini berbunyi: ${wordList[currentWordIdx].word}`); }}
                  className="w-2/3 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-playful-rose transition cursor-pointer"
                >
                  🔊 Dengarkan Bunyi Kata
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'sebab_akibat' && (
          <motion.div
            key="sebab_akibat"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-playful space-y-6"
          >
            <div>
              <h3 className="text-2xl font-black text-amber-900 flex items-center justify-between">
                <span>🔄 Game Hubungan Sebab-Akibat</span>
                {completedSteps.includes('aksi_sebab_akibat') && (
                  <span className="text-emerald-600 font-black text-xs bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-200">
                    Lulus ✅
                  </span>
                )}
              </h3>
              <p className="text-slate-600 font-bold text-sm mt-1">Ketuk satu tindakan di kiri, lalu ketuk dampaknya terhadap alam di kanan!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sebab (Tindakan) Column */}
              <div className="space-y-3">
                <p className="text-xs font-black uppercase text-amber-800 tracking-wider text-center">Tindakan Kita (Sebab)</p>
                {shuffledSebab.map((item) => {
                  const isMatched = sebabAkibatMatches.includes(item.id);
                  const isSelected = selectedSebab === item.id;
                  return (
                    <button
                      key={item.id}
                      disabled={isMatched}
                      onClick={() => handleSebabClick(item.id)}
                      className={`w-full p-4 rounded-xl text-left border-3 transition-all flex items-center justify-between cursor-pointer text-base ${
                        isMatched
                          ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                          : isSelected
                          ? 'bg-amber-100 border-amber-500 font-black scale-[1.02]'
                          : 'bg-white border-slate-100 text-slate-700 hover:border-amber-400'
                      }`}
                    >
                      <span>{item.sebabText}</span>
                      <span className="text-2xl shrink-0 ml-2">{item.sebabEmoji}</span>
                    </button>
                  );
                })}
              </div>

              {/* Akibat (Dampak) Column */}
              <div className="space-y-3">
                <p className="text-xs font-black uppercase text-amber-800 tracking-wider text-center">Dampak ke Alam (Akibat)</p>
                {shuffledAkibat.map((item) => {
                  const isMatched = sebabAkibatMatches.includes(item.id);
                  const isSelected = selectedAkibat === item.id;
                  return (
                    <button
                      key={item.id}
                      disabled={isMatched}
                      onClick={() => handleAkibatClick(item.id)}
                      className={`w-full p-4 rounded-xl text-left border-3 transition-all flex items-center justify-between cursor-pointer text-base ${
                        isMatched
                          ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                          : isSelected
                          ? 'bg-amber-100 border-amber-500 font-black scale-[1.02]'
                          : 'bg-white border-slate-100 text-slate-700 hover:border-amber-400'
                      }`}
                    >
                      <span>{item.akibatText}</span>
                      <span className="text-2xl shrink-0 ml-2">{item.akibatEmoji}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {sebabAkibatWon ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-center space-y-3">
                <h4 className="font-extrabold text-xl text-emerald-800">Hebat Sekali! Semua Selesai! 🎉</h4>
                <p className="text-emerald-700 font-bold text-sm">Kamu memahami sebab akibat aksi manusia terhadap alam (+2 ⭐ Bintang)</p>
                <button
                  onClick={initSebabAkibat}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-playful-secondary hover:brightness-110 transition cursor-pointer"
                >
                  Main Lagi!
                </button>
              </div>
            ) : (
              <button
                onClick={initSebabAkibat}
                className="py-3 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-playful-secondary transition cursor-pointer"
              >
                Acak Ulang
              </button>
            )}
          </motion.div>
        )}

        {activeTab === 'puzzle' && (
          <motion.div
            key="puzzle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-3xl p-6 border-4 border-emerald-300 shadow-playful flex flex-col items-center space-y-6"
          >
            <div className="w-full text-center">
              <h3 className="text-2xl font-black text-emerald-950 flex items-center justify-between">
                <span>🧩 Puzzle Gambar Lingkungan</span>
                {completedSteps.includes('aksi_puzzle') && (
                  <span className="text-emerald-600 font-black text-xs bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-200">
                    Lulus ✅
                  </span>
                )}
              </h3>
              <p className="text-slate-600 font-bold text-sm mt-1">Ketuk satu kepingan puzzle, lalu ketuk kepingan lain untuk menukarnya!</p>
            </div>

            {/* Puzzle Board 2x2 */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-3 rounded-2xl border-4 border-slate-200 shadow-inner">
              {puzzleBoard.map((tileIndex, positionIndex) => {
                const bgX = (tileIndex % 2) * 100;
                const bgY = Math.floor(tileIndex / 2) * 100;
                const isSelected = selectedPuzzleTile === positionIndex;

                return (
                  <button
                    key={positionIndex}
                    onClick={() => handlePuzzleTileClick(positionIndex)}
                    style={{
                      backgroundImage: `url(${puzzleImage})`,
                      backgroundSize: '200% 200%',
                      backgroundPosition: `${bgX}% ${bgY}%`,
                    }}
                    className={`w-28 h-28 md:w-36 md:h-36 rounded-xl border-3 shadow-md relative transition-all active:scale-95 cursor-pointer ${
                      isSelected ? 'border-rose-500 scale-105 ring-4 ring-rose-200 z-10' : 'border-white hover:border-emerald-300'
                    }`}
                  >
                    <span className="absolute bottom-1 right-2 bg-slate-900/60 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      {tileIndex + 1}
                    </span>
                  </button>
                );
              })}
            </div>

            {puzzleWon ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-center space-y-3 w-full max-w-sm">
                <h4 className="font-extrabold text-xl text-emerald-800">Luar Biasa! Puzzle Selesai! 🧩</h4>
                <p className="text-emerald-700 font-bold text-sm">Gambar ekosistem alam Kalimantan berhasil tersusun (+2 ⭐ Bintang)</p>
                <button
                  onClick={initPuzzle}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-playful-primary transition cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                >
                  <RefreshCw size={18} />
                  <span>Main Lagi (Acak Gambar)</span>
                </button>
              </div>
            ) : (
              <button
                onClick={initPuzzle}
                className="py-3 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-playful-primary transition cursor-pointer"
              >
                Ganti Gambar & Acak Ulang
              </button>
            )}
          </motion.div>
        )}

        {activeTab === 'memory' && (
          <motion.div
            key="memory"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-3xl p-6 md:p-8 border-4 border-blue-300 shadow-playful space-y-6 flex flex-col justify-between"
          >
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black text-blue-900">Memory Match: Memori Alam</h3>
              <p className="text-slate-500 font-bold text-sm">Balikkan dan temukan 6 pasang gambar ekosistem alam Kalimantan!</p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-lg mx-auto py-4">
              {cards.map((card, index) => {
                const showContent = card.isFlipped || card.isMatched;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(index)}
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl border-3 flex items-center justify-center text-4xl shadow-playful transition-all cursor-pointer ${
                      card.isMatched
                        ? 'bg-emerald-50 border-emerald-400 opacity-60'
                        : showContent
                        ? 'bg-blue-50 border-blue-400 rotate-0 scale-105'
                        : 'bg-gradient-to-br from-blue-400 to-sky-400 border-white/60 hover:brightness-110'
                    }`}
                  >
                    {showContent ? (
                      card.emoji
                    ) : (
                      <HelpCircle size={32} className="text-white opacity-80" />
                    )}
                  </div>
                );
              })}
            </div>

            {memoryGameWon ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-center space-y-4">
                <h4 className="font-extrabold text-2xl text-emerald-800">Menakjubkan! Memori Tajam! 🌟</h4>
                <p className="text-emerald-700 font-bold text-sm">Semua gambar berhasil diselesaikan (+2 ⭐ Bintang)</p>
                <button
                  onClick={initMemoryGame}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-playful-blue transition cursor-pointer"
                >
                  Bermain Lagi!
                </button>
              </div>
            ) : (
              <button
                onClick={initMemoryGame}
                className="py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-playful-blue transition cursor-pointer w-full"
              >
                Ulangi Permainan
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

