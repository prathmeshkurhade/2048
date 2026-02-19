/**
 * Zustand store for 2048 game state.
 *
 * Uses `persist` with `skipHydration: true` so that auto-hydration does NOT
 * run on module load. Instead, we restore state manually (synchronously) in
 * page.tsx on mount, which eliminates all async race conditions.
 *
 * The persist middleware still auto-SAVES on every state change.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Grid = number[][];

export type PowerUpMode = "none" | "swap" | "delete";

export interface SwapSelection {
    row: number;
    col: number;
}

interface GameStore {
    // Board state
    grid: Grid;
    score: number;
    bestScore: number;
    gameOver: boolean;
    won: boolean;
    keepPlaying: boolean;

    // Power-ups
    undoCount: number;
    swapCount: number;
    deleteCount: number;
    powerUpMode: PowerUpMode;
    swapSelection: SwapSelection | null;

    // History for undo
    history: { grid: Grid; score: number }[];

    // Actions
    setGrid: (grid: Grid) => void;
    setScore: (score: number) => void;
    setBestScore: (score: number) => void;
    setGameOver: (over: boolean) => void;
    setWon: (won: boolean) => void;
    setKeepPlaying: (keep: boolean) => void;
    pushHistory: (grid: Grid, score: number) => void;
    popHistory: () => { grid: Grid; score: number } | null;
    decrementUndo: () => void;
    decrementSwap: () => void;
    decrementDelete: () => void;
    setPowerUpMode: (mode: PowerUpMode) => void;
    setSwapSelection: (sel: SwapSelection | null) => void;
    resetGame: () => void;
}

const INITIAL_GRID: Grid = Array(4).fill(null).map(() => Array(4).fill(0));

export const useGameStore = create<GameStore>()(
    persist(
        (set, get) => ({
            grid: INITIAL_GRID,
            score: 0,
            bestScore: 0,
            gameOver: false,
            won: false,
            keepPlaying: false,
            undoCount: 3,
            swapCount: 1,
            deleteCount: 1,
            powerUpMode: "none",
            swapSelection: null,
            history: [],

            setGrid: (grid) => set({ grid }),
            setScore: (score) => {
                const best = get().bestScore;
                set({ score, bestScore: score > best ? score : best });
            },
            setBestScore: (bestScore) => set({ bestScore }),
            setGameOver: (gameOver) => set({ gameOver }),
            setWon: (won) => set({ won }),
            setKeepPlaying: (keepPlaying) => set({ keepPlaying }),

            pushHistory: (grid, score) => {
                const history = [...get().history];
                if (history.length >= 3) history.shift();
                history.push({ grid: grid.map((r) => [...r]), score });
                set({ history });
            },

            popHistory: () => {
                const history = [...get().history];
                if (history.length === 0) return null;
                const last = history.pop()!;
                set({ history });
                return last;
            },

            decrementUndo: () => set((s) => ({ undoCount: Math.max(0, s.undoCount - 1) })),
            decrementSwap: () => set((s) => ({ swapCount: Math.max(0, s.swapCount - 1) })),
            decrementDelete: () => set((s) => ({ deleteCount: Math.max(0, s.deleteCount - 1) })),

            setPowerUpMode: (powerUpMode) => set({ powerUpMode, swapSelection: null }),
            setSwapSelection: (swapSelection) => set({ swapSelection }),

            resetGame: () =>
                set({
                    grid: INITIAL_GRID,
                    score: 0,
                    gameOver: false,
                    won: false,
                    keepPlaying: false,
                    undoCount: 3,
                    swapCount: 1,
                    deleteCount: 1,
                    powerUpMode: "none",
                    swapSelection: null,
                    history: [],
                }),
        }),
        {
            name: "2048-game-store",
            // Only auto-SAVE, never auto-LOAD. We restore manually in page.tsx.
            skipHydration: true,
            partialize: (state) => ({
                grid: state.grid,
                score: state.score,
                bestScore: state.bestScore,
                gameOver: state.gameOver,
                won: state.won,
                keepPlaying: state.keepPlaying,
                undoCount: state.undoCount,
                swapCount: state.swapCount,
                deleteCount: state.deleteCount,
                history: state.history,
            }),
        }
    )
);
