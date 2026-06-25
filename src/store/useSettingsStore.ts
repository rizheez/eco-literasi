import { create } from 'zustand';
import { db, type Setting, seedDatabase } from '../database/db';

interface SettingsState {
  settings: Setting;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (updated: Partial<Setting>) => Promise<void>;
}

const defaultSettings: Setting = {
  id: 'default',
  bgMusicVolume: 0.5,
  voiceVolume: 0.8,
  textToSpeechEnabled: true,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      await seedDatabase();
      const current = await db.settings.get('default');
      if (current) {
        set({ settings: current, isLoading: false });
      } else {
        set({ settings: defaultSettings, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load settings', error);
      set({ isLoading: false });
    }
  },

  updateSettings: async (updated: Partial<Setting>) => {
    try {
      const current = await db.settings.get('default');
      const newSettings = { ...(current || defaultSettings), ...updated } as Setting;
      await db.settings.put(newSettings);
      set({ settings: newSettings });
    } catch (error) {
      console.error('Failed to update settings', error);
    }
  }
}));
