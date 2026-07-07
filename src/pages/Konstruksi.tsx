import React, { useState, useEffect, useRef } from 'react';
import { useProgressStore } from '../store/useProgressStore';
import { playSound, speakIndonesian, cancelSpeech } from '../utils/audio';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Volume2, CheckCircle2, Mic, Play, Square, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { CustomDialog } from '../components/ui/CustomDialog';

interface VocabMatch {
  word: string;
  emoji: string;
  meaning: string;
  image?: string;
}

interface StoryItem {
  id: string;
  title: string;
  emoji: string;
  content: string;
  image?: string;
  question: string;
  choices: { text: string; isCorrect: boolean }[];
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

const storiesList: StoryItem[] = [
  {
    id: 'konstruksi_story_enggang',
    title: 'Burung Enggang yang Baik Hati',
    emoji: '🦜',
    image: '/images/burung_enggang.png',
    content: 'Di sebuah hutan yang rimbun di Kalimantan Timur, hiduplah seekor Burung Enggang bernama Cerdik. Suatu hari, Sungai Mahakam menjadi sangat kotor karena tumpukan sampah plastik. Cerdik terbang keliling hutan mengajak teman-temannya untuk bergotong royong membersihkan sungai. Akhirnya, sungai kembali jernih dan seluruh hewan hidup bahagia.',
    question: 'Siapa yang mengajak hewan-hewan bergotong royong membersihkan sungai?',
    choices: [
      { text: 'Enggang Cerdik 🦜', isCorrect: true },
      { text: 'Pemburu Hutan 🪓', isCorrect: false }
    ]
  },
  {
    id: 'konstruksi_story_pesut',
    title: 'Sahabat Pesut Mahakam',
    emoji: '🐬',
    image: '/images/pesut_mahakam.png',
    content: 'Di perairan Sungai Mahakam yang jernih, hiduplah sekeluarga Pesut Mahakam. Pesut adalah lumba-lumba air tawar yang sangat ramah. Mereka sering membantu nelayan yang tersesat di sungai. Pesut sangat sedih jika manusia membuang sampah ke sungai. Mari kita jaga kebersihan sungai agar pesut tetap sehat!',
    question: 'Di mana tempat tinggal Pesut Mahakam?',
    choices: [
      { text: 'Sungai Mahakam yang jernih 🌊', isCorrect: true },
      { text: 'Darat/Hutan gundul 🌳', isCorrect: false }
    ]
  },
  {
    id: 'konstruksi_story_orangutan',
    title: 'Pongo Orangutan yang Cerdas',
    emoji: '🦧',
    image: '/images/orangutan.png',
    content: 'Di puncak pohon hutan Kalimantan yang lebat, hiduplah seekor orangutan bernama Pongo. Pongo sangat suka makan buah hutan yang lezat dan manis. Suatu hari, Pongo melihat asap tebal dari kejauhan. Pongo segera memanggil burung enggang untuk terbang memperingatkan hewan lain dan warga desa agar memadamkan api. Berkat kecerdasan Pongo, hutan mereka selamat dari bahaya kebakaran.',
    question: 'Apa makanan kesukaan Pongo si Orangutan?',
    choices: [
      { text: 'Buah-buahan hutan yang lezat 🍌🍎', isCorrect: true },
      { text: 'Sampah plastik 🥤🗑️', isCorrect: false }
    ]
  },
  {
    id: 'konstruksi_story_petualangan_anak',
    title: 'Petualangan Menyelamatkan Hutan',
    emoji: '👦💚',
    image: '/images/petualangan_anak.png',
    content: 'Bersama-sama, mereka berdua melewati jalan yang panas dan berdebu akibat penebangan hutan secara liar. Dengan tekad yang kuat, anak Dayak dan sahabat hijaunya berjanji untuk menanam kembali pohon-pohon agar hutan mereka menjadi rindang dan sejuk kembali.',
    question: 'Mengapa jalan yang mereka lewati terasa panas dan berdebu?',
    choices: [
      { text: 'Karena hutan gundul ditebang liar 🪓🔥', isCorrect: true },
      { text: 'Karena hari sudah sore ☀️', isCorrect: false }
    ]
  }
];

export const Konstruksi: React.FC = () => {
  const { width, height } = useWindowSize();
  const { completedSteps, completeStep } = useProgressStore();
  const [activeTab, setActiveTab] = useState<'matching' | 'pronounce' | 'story'>('matching');
  const [showMicErrorAlert, setShowMicErrorAlert] = useState(false);
  const [micErrorMessage, setMicErrorMessage] = useState('');
  // Game 1: Matching State
  useEffect(() => {
    playSound('pop');
    speakIndonesian("Pilih aktivitas untuk meningkatkan kosa kata dan keterampilan bicaramu!");
    return () => {
      cancelSpeech();
    };
  }, []);

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); // word -> emoji
  const [gameWon, setGameWon] = useState(false);
  const [shuffledEmojis, setShuffledEmojis] = useState<string[]>([]);

