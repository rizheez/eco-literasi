import React, { useState, useEffect, useRef } from 'react';
import { useProgressStore } from '../store/useProgressStore';
import { playSound, speakIndonesian } from '../utils/audio';
import { motion } from 'framer-motion';
import { ChevronLeft, Volume2, CheckCircle2, Mic, Play, Square } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VocabMatch {
  word: string;
  emoji: string;
  meaning: string;
  image?: string;
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

export const Konstruksi: React.FC = () => {
  const { completedSteps, completeStep } = useProgressStore();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); // word -> emoji
  const [gameWon, setGameWon] = useState(false);
  const [shuffledEmojis, setShuffledEmojis] = useState<string[]>([]);
  
  // Voice Recording State
  const [recordingWord, setRecordingWord] = useState('Enggang');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const vocabList: VocabMatch[] = [
    { word: 'Enggang', emoji: '🦜', meaning: 'Burung Enggang Kalimantan', image: '/images/burung_enggang.png' },
    { word: 'Lamin', emoji: '🏠', meaning: 'Rumah Adat Dayak', image: '/images/rumah_lamin.png' },
    { word: 'Hutan', emoji: '🌳', meaning: 'Hutan Hujan Tropis', image: '/images/hutan_hujan.png' },
    { word: 'Sungai', emoji: '🐟', meaning: 'Sungai Mahakam', image: '/images/sungai_mahakam.png' },
    { word: 'Sape', emoji: '🎸', meaning: 'Alat Musik Dayak', image: '/images/musik_sape.png' },
  ];

  // Pick 3 random vocabulary items for matching game
  const [activeVocab, setActiveVocab] = useState<VocabMatch[]>([]);

  const initGame = () => {
    playSound('pop');
    const shuffledList = [...vocabList].sort(() => 0.5 - Math.random());
    const selected = shuffledList.slice(0, 3);
    setActiveVocab(selected);
    
    const emojis = selected.map(item => item.emoji).sort(() => 0.5 - Math.random());
    setShuffledEmojis(emojis);
    
    setMatches({});
    setSelectedWord(null);
    setSelectedEmoji(null);
    setGameWon(false);
  };

  useEffect(() => {
    // Initialise on load
    const selected = [...vocabList].slice(0, 3);
    setActiveVocab(selected);
    setShuffledEmojis(selected.map(item => item.emoji).sort(() => 0.5 - Math.random()));
  }, []);

  const handleWordSelect = (word: string) => {
    playSound('click');
    setSelectedWord(word);
    speakIndonesian(word);
    
    // Check match if emoji already selected
    if (selectedEmoji) {
      checkMatch(word, selectedEmoji);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    playSound('click');
    setSelectedEmoji(emoji);
    
    // Check match if word already selected
    if (selectedWord) {
      checkMatch(selectedWord, emoji);
    }
  };

  const checkMatch = (word: string, emoji: string) => {
    const item = activeVocab.find(v => v.word === word);
    if (item && item.emoji === emoji) {
      // It's a match!
      playSound('success');
      const newMatches = { ...matches, [word]: emoji };
      setMatches(newMatches);
      setSelectedWord(null);
      setSelectedEmoji(null);

      // Check win condition
      if (Object.keys(newMatches).length === activeVocab.length) {
        setGameWon(true);
        completeStep('konstruksi_matching', 2);
        speakIndonesian("Hebat sekali! Semua kata sudah tercocokkan. Kamu dapat dua bintang!");
      }
    } else {
      // Not a match
      playSound('error');
      setSelectedWord(null);
      setSelectedEmoji(null);
      speakIndonesian("Coba lagi, pasangannya belum tepat!");
    }
  };

  // Voice recording logic
  const startRecording = async () => {
    playSound('click');
    setAudioUrl(null);
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        // Stop all track uses
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      speakIndonesian(`Katakan ${recordingWord}`);
    } catch (err) {
      console.error('Audio recording not supported or permitted:', err);
      alert('Izin mikrofon diperlukan untuk merekam suaramu.');
    }
  };

  const stopRecording = () => {
    playSound('pop');
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecordedAudio = () => {
    if (audioUrl) {
      playSound('pop');
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link to="/" onClick={() => playSound('click')} className="p-3 bg-white rounded-2xl border-2 border-emerald-100 hover:bg-emerald-50 transition text-slate-700">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-emerald-800 font-sans">Konstruksi Bahasa</h2>
          <p className="text-slate-600 font-bold text-sm">Ayo pasangkan gambar dengan katanya dan coba tirukan suaranya!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Game 1: Matching Panel */}
        <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-playful flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-2xl font-black text-amber-900 flex items-center justify-between">
              <span>🎮 Tebak & Cocokkan</span>
              {completedSteps.includes('konstruksi_matching') && (
                <span className="text-emerald-600 font-black text-sm bg-emerald-50 px-3 py-1 rounded-xl flex items-center gap-1 border border-emerald-200">
                  Lulus <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                </span>
              )}
            </h3>
            <p className="text-slate-600 font-bold text-sm mt-1">Ketuk kata, lalu ketuk gambar yang cocok!</p>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* Words list */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase text-amber-800 tracking-wider text-center">Kata</p>
              {activeVocab.map((item) => {
                const isMatched = !!matches[item.word];
                const isSelected = selectedWord === item.word;
                return (
                  <button
                    key={item.word}
                    disabled={isMatched}
                    onClick={() => handleWordSelect(item.word)}
                    className={`w-full py-4 px-3 rounded-2xl font-extrabold text-lg border-3 transition-all cursor-pointer ${
                      isMatched 
                        ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                        : isSelected
                        ? 'bg-amber-100 border-amber-500 text-amber-950 scale-105'
                        : 'bg-white border-amber-100 text-slate-700 hover:border-amber-400'
                    }`}
                  >
                    {item.word}
                  </button>
                );
              })}
            </div>

            {/* Emojis list */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase text-amber-800 tracking-wider text-center">Gambar</p>
              {shuffledEmojis.map((emoji) => {
                const isMatched = Object.values(matches).includes(emoji);
                const isSelected = selectedEmoji === emoji;
                return (
                  <button
                    key={emoji}
                    disabled={isMatched}
                    onClick={() => handleEmojiSelect(emoji)}
                    className={`w-full py-2.5 rounded-2xl border-3 text-4xl transition-all cursor-pointer ${
                      isMatched
                        ? 'bg-slate-50 border-slate-200 opacity-30 cursor-not-allowed'
                        : isSelected
                        ? 'bg-amber-100 border-amber-500 scale-110'
                        : 'bg-white border-amber-100 hover:border-amber-400'
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>

          {gameWon ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-center space-y-3"
            >
              <h4 className="font-extrabold text-xl text-emerald-800">Luar Biasa! Kamu Menang! 🎉</h4>
              <p className="text-emerald-700 font-bold text-sm">Kamu mencocokkan semua kata dengan benar (+2 ⭐ Bintang)</p>
              <button
                onClick={initGame}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-playful-secondary hover:brightness-110 transition cursor-pointer"
              >
                Main Lagi!
              </button>
            </motion.div>
          ) : (
            <button
              onClick={initGame}
              className="py-3 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-playful-secondary transition cursor-pointer"
            >
              Acak Ulang
            </button>
          )}
        </div>

        {/* Panel 2: Voice Practice / Pronunciation */}
        <div className="bg-white rounded-3xl p-6 border-4 border-blue-300 shadow-playful flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-2xl font-black text-blue-900 flex items-center justify-between">
              <span>🎙️ Latih Pengucapan</span>
              <span className="text-blue-600 font-black text-xs bg-blue-50 px-2 py-1 rounded-xl border border-blue-200">
                Offline Recorder
              </span>
            </h3>
            <p className="text-slate-600 font-bold text-sm mt-1">Pilih kosakata, dengarkan bunyinya, dan rekam suaramu!</p>
          </div>

          {/* Word Selector */}
          <div className="flex flex-wrap gap-2 justify-center">
            {vocabList.map((item) => (
              <button
                key={item.word}
                onClick={() => { playSound('pop'); setRecordingWord(item.word); speakIndonesian(item.word); setAudioUrl(null); }}
                className={`px-4 py-2.5 rounded-xl font-extrabold border-2 transition cursor-pointer ${
                  recordingWord === item.word
                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-100 hover:border-blue-200'
                }`}
              >
                <span className="mr-1.5">{item.emoji}</span>
                {item.word}
              </button>
            ))}
          </div>

          {/* Large Word display */}
          <div className="bg-blue-50/50 rounded-2xl p-6 border-2 border-blue-100 text-center space-y-3 flex-1 flex flex-col justify-center items-center">
            <ImageWithFallback 
              src={vocabList.find(v => v.word === recordingWord)?.image} 
              alt={recordingWord} 
              fallback={vocabList.find(v => v.word === recordingWord)?.emoji || '❓'}
              className="w-28 h-28 object-contain mx-auto animate-float rounded-2xl flex items-center justify-center text-7xl" 
            />
            <h4 className="text-4xl font-black text-blue-950 tracking-wider">
              {recordingWord}
            </h4>
            <p className="text-blue-600 font-bold text-sm">
              ({vocabList.find(v => v.word === recordingWord)?.meaning})
            </p>
            <button
              onClick={() => { playSound('click'); speakIndonesian(recordingWord); }}
              className="p-3 bg-white text-blue-500 border-2 border-blue-200 rounded-full hover:bg-blue-50 transition cursor-pointer"
              title="Dengarkan Suara"
            >
              <Volume2 size={24} />
            </button>
          </div>

          {/* Recorder Controls */}
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 flex items-center justify-around">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center space-x-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-2xl shadow-playful-rose transition cursor-pointer active:translate-y-[2px]"
              >
                <Mic size={20} />
                <span>Mulai Rekam</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-2xl shadow-playful transition cursor-pointer animate-pulse"
              >
                <Square size={20} />
                <span>Berhenti</span>
              </button>
            )}

            <button
              disabled={!audioUrl}
              onClick={playRecordedAudio}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-extrabold border-2 transition cursor-pointer ${
                audioUrl
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 shadow-playful-primary'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              <Play size={20} />
              <span>Putar Suaramu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
