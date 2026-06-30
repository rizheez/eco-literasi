import { useSettingsStore } from '../store/useSettingsStore';

let currentUtteranceAudio: HTMLAudioElement | null = null;
let activeSpeechText: string | null = null;

// Helper to strip emojis and clean up whitespace
export function cleanSpeechText(text: string): string {
  return text
    .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper to generate SHA-256 hash using Web Crypto API
async function getHash(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Speak guide in Indonesian, using pre-rendered MP3
export async function speakIndonesian(text: string) {
  const settings = useSettingsStore.getState().settings;
  if (!settings.textToSpeechEnabled) return;

  // Cancel any ongoing speech
  cancelSpeech();

  const cleaned = cleanSpeechText(text);
  if (!cleaned) return;

  activeSpeechText = cleaned;

  try {
    const hash = await getHash(cleaned);

    // Abort if activeSpeechText has changed during the async hashing period
    if (activeSpeechText !== cleaned) return;

    const audioSrc = `/audio/tts/${hash}.mp3`;
    const audio = new Audio(audioSrc);
    audio.volume = settings.voiceVolume;
    currentUtteranceAudio = audio;

    await audio.play().catch(err => {
      console.warn('Audio play failed:', err);
    });
  } catch (err) {
    console.error('Error generating hash or playing audio:', err);
  }
}

// Cancel any playing speech
export function cancelSpeech() {
  activeSpeechText = null;
  if (currentUtteranceAudio) {
    currentUtteranceAudio.pause();
    currentUtteranceAudio.src = '';
    currentUtteranceAudio = null;
  }
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
