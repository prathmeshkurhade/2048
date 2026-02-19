"""
Pydantic schemas for request/response validation.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


# ── Score Schemas ──────────────────────────────────────────────────────────────

class ScoreSubmit(BaseModel):
    """Payload for submitting a game score."""
    score: int
    highest_tile: int
    username: Optional[str] = "Anonymous"


class ScoreResponse(BaseModel):
    """Response after a score is saved."""
    id: int
    user_id: str
    score_value: int
    highest_tile: int
    played_at: datetime

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    """A single leaderboard row."""
    rank: int
    username: str
    score_value: int
    highest_tile: int
    played_at: datetime


class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]


# ── Game State Schemas ─────────────────────────────────────────────────────────

class GameStateSave(BaseModel):
    """Payload for saving game state."""
    grid: List[List[int]]   # 4x4 grid of tile values (0 = empty)
    score: int


class GameStateLoad(BaseModel):
    """Response for loading game state."""
    grid: List[List[int]]
    score: int
    updated_at: datetime
