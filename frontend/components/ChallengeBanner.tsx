/**
 * ChallengeBanner — shows the ₹100 prize challenge and winner status.
 */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchChallenge, ChallengeStatus } from "@/lib/api";

export default function ChallengeBanner({ justWon }: { justWon: boolean }) {
    const [status, setStatus] = useState<ChallengeStatus | null>(null);

    useEffect(() => {
        fetchChallenge()
            .then(setStatus)
            .catch(() => { }); // silently fail if backend is unavailable
    }, [justWon]); // re-fetch when justWon changes

    // If backend failed to load, show a static promo banner
    const claimed = status?.claimed ?? false;
    const winner = status?.winner_username ?? null;

    return (
        <>
            {/* Static promo banner always visible */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                    w-full rounded-xl px-4 py-3 flex items-center gap-3 mb-4
                    ${claimed
                        ? "bg-gray-200 border border-gray-300"
                        : "bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-orange-200"
                    }
                `}
            >
                <span className="text-2xl">{claimed ? "🏆" : "🎯"}</span>
                <div className="flex-1">
                    {claimed ? (
                        <>
                            <p className="font-bold text-gray-700 text-sm">Challenge Claimed!</p>
                            <p className="text-gray-500 text-xs">
                                <span className="font-semibold">{winner}</span> was first to reach the 16384 tile and won ₹100!
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="font-bold text-white text-sm drop-shadow">
                                🏅 First to hit the <span className="text-yellow-900">16384</span> tile wins <span className="text-yellow-900">₹100</span>!
                            </p>
                            <p className="text-yellow-100 text-xs">Nobody has claimed it yet — can you do it?</p>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Celebration overlay when THIS player just won */}
            <AnimatePresence>
                {justWon && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl"
                        >
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">YOU WON!</h2>
                            <p className="text-lg text-gray-600 mb-4">
                                You&apos;re the <span className="font-bold text-orange-500">FIRST</span> to reach the 16384 tile!
                            </p>
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 mb-6">
                                <p className="text-white font-black text-4xl">₹100</p>
                                <p className="text-yellow-100 text-sm">prize is yours!</p>
                            </div>
                            <p className="text-gray-500 text-xs">
                                Contact the organizer to claim your reward 🏆
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
