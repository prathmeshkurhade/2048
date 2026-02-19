/**
 * Leaderboard component — fetches top 10 scores from FastAPI.
 */
"use client";

import { useEffect, useState } from "react";
import { fetchLeaderboard, LeaderboardEntry } from "@/lib/api";

/** Background + text color for tile badge */
function getTileBadgeStyle(tile: number): string {
    if (tile >= 2048) return "bg-[#edc22e] text-white";
    if (tile >= 1024) return "bg-[#edc53f] text-white";
    if (tile >= 512) return "bg-[#edc850] text-white";
    if (tile >= 256) return "bg-[#edcc61] text-white";
    if (tile >= 128) return "bg-[#edcf72] text-white";
    if (tile >= 64) return "bg-[#f65e3b] text-white";
    if (tile >= 32) return "bg-[#f67c5f] text-white";
    if (tile >= 16) return "bg-[#f59563] text-white";
    return "bg-[#eee4da] text-[#776e65]";
}

export default function Leaderboard() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLeaderboard()
            .then(setEntries)
            .catch(() => setError("Failed to load leaderboard. Is the API running?"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col gap-3 w-full max-w-lg mx-auto">
                {Array(5).fill(null).map((_, i) => (
                    <div key={i} className="h-16 bg-[#eee4da] rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 bg-red-50 rounded-xl p-6">
                <p className="font-semibold">{error}</p>
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="text-center text-[#bbada0] bg-[#faf8ef] rounded-xl p-8">
                <p className="text-2xl mb-2">🏆</p>
                <p className="font-semibold">No scores yet. Be the first!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 w-full max-w-lg mx-auto">
            {/* Column headers */}
            <div className="flex items-center gap-4 px-5 pb-1 text-xs font-semibold text-[#bbada0] uppercase tracking-wide">
                <span className="w-8 text-center">#</span>
                <span className="flex-1">Player</span>
                <span className="text-center w-16">Best Tile</span>
                <span className="text-right w-20">Score</span>
            </div>

            {entries.map((entry) => (
                <div
                    key={entry.rank}
                    className={`
                        flex items-center gap-4 px-5 py-3 rounded-xl
                        ${entry.rank === 1 ? "bg-[#edcf72] shadow-md" :
                            entry.rank === 2 ? "bg-[#eee4da]" :
                                entry.rank === 3 ? "bg-[#ede0c8]" : "bg-white"}
                    `}
                >
                    {/* Rank */}
                    <span className="text-2xl font-extrabold text-[#776e65] w-8 text-center">
                        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                    </span>

                    {/* Username */}
                    <span className="flex-1 font-bold text-[#776e65] truncate">{entry.username}</span>

                    {/* Highest tile — colored badge */}
                    <span className={`inline-flex items-center justify-center rounded-lg px-2 py-1 text-xs font-black w-16 ${getTileBadgeStyle(entry.highest_tile)}`}>
                        {entry.highest_tile}
                    </span>

                    {/* Score */}
                    <span className="font-extrabold text-[#776e65] text-lg w-20 text-right">
                        {entry.score_value.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    );
}
