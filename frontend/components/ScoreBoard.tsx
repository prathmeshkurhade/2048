/**
 * Score display component — current score and best score.
 */
"use client";

interface ScoreBoardProps {
    score: number;
    bestScore: number;
}

function ScoreBox({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex flex-col items-center bg-[#bbada0] rounded-md px-4 py-2 min-w-[80px]">
            <span className="text-[#eee4da] text-xs font-bold uppercase tracking-wider">{label}</span>
            <span className="text-white text-xl font-bold">{value.toLocaleString()}</span>
        </div>
    );
}

export default function ScoreBoard({ score, bestScore }: ScoreBoardProps) {
    return (
        <div className="flex gap-3">
            <ScoreBox label="Score" value={score} />
            <ScoreBox label="Best" value={bestScore} />
        </div>
    );
}