  // Game 2: Pronunciation State
  const [recordingWord, setRecordingWord] = useState('Enggang');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Game 3: Storytelling State
  const [selectedStoryIdx, setSelectedStoryIdx] = useState(0);
  const [storyAnswered, setStoryAnswered] = useState<boolean | null>(null);
  const [storyAnswerCorrect, setStoryAnswerCorrect] = useState(false);
  const [storyIsRecording, setStoryIsRecording] = useState(false);
  const [storyAudioUrl, setStoryAudioUrl] = useState<string | null>(null);
  const [storyCompleted, setStoryCompleted] = useState(false);
  const storyMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const storyAudioChunksRef = useRef<Blob[]>([]);

  const vocabList: VocabMatch[] = [
    { word: 'Enggang', emoji: '🦜', meaning: 'Burung Enggang Kalimantan', image: '/images/burung_enggang.png' },
    { word: 'Lamin', emoji: '🏠', meaning: 'Rumah Adat Dayak', image: '/images/rumah_lamin.png' },
    { word: 'Hutan', emoji: '🌳', meaning: 'Hutan Hujan Tropis', image: '/images/hutan_hujan.png' },
    { word: 'Sungai', emoji: '🌊', meaning: 'Sungai Mahakam', image: '/images/sungai_mahakam.png' },
    { word: 'Sape', emoji: '🎸', meaning: 'Alat Musik Dayak', image: '/images/musik_sape.png' },
    { word: 'Pesut', emoji: '🐬', meaning: 'Pesut Mahakam', image: '/images/pesut_mahakam.png' },
    { word: 'Orangutan', emoji: '🦧', meaning: 'Orangutan Kalimantan', image: '/images/orangutan.png' },
  ];

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

