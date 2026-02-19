/**
 * Win banner overlay — shown when the player reaches 2048.
 */
"use client";

import { motion } from "framer-motion";

interface WinBannerProps {
    onKeepPlaying: () => void;
    onRestart: () => void;
}

export default function WinBanner({ onKeepPlaying, onRestart }: WinBannerProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[#edcf72]/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl"
            >
                <h2 className="text-5xl font-extrabold text-[#776e65]">You Win! 🎉</h2>
                <p className="text-[#bbada0] text-center">You reached 2048! Keep going for a higher score.</p>
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onKeepPlaying}
                        className="flex-1 bg-[#f59563] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                        Keep Playing
                    </button>
                    <button
                        onClick={onRestart}
                        className="flex-1 bg-[#8f7a66] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                        New Game
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
