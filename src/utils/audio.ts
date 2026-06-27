import { useSettingsStore } from '../store/useSettingsStore';

// Web Speech Synthesis API helper (TTS in Indonesian)
export function speakIndonesian(text: string) {
  const settings = useSettingsStore.getState().settings;
  if (!settings.textToSpeechEnabled) return;

  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech to prevent queuing lag
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID'; // Indonesian voice
    utterance.volume = settings.voiceVolume;
    utterance.pitch = 1.3; // Playful cartoon mascot tone (pitch up)
    utterance.rate = 0.88; // Slightly slower, clear pace perfect for kids (4-6 years old) to follow along

    // Find Indonesian voice, prioritizing high-quality/natural neural and child-friendly voices
    const voices = window.speechSynthesis.getVoices();
    const idVoices = voices.filter(voice => voice.lang.toLowerCase().includes('id'));
    
    const selectedVoice = 
      idVoices.find(v => v.name.toLowerCase().includes('gadis')) || // Microsoft Edge friendly girl voice
      idVoices.find(v => v.name.toLowerCase().includes('neural')) || // Neural high-quality
      idVoices.find(v => v.name.toLowerCase().includes('google')) || // Google Indonesian
      idVoices[0]; // Fallback

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
}

// Trigger speech synthesis list load to register voices on startup
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// Web Audio API Sound Generator (synthesizes audio dynamically for zero-dependency offline use)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function playSound(type: 'click' | 'success' | 'error' | 'pop') {
  const settings = useSettingsStore.getState().settings;
  const volumeValue = settings.bgMusicVolume; // use bgMusicVolume slider for FX
  if (volumeValue === 0) return;

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(volumeValue * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
      gain.gain.setValueAtTime(volumeValue * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'success') {
      // Happy bubbly two-tone beep (arpeggio)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(392.00, now); // G4
      osc.frequency.setValueAtTime(523.25, now + 0.08); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.16); // E5
      gain.gain.setValueAtTime(volumeValue * 0.3, now);
      gain.gain.setValueAtTime(volumeValue * 0.3, now + 0.08);
      gain.gain.setValueAtTime(volumeValue * 0.3, now + 0.16);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'error') {
      // Downward buzzer sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.22);
      gain.gain.setValueAtTime(volumeValue * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.error('Web Audio synthesiser failed:', e);
  }
}
