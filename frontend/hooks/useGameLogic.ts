/**
 * Core 2048 game logic hook.
 * Handles grid moves, merging, scoring, power-ups, and game-over detection.
 */
"use client";

import { useCallback, useEffect } from "react";
import { useGameStore, Grid, SwapSelection } from "@/store/gameStore";
import { useAuth, useUser } from "@clerk/nextjs";
import { submitScore, saveGame, claimChallengeApi } from "@/lib/api";

// ── Utility Functions ──────────────────────────────────────────────────────────

/** Spawn a new tile (2 with 90% probability, 4 with 10%) in a random empty cell. */
function spawnTile(grid: Grid): Grid {
    const empty: [number, number][] = [];
    grid.forEach((row, r) => row.forEach((val, c) => { if (val === 0) empty.push([r, c]); }));
    if (empty.length === 0) return grid;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
}

/** Slide and merge a single row to the left. Returns { row, gained, mergedIndices }. */
function slideRow(row: number[]): { row: number[]; gained: number; mergedIndices: number[] } {
    const tiles = row.filter((v) => v !== 0);
    let gained = 0;
    const merged: number[] = [];
    const mergedIndices: number[] = [];
    let i = 0;
    while (i < tiles.length) {
        if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
            const val = tiles[i] * 2;
            mergedIndices.push(merged.length); // output index of the merged tile
            merged.push(val);
            gained += val;
            i += 2;
        } else {
            merged.push(tiles[i]);
            i++;
        }
    }
    while (merged.length < 4) merged.push(0);
    return { row: merged, gained, mergedIndices };
}


/** Transpose a 4x4 grid (rows become columns). */
function transpose(grid: Grid): Grid {
    return grid[0].map((_, c) => grid.map((row) => row[c]));
}

/** Reverse each row in a grid. */
function reverseRows(grid: Grid): Grid {
    return grid.map((row) => [...row].reverse());
}

/** Check if any valid move exists (used for game-over detection). */
function hasValidMoves(grid: Grid): boolean {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 0) return true;
            if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
            if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
        }
    }
    return false;
}

/** Check if the grid contains a 2048 tile. */
function hasWon(grid: Grid): boolean {
    return grid.some((row) => row.some((v) => v === 2048));
}

/** Get the highest tile value in the grid. */
function getHighestTile(grid: Grid): number {
    return Math.max(...grid.flat());
}

// ── Move Functions ─────────────────────────────────────────────────────────────

function moveLeft(grid: Grid): { grid: Grid; gained: number; mergedCells: Set<string> } {
    let gained = 0;
    const mergedCells = new Set<string>();
    const newGrid = grid.map((row, r) => {
        const result = slideRow(row);
        gained += result.gained;
        result.mergedIndices.forEach((c) => mergedCells.add(`${r}-${c}`));
        return result.row;
    });
    return { grid: newGrid, gained, mergedCells };
}

function moveRight(grid: Grid): { grid: Grid; gained: number; mergedCells: Set<string> } {
    let gained = 0;
    const mergedCells = new Set<string>();
    const newGrid = grid.map((row, r) => {
        const result = slideRow([...row].reverse());
        gained += result.gained;
        // mirror indices back since we reversed
        result.mergedIndices.forEach((c) => mergedCells.add(`${r}-${3 - c}`));
        return result.row.reverse();
    });
    return { grid: newGrid, gained, mergedCells };
}

function moveUp(grid: Grid): { grid: Grid; gained: number; mergedCells: Set<string> } {
    const transposed = transpose(grid);
    const { grid: moved, gained, mergedCells: mc } = moveLeft(transposed);
    // After transpose, row→col and col→row
    const mergedCells = new Set<string>([...mc].map((k) => { const [r, c] = k.split("-"); return `${c}-${r}`; }));
    return { grid: transpose(moved), gained, mergedCells };
}

function moveDown(grid: Grid): { grid: Grid; gained: number; mergedCells: Set<string> } {
    const transposed = transpose(grid);
    const { grid: moved, gained, mergedCells: mc } = moveRight(transposed);
    const mergedCells = new Set<string>([...mc].map((k) => { const [r, c] = k.split("-"); return `${c}-${r}`; }));
    return { grid: transpose(moved), gained, mergedCells };
}

