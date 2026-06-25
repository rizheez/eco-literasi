import React, { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { playSound, speakIndonesian } from '../utils/audio';
import { ChevronLeft, Speech } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Settings: React.FC = () => {
  const { settings, loadSettings, updateSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updateSettings({ bgMusicVolume: val });
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updateSettings({ voiceVolume: val });
  };

  const handleTtsToggle = () => {
    playSound('pop');
    const nextVal = !settings.textToSpeechEnabled;
    updateSettings({ textToSpeechEnabled: nextVal });
    
    if (nextVal) {
      setTimeout(() => speakIndonesian("Suara panduan sekarang aktif!"), 100);
    }
  };

  const testSound = () => {
    playSound('success');
  };

  const testTts = () => {
    speakIndonesian("Halo! Saya adalah burung enggang cerdik, suara panduan belajarmu.");
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link to="/" onClick={() => playSound('click')} className="p-3 bg-white rounded-2xl border-2 border-emerald-100 hover:bg-emerald-50 transition text-slate-700">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-emerald-800">Pengaturan</h2>
          <p className="text-slate-600 font-bold text-sm">Sesuaikan volume suara musik, efek suara, dan suara pembaca panduan di sini.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-emerald-150 shadow-playful max-w-lg mx-auto space-y-6">
        {/* Toggle Speech Synthesis */}
        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-emerald-950 text-lg flex items-center gap-1.5">
              <Speech className="text-emerald-600" />
              <span>Suara Pembaca Panduan (TTS)</span>
            </h4>
            <p className="text-slate-500 font-bold text-xs">Membacakan tulisan otomatis untuk membantu anak PAUD.</p>
          </div>
          <button
            type="button"
            onClick={handleTtsToggle}
            className={`w-14 h-8 rounded-full transition-all relative flex items-center p-1 cursor-pointer ${
              settings.textToSpeechEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-6 h-6 bg-white rounded-full shadow-md" />
          </button>
        </div>

        {/* Volume controls */}
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between font-extrabold text-slate-700">
              <span>🔊 Volume Efek Suara (Game & Menu)</span>
              <span>{Math.round(settings.bgMusicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.bgMusicVolume}
              onChange={handleVolumeChange}
              className="w-full accent-emerald-500 h-2 bg-emerald-100 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-extrabold text-slate-700">
              <span>🗣️ Volume Suara Panduan</span>
              <span>{Math.round(settings.voiceVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.voiceVolume}
              onChange={handleVoiceChange}
              className="w-full accent-emerald-500 h-2 bg-emerald-100 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Test Buttons */}
        <div className="border-t border-slate-100 pt-6 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={testSound}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl transition border-2 border-slate-200 cursor-pointer"
          >
            🔊 Tes Bunyi Beep
          </button>
          <button
            type="button"
            onClick={testTts}
            disabled={!settings.textToSpeechEnabled}
            className={`py-3 px-4 font-extrabold rounded-2xl transition border-2 cursor-pointer ${
              settings.textToSpeechEnabled
                ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 shadow-playful-primary'
                : 'bg-slate-150 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            🗣️ Tes Suara Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