    return () => {
      cancelSpeech();
    };
  }, []);

  const handleWordSelect = (word: string) => {
    playSound('click');
    setSelectedWord(word);
    speakIndonesian(word);

    if (selectedEmoji) {
      checkMatch(word, selectedEmoji);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    playSound('click');
    setSelectedEmoji(emoji);

    if (selectedWord) {
      checkMatch(selectedWord, emoji);
    }
  };

  const checkMatch = (word: string, emoji: string) => {
    const item = activeVocab.find(v => v.word === word);
    if (item && item.emoji === emoji) {
      playSound('success');
      const newMatches = { ...matches, [word]: emoji };
      setMatches(newMatches);
      setSelectedWord(null);
      setSelectedEmoji(null);

      if (Object.keys(newMatches).length === activeVocab.length) {
        setGameWon(true);
        completeStep('konstruksi_matching', 2);
        confetti({ particleCount: 60, spread: 50 });
        speakIndonesian("Hebat sekali! Semua kata sudah tercocokkan. Kamu dapat dua bintang!");
      }
    } else {
      playSound('error');
      setSelectedWord(null);
      setSelectedEmoji(null);
      speakIndonesian("Coba lagi, pasangannya belum tepat!");
    }
  };

  // Voice recording logic (Pronunciation)
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
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      speakIndonesian(`Katakan ${recordingWord}`);
    } catch (err) {
      console.error('Audio recording not supported or permitted:', err);
      setMicErrorMessage('Izin mikrofon diperlukan untuk merekam suaramu. Pastikan kamu memberikan izin mikrofon di browsermu ya!');
      setShowMicErrorAlert(true);
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

  // Storytelling Logic
  const handleSelectStory = (idx: number) => {
    playSound('pop');
    cancelSpeech();
    setSelectedStoryIdx(idx);
    setStoryAnswered(null);
    setStoryAnswerCorrect(false);
    setStoryAudioUrl(null);
    setStoryIsRecording(false);
    setStoryCompleted(false);
    speakIndonesian(storiesList[idx].title);
  };

  const handleListenStory = () => {
    playSound('click');
    speakIndonesian(storiesList[selectedStoryIdx].content);
  };

  const handleSelectStoryChoice = (isCorrect: boolean) => {
    setStoryAnswered(true);
    setStoryAnswerCorrect(isCorrect);

    if (isCorrect) {
      playSound('success');
      confetti({ particleCount: 50, spread: 60 });
      speakIndonesian("Jawabanmu benar! Hebat sekali. Sekarang coba ceritakan kembali kisah ini.");
    } else {
      playSound('error');
      speakIndonesian("Kurang tepat. Coba pilih jawaban yang lain ya.");
      setTimeout(() => {
        setStoryAnswered(null);
      }, 1500);
    }
  };

  const startStoryRecording = async () => {
    playSound('click');
    setStoryAudioUrl(null);
    storyAudioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      storyMediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          storyAudioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(storyAudioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setStoryAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setStoryIsRecording(true);
      speakIndonesian("Silakan ceritakan kembali kisah ini");
    } catch (err) {
      console.error('Story audio recording error:', err);
      setMicErrorMessage('Izin mikrofon diperlukan untuk merekam ceritamu. Pastikan kamu memberikan izin mikrofon di browsermu ya!');
      setShowMicErrorAlert(true);
    }
  };

  const stopStoryRecording = () => {
    playSound('pop');
    if (storyMediaRecorderRef.current && storyIsRecording) {
      storyMediaRecorderRef.current.stop();
      setStoryIsRecording(false);
    }
  };

  const playStoryAudio = () => {
    if (storyAudioUrl) {
      playSound('pop');
      const audio = new Audio(storyAudioUrl);
      audio.play();
    }
  };

  const handleCompleteStory = async () => {
    playSound('success');
    const storyId = storiesList[selectedStoryIdx].id;
    // Complete this specific story and also complete 'konstruksi_cerita' to satisfy badge step check
    await completeStep(storyId, 2);
    await completeStep('konstruksi_cerita', 2);

    setStoryCompleted(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    speakIndonesian("Terima kasih sudah menceritakan kembali! Kamu pintar bercerita. Dua bintang ditambahkan!");
  };

  return (
    <div className="space-y-6 py-4">
      {gameWon && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />
        </div>
      )}
      {/* Header */}
      <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-md p-4 rounded-3xl border-3 border-emerald-100/85 shadow-sm">
        <Link to="/" onClick={() => { playSound('click'); cancelSpeech(); }} className="p-3 bg-white rounded-2xl border-2 border-emerald-100 hover:bg-emerald-50 transition text-slate-700 shrink-0">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-emerald-800">Konstruksi Bahasa & Makna</h2>
          <p className="text-slate-600 font-bold text-sm">Pilih aktivitas untuk meningkatkan kosa kata dan keterampilan bicaramu!</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-3 bg-emerald-100/50 p-2 rounded-2xl border-2 border-emerald-100">
        <button
          onClick={() => { playSound('pop'); cancelSpeech(); setActiveTab('matching'); }}
          className={`flex-1 py-5 font-extrabold text-md md:text-lg rounded-xl transition cursor-pointer ${activeTab === 'matching' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-850 hover:bg-white/40'
            }`}
        >
          🎮 Tebak Gambar
        </button>
        <button
          onClick={() => { playSound('pop'); cancelSpeech(); setActiveTab('pronounce'); }}
          className={`flex-1 py-5 font-extrabold text-md md:text-lg rounded-xl transition cursor-pointer ${activeTab === 'pronounce' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-850 hover:bg-white/40'
            }`}
        >
          🎙️ Latih Lafal
        </button>
        <button
          onClick={() => { playSound('pop'); cancelSpeech(); setActiveTab('story'); }}
          className={`flex-1 py-5 font-extrabold text-md md:text-lg rounded-xl transition cursor-pointer ${activeTab === 'story' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-850 hover:bg-white/40'
            }`}
        >
          📖 Simak & Ceritakan
        </button>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'matching' && (
          <motion.div
            key="matching"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-playful flex flex-col justify-between space-y-6"
          >
            <div>
              <h3 className="text-2xl font-black text-amber-900 flex items-center justify-between">
                <span>🎮 Tebak & Cocokkan Gambar</span>
                {completedSteps.includes('konstruksi_matching') && (
                  <span className="text-emerald-600 font-black text-sm bg-emerald-50 px-3 py-1 rounded-xl flex items-center gap-1 border border-emerald-200">
                    Lulus <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                  </span>
                )}
              </h3>
              <p className="text-slate-600 font-bold text-sm mt-1">Ketuk kata di kiri, lalu ketuk gambar yang cocok di kanan!</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
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
                      className={`w-full py-4 px-3 rounded-2xl font-extrabold text-lg border-3 transition-all cursor-pointer ${isMatched
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
                      className={`w-full py-4 rounded-2xl border-3 text-4xl transition-all cursor-pointer ${isMatched
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
                  className="px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-playful-secondary hover:brightness-110 transition cursor-pointer"
                >
                  Main Lagi!
                </button>
              </motion.div>
            ) : (
              <button
                onClick={initGame}
                className="py-5 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-playful-secondary transition cursor-pointer"
              >
                Acak Ulang
              </button>
            )}
          </motion.div>
        )}

        {activeTab === 'pronounce' && (
          <motion.div
            key="pronounce"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-3xl p-6 border-4 border-blue-300 shadow-playful flex flex-col justify-between space-y-6"
          >
            <div>
              <h3 className="text-2xl font-black text-blue-900 flex items-center justify-between">
                <span>🎙️ Latih Pengucapan Kata</span>
                <span className="text-blue-600 font-black text-xs bg-blue-50 px-2 py-1 rounded-xl border border-blue-200">
                  Perekam Suara Luring
                </span>
              </h3>
              <p className="text-slate-600 font-bold text-sm mt-1">Pilih kosakata khas Dayak/alam, dengarkan suaranya, dan rekam suaramu!</p>
            </div>

            {/* Word Selector */}
            <div className="flex flex-wrap gap-2 justify-center">
              {vocabList.map((item) => (
                <button
                  key={item.word}
                  onClick={() => { playSound('pop'); setRecordingWord(item.word); speakIndonesian(item.word); setAudioUrl(null); }}
                  className={`px-4 py-4 rounded-xl font-extrabold border-2 transition cursor-pointer ${recordingWord === item.word
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
            <div className="bg-blue-50/50 rounded-2xl p-6 border-2 border-blue-100 text-center space-y-3 flex flex-col justify-center items-center">
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
                className="p-3 bg-white text-blue-500 border-2 border-blue-200 rounded-full hover:bg-blue-50 transition cursor-pointer shadow-sm"
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
                  className="flex items-center space-x-2 px-6 py-5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-2xl shadow-playful-rose transition cursor-pointer btn-bouncy"
                >
                  <Mic size={20} />
                  <span>Mulai Rekam</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center space-x-2 px-6 py-5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-2xl shadow-playful transition cursor-pointer animate-pulse"
                >
                  <Square size={20} />
                  <span>Berhenti</span>
                </button>
              )}

              <button
                disabled={!audioUrl}
                onClick={playRecordedAudio}
                className={`flex items-center space-x-2 px-6 py-5 rounded-2xl font-extrabold border-2 transition cursor-pointer ${audioUrl
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 shadow-playful-primary'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
              >
                <Play size={20} />
                <span>Putar Suaramu</span>
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'story' && (
          <motion.div
            key="story"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Story Sidebar Selector */}
            <div className="lg:col-span-1 space-y-3">
              <p className="text-xs font-black uppercase text-emerald-800 tracking-wider">Daftar Dongeng Rakyat</p>
              <div className="space-y-2">
                {storiesList.map((story, index) => {
                  const isSelected = selectedStoryIdx === index;
                  const isCompleted = completedSteps.includes(story.id);
                  return (
                    <button
                      key={story.id}
                      onClick={() => handleSelectStory(index)}
                      className={`w-full p-4 rounded-2xl text-left border-3 transition-all cursor-pointer flex items-center justify-between ${isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black'
                          : 'bg-white border-slate-100 text-slate-700 font-semibold hover:border-emerald-250'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{story.emoji}</span>
                        <div>
                          <p className="text-base leading-tight">{story.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Dongeng interaktif</p>
                        </div>
                      </div>
                      {isCompleted && (
                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0" fill="currentColor" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Story Viewer & Quiz & Recorder */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card 1: Story Content */}
              <div className="bg-white rounded-3xl p-6 border-4 border-emerald-300 shadow-playful space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-2xl font-black text-emerald-950 flex items-center gap-2">
                    <span>📖 {storiesList[selectedStoryIdx].title}</span>
                  </h3>
                  <button
                    onClick={handleListenStory}
                    className="flex items-center gap-1.5 px-4 py-4 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition cursor-pointer font-bold text-sm"
                  >
                    <Volume2 size={18} />
                    <span>Dengarkan</span>
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <ImageWithFallback
                    src={storiesList[selectedStoryIdx].image}
                    alt={storiesList[selectedStoryIdx].title}
                    fallback={storiesList[selectedStoryIdx].emoji}
                    className="w-28 h-28 object-contain rounded-2xl bg-slate-50 p-2 shrink-0"
                  />
                  <p className="text-slate-800 font-semibold text-lg leading-relaxed text-justify">
                    {storiesList[selectedStoryIdx].content}
                  </p>
                </div>
              </div>

              {/* Card 2: Comprehension Quiz */}
              <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-playful space-y-4">
                <h4 className="text-xl font-black text-amber-900 flex items-center gap-2">
                  <HelpCircle size={22} className="text-amber-500" />
                  <span>Kuis Pemahaman Cerita</span>
                </h4>
                <p className="text-slate-700 font-bold text-md bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
                  💡 {storiesList[selectedStoryIdx].question}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {storiesList[selectedStoryIdx].choices.map((choice, i) => {
                    return (
                      <button
                        key={i}
                        disabled={storyAnswered !== null}
                        onClick={() => handleSelectStoryChoice(choice.isCorrect)}
                        className={`p-3.5 rounded-xl font-extrabold text-base border-2 transition text-left cursor-pointer flex justify-between items-center ${storyAnswered === null
                            ? 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/30'
                            : choice.isCorrect
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                              : 'bg-rose-50 border-rose-200 text-rose-500 opacity-60'
                          }`}
                      >
                        <span>{choice.text}</span>
                        {storyAnswered !== null && choice.isCorrect && (
                          <CheckCircle2 size={18} className="text-emerald-600" fill="currentColor" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card 3: Voice Retelling */}
              {storyAnswerCorrect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-6 border-4 border-rose-300 shadow-playful space-y-4"
                >
                  <h4 className="text-xl font-black text-rose-900 flex items-center gap-2">
                    <Mic size={22} className="text-rose-500" />
                    <span>Ceritakan Kembali Kisahnya!</span>
                  </h4>
                  <p className="text-slate-600 font-semibold text-sm">
                    Hebat! Sekarang ketuk tombol rekam dan ceritakan dongeng di atas menggunakan bahasamu sendiri ya!
                  </p>

                  <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 flex items-center justify-around">
                    {!storyIsRecording ? (
                      <button
                        onClick={startStoryRecording}
                        className="flex items-center space-x-2 px-5 py-5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-2xl shadow-playful-rose transition cursor-pointer btn-bouncy"
                      >
                        <Mic size={18} />
                        <span>Mulai Rekam</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopStoryRecording}
                        className="flex items-center space-x-2 px-5 py-5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-2xl shadow-playful transition cursor-pointer animate-pulse"
                      >
                        <Square size={18} />
                        <span>Selesai Rekam</span>
                      </button>
                    )}

                    <button
                      disabled={!storyAudioUrl}
                      onClick={playStoryAudio}
                      className={`flex items-center space-x-2 px-5 py-5 rounded-2xl font-extrabold border-2 transition cursor-pointer ${storyAudioUrl
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 shadow-playful-primary'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        }`}
                    >
                      <Play size={18} />
                      <span>Putar Rekaman</span>
                    </button>
                  </div>

                  {storyAudioUrl && !storyCompleted && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-3 text-center">
                      <button
                        onClick={handleCompleteStory}
                        className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-playful-primary btn-bouncy transition cursor-pointer"
                      >
                        🌟 Selesai & Ambil Bintang (+2 ⭐)
                      </button>
                    </motion.div>
                  )}

                  {storyCompleted && (
                    <div className="bg-emerald-100 border-2 border-emerald-300 rounded-2xl p-4 text-center">
                      <h5 className="font-extrabold text-emerald-800 text-lg">Luar Biasa! Ceritamu Tersimpan! ❤️</h5>
                      <p className="text-emerald-700 font-bold text-sm">Dua bintang telah ditambahkan ke profilmu.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomDialog
        isOpen={showMicErrorAlert}
        title="Mikrofon Diblokir"
        message={micErrorMessage}
        type="alert"
        onConfirm={() => setShowMicErrorAlert(false)}
      />
    </div>
  );
};