/** Check if a move actually changed the grid. */
function gridsEqual(a: Grid, b: Grid): boolean {
    return a.every((row, r) => row.every((val, c) => val === b[r][c]));
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useGameLogic() {
    const store = useGameStore();
    const { getToken } = useAuth();
    const { user } = useUser();

    /** Initialize the game with two random tiles. */
    const initGame = useCallback(() => {
        store.resetGame();
        let grid: Grid = Array(4).fill(null).map(() => Array(4).fill(0));
        grid = spawnTile(grid);
        grid = spawnTile(grid);
        store.setGrid(grid);
    }, [store]);

    /** Apply a directional move to the grid. */
    const applyMove = useCallback(
        (direction: "left" | "right" | "up" | "down") => {
            if (store.gameOver || store.powerUpMode !== "none") return;
            if (store.won && !store.keepPlaying) return;

            const { grid, score } = store;
            store.pushHistory(grid, score);

            let result: { grid: Grid; gained: number; mergedCells: Set<string> };
            if (direction === "left") result = moveLeft(grid);
            else if (direction === "right") result = moveRight(grid);
            else if (direction === "up") result = moveUp(grid);
            else result = moveDown(grid);

            if (gridsEqual(grid, result.grid)) {
                store.popHistory();
                return;
            }

            const newScore = score + result.gained;
            const newGrid = spawnTile(result.grid);

            // Track merged cells for animation, clear after 300ms
            store.setMergedCells(result.mergedCells);
            setTimeout(() => store.setMergedCells(new Set()), 300);

            store.setGrid(newGrid);
            store.setScore(newScore);

            // Check win
            if (!store.won && hasWon(newGrid)) {
                store.setWon(true);
            }

            // Check 16384 challenge — first time this tile appears globally
            const highestTile = getHighestTile(newGrid);
            if (highestTile >= 16384 && !store.challengeWon) {
                store.setChallengeWon(true);
                claimChallenge();
            }

            // Check game over
            if (!hasValidMoves(newGrid)) {
                store.setGameOver(true);
                handleGameOver(newGrid, newScore);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [store]
    );

    /** Submit score to backend when game ends. */
    const handleGameOver = useCallback(
        async (grid: Grid, score: number) => {
            try {
                const token = await getToken();
                if (!token) return; // Guest user — skip submission
                const username = user?.username || user?.firstName || "Anonymous";
                await submitScore(score, getHighestTile(grid), username ?? "Anonymous", token);
            } catch (err) {
                console.error("Failed to submit score:", err);
            }
        },
        [getToken, user]
    );

    /** Undo the last move. */
    const undo = useCallback(() => {
        if (store.undoCount <= 0) return;
        const prev = store.popHistory();
        if (!prev) return;
        store.setGrid(prev.grid);
        store.setScore(prev.score);
        store.setGameOver(false);
        store.decrementUndo();
    }, [store]);

    /** Handle tile click in swap or delete mode. */
    const handleTileClick = useCallback(
        (row: number, col: number) => {
            const { powerUpMode, swapSelection, grid } = store;

            if (powerUpMode === "delete") {
                if (grid[row][col] === 0) return;
                const newGrid = grid.map((r) => [...r]);
                newGrid[row][col] = 0;
                store.setGrid(newGrid);
                store.decrementDelete();
                store.setPowerUpMode("none");
                return;
            }

            if (powerUpMode === "swap") {
                if (grid[row][col] === 0) return;

                if (!swapSelection) {
                    store.setSwapSelection({ row, col });
                    return;
                }

                const sel = swapSelection as SwapSelection;
                // Must be adjacent (horizontally or vertically)
                const isAdjacent =
                    (Math.abs(sel.row - row) === 1 && sel.col === col) ||
                    (Math.abs(sel.col - col) === 1 && sel.row === row);

                if (!isAdjacent) {
                    // Re-select
                    store.setSwapSelection({ row, col });
                    return;
                }

                const newGrid = grid.map((r) => [...r]);
                const temp = newGrid[sel.row][sel.col];
                newGrid[sel.row][sel.col] = newGrid[row][col];
                newGrid[row][col] = temp;
                store.setGrid(newGrid);
                store.decrementSwap();
                store.setPowerUpMode("none");
            }
        },
        [store]
    );


    /** Claim the ₹100 prize when current user is first to hit 16384. */
    const claimChallenge = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const username = user?.username || user?.firstName || "Anonymous";
            await claimChallengeApi(username ?? "Anonymous", token);
        } catch (err) {
            console.error("Failed to claim challenge:", err);
        }
    }, [getToken, user]);

    /** Save game state to backend (cloud sync). */
    const cloudSave = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            await saveGame(store.grid, store.score, token);
        } catch (err) {
            console.error("Cloud save failed:", err);
        }
    }, [getToken, store.grid, store.score]);

    // ── Keyboard Controls ────────────────────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const map: Record<string, "left" | "right" | "up" | "down"> = {
                ArrowLeft: "left",
                ArrowRight: "right",
                ArrowUp: "up",
                ArrowDown: "down",
            };
            const dir = map[e.key];
            if (dir) {
                e.preventDefault();
                applyMove(dir);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [applyMove]);

    return {
        grid: store.grid,
        score: store.score,
        bestScore: store.bestScore,
        gameOver: store.gameOver,
        won: store.won,
        keepPlaying: store.keepPlaying,
        undoCount: store.undoCount,
        swapCount: store.swapCount,
        deleteCount: store.deleteCount,
        powerUpMode: store.powerUpMode,
        swapSelection: store.swapSelection,
        mergedCells: store.mergedCells,
        challengeWon: store.challengeWon,
        initGame,
        applyMove,
        undo,
        handleTileClick,
        cloudSave,
        setPowerUpMode: store.setPowerUpMode,
        setKeepPlaying: store.setKeepPlaying,
    };
}

