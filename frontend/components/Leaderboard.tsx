/**
 * Leaderboard component — fetches top 10 scores from FastAPI.
 */
"use client";

import { useEffect, useState } from "react";
import { fetchLeaderboard, LeaderboardEntry } from "@/lib/api";

const TILE_COLORS: Record<number, string> = {
    2048: "text-[#edc22e]",
    1024: "text-[#edc53f]",
    512: "text-[#edc850]",
    256: "text-[#edcc61]",
    128: "text-[#edcf72]",
};

function getTileColor(tile: number) {
    return TILE_COLORS[tile] ?? "text-[#776e65]";
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
                    <div key={i} className="h-14 bg-[#eee4da] rounded-xl animate-pulse" />
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

                    {/* Highest tile */}
                    <span className={`font-bold text-sm ${getTileColor(entry.highest_tile)}`}>
                        {entry.highest_tile}
                    </span>

                    {/* Score */}
                    <span className="font-extrabold text-[#776e65] text-lg">
                        {entry.score_value.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    );
}
