/**
 * Header component with game title, scores, and Clerk auth buttons.
 */
"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import ScoreBoard from "./ScoreBoard";

interface HeaderProps {
    score: number;
    bestScore: number;
    onNewGame: () => void;
}

export default function Header({ score, bestScore, onNewGame }: HeaderProps) {
    return (
        <header className="w-full max-w-[480px] mx-auto">
            {/* Top row: title + auth */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-5xl font-extrabold text-[#776e65] tracking-tight">2048</h1>

                <div className="flex items-center gap-3">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-sm bg-[#8f7a66] text-white px-3 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                                Sign in to Save
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </div>

            {/* Bottom row: scores + controls */}
            <div className="flex items-center justify-between">
                <ScoreBoard score={score} bestScore={bestScore} />

                <div className="flex gap-2">
                    <Link
                        href="/leaderboard"
                        className="text-sm bg-[#bbada0] text-[#776e65] px-3 py-2 rounded-lg font-semibold hover:bg-[#a89890] transition-colors"
                    >
                        🏆 Board
                    </Link>
                    <button
                        onClick={onNewGame}
                        className="text-sm bg-[#8f7a66] text-white px-3 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                        New Game
                    </button>
                </div>
            </div>
        </header>
    );
}
