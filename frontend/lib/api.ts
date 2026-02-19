/**
 * API client for communicating with the FastAPI backend.
 */
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
});

// ── Score ──────────────────────────────────────────────────────────────────────

export async function submitScore(
    score: number,
    highestTile: number,
    username: string,
    token: string
) {
    const { data } = await api.post(
        "/api/score/submit",
        { score, highest_tile: highestTile, username },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
}

// ── Leaderboard ────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
    rank: number;
    username: string;
    score_value: number;
    highest_tile: number;
    played_at: string;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    const { data } = await api.get<{ entries: LeaderboardEntry[] }>("/api/leaderboard");
    return data.entries;
}

// ── Game State ─────────────────────────────────────────────────────────────────

export async function saveGame(
    grid: number[][],
    score: number,
    token: string
) {
    const { data } = await api.post(
        "/api/game/save",
        { grid, score },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
}

export async function loadGame(token: string) {
    const { data } = await api.get<{ grid: number[][]; score: number; updated_at: string }>(
        "/api/game/load",
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
}

// ── Health ─────────────────────────────────────────────────────────────────────

export async function healthCheck() {
    const { data } = await api.get("/health");
    return data;
}
