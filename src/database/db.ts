import Dexie, { type Table } from 'dexie';

export interface Child {
  id?: number;
  name: string;
  avatar: string; // Name of avatar image/emoji, e.g. "🦊", "🐻", "🐸", "🦉"
  level: number;
  totalStars: number;
}

export interface Progress {
  id?: number;
  childId: number;
  stepId: string; // e.g. "eksplorasi_enggang", "konstruksi_matching", "internalisasi_forest", "aksi_wordbuilder"
  completed: boolean;
  date: string;
}

export interface Score {
  id?: number;
  childId: number;
  gameId: string;
  score: number;
  starsEarned: number;
  timestamp: number;
}

export interface Badge {
  id?: number;
  childId: number;
  badgeName: string;
  icon: string; // emoji or graphic path
  dateEarned: string;
}

export interface Setting {
  id: string; // "default"
  bgMusicVolume: number;
  voiceVolume: number;
  textToSpeechEnabled: boolean;
}

export class EcoDayakDb extends Dexie {
  children!: Table<Child>;
  progress!: Table<Progress>;
  scores!: Table<Score>;
  badges!: Table<Badge>;
  settings!: Table<Setting>;

  constructor() {
    super('EcoDayakDb');
    this.version(1).stores({
      children: '++id, name, level',
      progress: '++id, childId, stepId, completed',
      scores: '++id, childId, gameId',
      badges: '++id, childId, badgeName',
      settings: 'id'
    });
  }
}

export const db = new EcoDayakDb();

// Seed initial settings if empty
export async function seedDatabase() {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      id: 'default',
      bgMusicVolume: 0.5,
      voiceVolume: 0.8,
      textToSpeechEnabled: true,
    });
  }
}
