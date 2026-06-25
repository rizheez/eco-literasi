import React, { useState, useEffect } from 'react';
import { useProgressStore } from '../store/useProgressStore';
import { playSound, speakIndonesian } from '../utils/audio';
import { ChevronLeft, RotateCcw, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

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

export const AksiKreasi: React.FC = () => {
  const { completeStep } = useProgressStore();
  const [activeTab, setActiveTab] = useState<'wordbuilder' | 'memory'>('wordbuilder');

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
    
    // Scramble letters
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

    // Remove from scrambled list by index to handle duplicate letters
    const newScrambled = [...scrambledLetters];
    newScrambled.splice(index, 1);
    setScrambledLetters(newScrambled);

    const targetWord = wordList[currentWordIdx].word;
    
    // Check spelling once all letters selected
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
        // Reset after short delay
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

  useEffect(() => {
    if (activeTab === 'memory') {
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
        // Matched!
        playSound('success');
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);

          // Check win
          if (matchedCards.every(c => c.isMatched)) {
            setMemoryGameWon(true);
            completeStep('aksi_puzzle', 2);
            confetti({ particleCount: 70, spread: 60 });
            speakIndonesian("Luar biasa! Kamu berhasil memasangkan semua gambar alam. Dapat dua bintang!");
          }
        }, 600);
      } else {
        // Not matched
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
      <div className="flex items-center space-x-3">
        <Link to="/" onClick={() => playSound('click')} className="p-3 bg-white rounded-2xl border-2 border-emerald-100 hover:bg-emerald-50 transition text-slate-700">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-emerald-800">Aksi & Kreasi Digital</h2>
          <p className="text-slate-600 font-bold text-sm">Gunakan bahasamu untuk melestarikan dan mengenal ekosistem Dayak.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 bg-emerald-100/50 p-2 rounded-2xl border-2 border-emerald-100">
        <button
          onClick={() => { playSound('pop'); setActiveTab('wordbuilder'); }}
          className={`flex-1 py-3 font-extrabold text-lg rounded-xl transition cursor-pointer ${
            activeTab === 'wordbuilder'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-emerald-800 hover:bg-white/50'
          }`}
        >
          🔠 Susun Huruf
        </button>
        <button
          onClick={() => { playSound('pop'); setActiveTab('memory'); }}
          className={`flex-1 py-3 font-extrabold text-lg rounded-xl transition cursor-pointer ${
            activeTab === 'memory'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-emerald-800 hover:bg-white/50'
          }`}
        >
          🧠 Memori Alam
        </button>
      </div>

      {activeTab === 'wordbuilder' ? (
        /* Word Builder Sandbox */
        <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-rose-300 shadow-playful space-y-6 flex flex-col justify-between">
          <div className="text-center space-y-2 relative">
            <h3 className="text-2xl font-black text-rose-900">Spelling Game: Susun Huruf</h3>
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

          {/* Win / Navigation Area */}
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
        </div>
      ) : (
        /* Memory Game Sandbox */
        <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-blue-300 shadow-playful space-y-6 flex flex-col justify-between">
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
                  className={`w-24 h-24 rounded-2xl border-3 flex items-center justify-center text-4xl shadow-playful transition-all cursor-pointer ${
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

          {/* Win Box */}
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
        </div>
      )}
    </div>
  );
};
