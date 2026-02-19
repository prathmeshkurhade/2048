/**
 * Game Over overlay modal.
 */
"use client";

import { motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

interface GameOverProps {
    score: number;
    onRestart: () => void;
}

export default function GameOver({ score, onRestart }: GameOverProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[#bbada0]/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl"
            >
                <h2 className="text-4xl font-extrabold text-[#776e65]">Game Over!</h2>
                <p className="text-[#bbada0] text-lg">
                    Final Score: <span className="font-bold text-[#776e65]">{score.toLocaleString()}</span>
                </p>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={onRestart}
                        className="w-full bg-[#8f7a66] text-white py-3 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
                    >
                        Try Again
                    </button>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="w-full bg-[#f59563] text-white py-3 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity">
                                Sign In to Save Score
                            </button>
                        </SignInButton>
                    </SignedOut>

                    <SignedIn>
                        <p className="text-center text-sm text-green-600 font-semibold">
                            ✓ Score submitted to leaderboard!
                        </p>
                    </SignedIn>
                </div>
            </motion.div>
        </motion.div>
    );
}
