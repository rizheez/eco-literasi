import { create } from 'zustand';
import { db, type Child } from '../database/db';

interface ChildState {
  activeChild: Child | null;
  childrenList: Child[];
  isLoading: boolean;
  loadChildren: () => Promise<void>;
  selectChild: (id: number) => Promise<void>;
  createChild: (name: string, avatar: string) => Promise<Child>;
  addStars: (amount: number) => Promise<void>;
  deleteChild: (id: number) => Promise<void>;
}

export const useChildStore = create<ChildState>((set, get) => ({
  activeChild: null,
  childrenList: [],
  isLoading: false,

  loadChildren: async () => {
    set({ isLoading: true });
    try {
      const list = await db.children.toArray();
      set({ childrenList: list, isLoading: false });
    } catch (error) {
      console.error('Failed to load children', error);
      set({ isLoading: false });
    }
  },

  selectChild: async (id: number) => {
    try {
      const child = await db.children.get(id);
      if (child) {
        set({ activeChild: child });
      }
    } catch (error) {
      console.error('Failed to select child', error);
    }
  },

  createChild: async (name: string, avatar: string) => {
    const newChild: Child = {
      name,
      avatar,
      level: 1,
      totalStars: 0,
    };
    
    const id = await db.children.add(newChild);
    const created = { ...newChild, id };
    
    await get().loadChildren();
    set({ activeChild: created });
    
    return created;
  },

  addStars: async (amount: number) => {
    const { activeChild } = get();
    if (!activeChild || !activeChild.id) return;

    const newStars = activeChild.totalStars + amount;
    // Simple level logic: 1 level per 10 stars (Level = 1 + Stars / 10)
    const newLevel = Math.max(1, Math.floor(newStars / 10) + 1);
    
    const updatedChild = {
      ...activeChild,
      totalStars: newStars,
      level: newLevel,
    };

    await db.children.update(activeChild.id, {
      totalStars: newStars,
      level: newLevel,
    });

    set({ activeChild: updatedChild });
    await get().loadChildren();
  },

  deleteChild: async (id: number) => {
    await db.children.delete(id);
    // Delete all related records
    await db.progress.where('childId').equals(id).delete();
    await db.scores.where('childId').equals(id).delete();
    await db.badges.where('childId').equals(id).delete();
    
    const { activeChild } = get();
    if (activeChild?.id === id) {
      set({ activeChild: null });
    }
    await get().loadChildren();
  }
}));
