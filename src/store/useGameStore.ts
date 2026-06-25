import { create } from 'zustand';

interface GameState {
  currentScore: number;
  lives: number;
  isGameOver: boolean;
  isGameWon: boolean;
  gameId: string | null;
  resetGame: (gameId: string) => void;
  incrementScore: (amount: number) => void;
  decrementLives: () => void;
  setGameStatus: (won: boolean, over: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentScore: 0,
  lives: 3,
  isGameOver: false,
  isGameWon: false,
  gameId: null,

  resetGame: (gameId: string) => {
    set({
      currentScore: 0,
      lives: 3,
      isGameOver: false,
      isGameWon: false,
      gameId
    });
  },

  incrementScore: (amount: number) => {
    set((state) => ({ currentScore: state.currentScore + amount }));
  },

  decrementLives: () => {
    set((state) => {
      const nextLives = state.lives - 1;
      return {
        lives: nextLives,
        isGameOver: nextLives <= 0
      };
    });
  },

  setGameStatus: (won: boolean, over: boolean) => {
    set({ isGameWon: won, isGameOver: over });
  }
}));
