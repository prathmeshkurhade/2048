/**
 * Power-ups control bar — Undo, Swap, Delete.
 */
"use client";

import { PowerUpMode } from "@/store/gameStore";

interface PowerUpsProps {
    undoCount: number;
    swapCount: number;
    deleteCount: number;
    powerUpMode: PowerUpMode;
    onUndo: () => void;
    onToggleSwap: () => void;
    onToggleDelete: () => void;
}

interface PowerButtonProps {
    label: string;
    icon: string;
    count: number;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    color: string;
}

function PowerButton({ label, icon, count, active, disabled, onClick, color }: PowerButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={`${label} (${count} left)`}
            className={`
        flex flex-col items-center gap-1 px-4 py-2 rounded-lg font-semibold text-sm
        transition-all duration-200 select-none
        ${disabled ? "opacity-40 cursor-not-allowed bg-gray-200 text-gray-400" :
                    active ? `${color} text-white shadow-lg scale-105 ring-2 ring-white ring-offset-1` :
                        `${color} text-white hover:opacity-90 hover:scale-105 active:scale-95`}
      `}
        >
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
            <span className="text-xs opacity-80">×{count}</span>
        </button>
    );
}

export default function PowerUps({
    undoCount, swapCount, deleteCount,
    powerUpMode, onUndo, onToggleSwap, onToggleDelete,
}: PowerUpsProps) {
    return (
        <div className="flex gap-3 justify-center flex-wrap">
            <PowerButton
                label="Undo"
                icon="↩"
                count={undoCount}
                disabled={undoCount === 0}
                onClick={onUndo}
                color="bg-[#8f7a66]"
            />
            <PowerButton
                label="Swap"
                icon="⇄"
                count={swapCount}
                active={powerUpMode === "swap"}
                disabled={swapCount === 0}
                onClick={onToggleSwap}
                color="bg-[#f59563]"
            />
            <PowerButton
                label="Delete"
                icon="✕"
                count={deleteCount}
                active={powerUpMode === "delete"}
                disabled={deleteCount === 0}
                onClick={onToggleDelete}
                color="bg-[#f65e3b]"
            />
        </div>
    );
}
