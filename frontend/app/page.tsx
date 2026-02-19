/**
 * Main game page.
 */
"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useGameLogic } from "@/hooks/useGameLogic";
import { useGameStore } from "@/store/gameStore";
import Header from "@/components/Header";
import Board from "@/components/Board";
import PowerUps from "@/components/PowerUps";
import GameOver from "@/components/GameOver";
import WinBanner from "@/components/WinBanner";

/**
 * Synchronously check localStorage for a saved game with tiles on the board.
 * If found, push the saved state directly into Zustand and return true.
 */
function restoreFromLocalStorage(): boolean {
  try {
    const raw = localStorage.getItem("2048-game-store");
    if (!raw) return false;

    const parsed = JSON.parse(raw);
    const s = parsed?.state;
    if (!s || !Array.isArray(s.grid)) return false;

    const hasTiles = s.grid.some((row: number[]) =>
      row.some((v: number) => v !== 0)
    );
    if (!hasTiles) return false;

    useGameStore.setState({
      grid: s.grid,
      score: s.score ?? 0,
      bestScore: s.bestScore ?? 0,
      gameOver: s.gameOver ?? false,
      won: s.won ?? false,
      keepPlaying: s.keepPlaying ?? false,
      undoCount: s.undoCount ?? 3,
      swapCount: s.swapCount ?? 1,
      deleteCount: s.deleteCount ?? 1,
      history: s.history ?? [],
    });
    return true;
  } catch {
    return false;
  }
}

export default function HomePage() {
  const didInit = useRef(false);

  const {
    grid, score, bestScore,
    gameOver, won, keepPlaying,
    undoCount, swapCount, deleteCount,
    powerUpMode, swapSelection,
    initGame, applyMove, undo,
    handleTileClick, setPowerUpMode, setKeepPlaying,
  } = useGameLogic();

  // On mount, restore saved game from localStorage (synchronous).
  // Only start a new game if nothing is saved.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (!restoreFromLocalStorage()) {
      initGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleSwap = () => {
    setPowerUpMode(powerUpMode === "swap" ? "none" : "swap");
  };

  const handleToggleDelete = () => {
    setPowerUpMode(powerUpMode === "delete" ? "none" : "delete");
  };

  return (
    <main className="flex flex-col items-center min-h-screen py-8 px-4 gap-6">
      <Header score={score} bestScore={bestScore} onNewGame={initGame} />

      {/* Instructions */}
      <p className="text-[#bbada0] text-sm text-center max-w-[480px]">
        Use <kbd className="bg-[#eee4da] px-1 rounded">arrow keys</kbd> or swipe to move tiles.
        Merge tiles with the same number to reach <strong>2048</strong>!
      </p>

      {/* Game board with overlay */}
      <div className="relative">
        <Board
          grid={grid}
          powerUpMode={powerUpMode}
          swapSelection={swapSelection}
          onTileClick={handleTileClick}
          onSwipe={applyMove}
        />

        <AnimatePresence>
          {gameOver && (
            <GameOver score={score} onRestart={initGame} />
          )}
          {won && !keepPlaying && !gameOver && (
            <WinBanner
              onKeepPlaying={() => setKeepPlaying(true)}
              onRestart={initGame}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Power-ups */}
      <PowerUps
        undoCount={undoCount}
        swapCount={swapCount}
        deleteCount={deleteCount}
        powerUpMode={powerUpMode}
        onUndo={undo}
        onToggleSwap={handleToggleSwap}
        onToggleDelete={handleToggleDelete}
      />

      {/* Power-up hint */}
      {powerUpMode !== "none" && (
        <p className="text-sm text-[#f59563] font-semibold animate-pulse">
          {powerUpMode === "swap"
            ? "Click a tile, then click an adjacent tile to swap them."
            : "Click a tile to remove it from the board."}
        </p>
      )}

      <footer className="text-[#bbada0] text-xs text-center mt-auto">
        Built with Next.js + FastAPI · Powered by Clerk Auth
      </footer>
    </main>
  );
}
