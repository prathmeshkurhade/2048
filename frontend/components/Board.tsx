/**
 * Game board component — 4x4 grid with touch/swipe support.
 * Animates a directional nudge on each move for a sliding feel.
 */
"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tile from "./Tile";
import { Grid, PowerUpMode, SwapSelection } from "@/store/gameStore";

interface BoardProps {
    grid: Grid;
    powerUpMode: PowerUpMode;
    swapSelection: SwapSelection | null;
    mergedCells: Set<string>;
    lastMoveDirection: "left" | "right" | "up" | "down" | null;
    onTileClick: (row: number, col: number) => void;
    onSwipe: (direction: "left" | "right" | "up" | "down") => void;
}

/** Convert a move direction to a quick translate offset */
function getSlideOffset(dir: "left" | "right" | "up" | "down" | null): { x: number; y: number } {
    switch (dir) {
        case "left": return { x: -8, y: 0 };
        case "right": return { x: 8, y: 0 };
        case "up": return { x: 0, y: -8 };
        case "down": return { x: 0, y: 8 };
        default: return { x: 0, y: 0 };
    }
}

export default function Board({ grid, powerUpMode, swapSelection, mergedCells, lastMoveDirection, onTileClick, onSwipe }: BoardProps) {
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const MIN_SWIPE = 30;

    const handleTouchStart = (e: React.TouchEvent) => {
        const t = e.touches[0];
        touchStart.current = { x: t.clientX, y: t.clientY };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStart.current) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStart.current.x;
        const dy = t.clientY - touchStart.current.y;
        touchStart.current = null;

        if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return;

        if (Math.abs(dx) > Math.abs(dy)) {
            onSwipe(dx > 0 ? "right" : "left");
        } else {
            onSwipe(dy > 0 ? "down" : "up");
        }
    };

    const isSelected = (r: number, c: number) =>
        swapSelection?.row === r && swapSelection?.col === c;

    const isClickable = powerUpMode !== "none";

    const slideOffset = getSlideOffset(lastMoveDirection);

    return (
        <div
            className="relative bg-[#bbada0] rounded-xl p-3 touch-none select-none overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background grid cells */}
            <div className="grid grid-cols-4 gap-3">
                {Array(16).fill(null).map((_, i) => (
                    <div key={i} className="bg-[#cdc1b4] rounded-md w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]" />
                ))}
            </div>

            {/* Tile layer — nudges in move direction */}
            <motion.div
                className="absolute inset-3 grid grid-cols-4 gap-3"
                animate={{ x: slideOffset.x, y: slideOffset.y }}
                transition={{ type: "tween", duration: 0.08, ease: "easeOut" }}
            >
                <AnimatePresence>
                    {grid.map((row, r) =>
                        row.map((value, c) => (
                            <div
                                key={`${r}-${c}`}
                                className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]"
                            >
                                <Tile
                                    value={value}
                                    row={r}
                                    col={c}
                                    isSelected={isSelected(r, c)}
                                    isMerged={mergedCells.has(`${r}-${c}`)}
                                    onClick={isClickable ? () => onTileClick(r, c) : undefined}
                                />
                            </div>
                        ))
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
