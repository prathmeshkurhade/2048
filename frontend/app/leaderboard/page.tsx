/**
 * Leaderboard page.
 */
import Link from "next/link";
import Leaderboard from "@/components/Leaderboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Leaderboard — 2048",
    description: "Top 10 global high scores for the 2048 game.",
};

export default function LeaderboardPage() {
    return (
        <main className="flex flex-col items-center min-h-screen py-12 px-4 gap-8">
            <div className="w-full max-w-lg">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-extrabold text-[#776e65]">🏆 Leaderboard</h1>
                    <Link
                        href="/"
                        className="text-sm bg-[#8f7a66] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                        ← Play
                    </Link>
                </div>
                <Leaderboard />
            </div>
        </main>
    );
}
