/**
 * Tile component with Framer Motion animations.
 * Scales in on spawn and bounces (pop) when tiles merge.
 */
"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

interface TileProps {
    value: number;
    row: number;
    col: number;
    isSelected?: boolean;
    isMerged?: boolean;
    onClick?: () => void;
}

/** Color mapping for each tile value — matches the original 2048 palette. */
const TILE_STYLES: Record<number, { bg: string; text: string; fontSize: string }> = {
    0: { bg: "bg-[#cdc1b4]", text: "text-transparent", fontSize: "text-2xl" },
    2: { bg: "bg-[#eee4da]", text: "text-[#776e65]", fontSize: "text-3xl" },
    4: { bg: "bg-[#ede0c8]", text: "text-[#776e65]", fontSize: "text-3xl" },
    8: { bg: "bg-[#f2b179]", text: "text-white", fontSize: "text-3xl" },
    16: { bg: "bg-[#f59563]", text: "text-white", fontSize: "text-3xl" },
    32: { bg: "bg-[#f67c5f]", text: "text-white", fontSize: "text-3xl" },
    64: { bg: "bg-[#f65e3b]", text: "text-white", fontSize: "text-3xl" },
    128: { bg: "bg-[#edcf72]", text: "text-white", fontSize: "text-2xl" },
    256: { bg: "bg-[#edcc61]", text: "text-white", fontSize: "text-2xl" },
    512: { bg: "bg-[#edc850]", text: "text-white", fontSize: "text-2xl" },
    1024: { bg: "bg-[#edc53f]", text: "text-white", fontSize: "text-xl" },
    2048: { bg: "bg-[#edc22e]", text: "text-white", fontSize: "text-xl" },
};

function getTileStyle(value: number) {
    return TILE_STYLES[value] ?? { bg: "bg-[#3c3a32]", text: "text-white", fontSize: "text-lg" };
}

export default function Tile({ value, row, col, isSelected, isMerged, onClick }: TileProps) {
    const style = getTileStyle(value);
    const controls = useAnimation();

    // Pop animation when a merge happens on this cell
    useEffect(() => {
        if (isMerged && value !== 0) {
            controls.start({
                scale: [1, 1.25, 1],
                transition: { duration: 0.2, ease: "easeOut" },
            });
        }
    }, [isMerged, value, controls]);

    return (
        <motion.div
            key={`${row}-${col}-${value}`}
            layoutId={`tile-${row}-${col}`}
            initial={{ scale: value !== 0 ? 0 : 1, opacity: value !== 0 ? 0 : 1 }}
            animate={controls}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={onClick}
            className={`
        flex items-center justify-center rounded-md font-bold select-none
        ${style.bg} ${style.text} ${style.fontSize}
        w-full h-full
        ${onClick ? "cursor-pointer" : ""}
        ${isSelected ? "ring-4 ring-yellow-400 ring-offset-2" : ""}
        transition-shadow duration-150
      `}
        >
            {value !== 0 ? value : ""}
        </motion.div>
    );
}
