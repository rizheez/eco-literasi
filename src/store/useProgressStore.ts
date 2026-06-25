import { create } from 'zustand';
import { db, type Progress, type Badge } from '../database/db';
import { useChildStore } from './useChildStore';

interface ProgressState {
  completedSteps: string[];
  badges: Badge[];
  isLoading: boolean;
  loadProgress: (childId: number) => Promise<void>;
  completeStep: (stepId: string, starsReward?: number) => Promise<boolean>;
  earnBadge: (badgeName: string, icon: string) => Promise<void>;
  resetProgress: (childId: number) => Promise<void>;
  checkBadgeUnlocks: (newlyCompletedStepId: string) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  completedSteps: [],
  badges: [],
  isLoading: false,

  loadProgress: async (childId: number) => {
    set({ isLoading: true });
    try {
      const steps = await db.progress.where('childId').equals(childId).toArray();
      const list = steps.map(s => s.stepId);
      
      const earnedBadges = await db.badges.where('childId').equals(childId).toArray();
      
      set({
        completedSteps: list,
        badges: earnedBadges,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load progress', error);
      set({ isLoading: false });
    }
  },

  completeStep: async (stepId: string, starsReward = 2) => {
    const activeChild = useChildStore.getState().activeChild;
    if (!activeChild || !activeChild.id) return false;

    const childId = activeChild.id;
    const { completedSteps } = get();

    if (completedSteps.includes(stepId)) {
      return false; // Already completed, no extra reward
    }

    const newProgress: Progress = {
      childId,
      stepId,
      completed: true,
      date: new Date().toISOString().split('T')[0]
    };

    await db.progress.add(newProgress);
    
    // Add stars to child
    await useChildStore.getState().addStars(starsReward);

    // Update local state
    set({ completedSteps: [...completedSteps, stepId] });

    // Check badges
    await get().checkBadgeUnlocks(stepId);

    return true;
  },

  earnBadge: async (badgeName: string, icon: string) => {
    const activeChild = useChildStore.getState().activeChild;
    if (!activeChild || !activeChild.id) return;
    
    const childId = activeChild.id;
    
    // Check if already earned
    const existing = await db.badges.where({ childId, badgeName }).first();
    if (existing) return;

    const newBadge: Badge = {
      childId,
      badgeName,
      icon,
      dateEarned: new Date().toISOString().split('T')[0]
    };

    await db.badges.add(newBadge);
    
    const earned = await db.badges.where('childId').equals(childId).toArray();
    set({ badges: earned });
  },

  resetProgress: async (childId: number) => {
    await db.progress.where('childId').equals(childId).delete();
    await db.badges.where('childId').equals(childId).delete();
    await db.scores.where('childId').equals(childId).delete();
    
    // Reset child stars & level
    await db.children.update(childId, {
      totalStars: 0,
      level: 1
    });

    // Refresh child
    await useChildStore.getState().loadChildren();
    const activeChild = useChildStore.getState().activeChild;
    if (activeChild && activeChild.id === childId) {
      await useChildStore.getState().selectChild(childId);
    }

    set({ completedSteps: [], badges: [] });
  },

  checkBadgeUnlocks: async (newlyCompletedStepId: string) => {
    // We add the newly completed step to make sure the check is accurate
    const steps = Array.from(new Set([...get().completedSteps, newlyCompletedStepId]));
    const earnedBadgeNames = get().badges.map(b => b.badgeName);

    // 1. Ahli Burung Enggang
    if (newlyCompletedStepId.includes('enggang') && !earnedBadgeNames.includes('Ahli Burung Enggang')) {
      await get().earnBadge('Ahli Burung Enggang', '🦜');
    }

    // 2. Penjaga Hutan
    const forestSteps = ['eksplorasi_hutan', 'internalisasi_forest', 'aksi_puzzle'];
    const completedForest = forestSteps.filter(s => steps.includes(s));
    if (completedForest.length >= 2 && !earnedBadgeNames.includes('Penjaga Hutan')) {
      await get().earnBadge('Penjaga Hutan', '🌳');
    }

    // 3. Sahabat Sungai
    const riverSteps = ['eksplorasi_sungai', 'internalisasi_river'];
    const completedRiver = riverSteps.filter(s => steps.includes(s));
    if (completedRiver.length >= 2 && !earnedBadgeNames.includes('Sahabat Sungai')) {
      await get().earnBadge('Sahabat Sungai', '🐟');
    }

    // 4. Pintar Bercerita
    const storySteps = ['eksplorasi_cerita', 'konstruksi_matching', 'aksi_wordbuilder'];
    const completedStory = storySteps.filter(s => steps.includes(s));
    if (completedStory.length >= 2 && !earnedBadgeNames.includes('Pintar Bercerita')) {
      await get().earnBadge('Pintar Bercerita', '📚');
    }
  }
}));
