"""
Score submission and leaderboard endpoints.
"""
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import User, Score
from ..schemas import ScoreSubmit, ScoreResponse, LeaderboardEntry, LeaderboardResponse
from ..auth import verify_clerk_token

router = APIRouter(prefix="/api", tags=["scores"])


@router.post("/score/submit", response_model=ScoreResponse, status_code=status.HTTP_201_CREATED)
async def submit_score(
    payload: ScoreSubmit,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_clerk_token),
):
    """
    Submit a game score. Requires a valid Clerk JWT.
    Upserts the User record, then inserts a new Score row.
    """
    # Upsert user (create if not exists)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, username=payload.username or "Anonymous")
        db.add(user)
    elif payload.username and payload.username != "Anonymous":
        user.username = payload.username

    # Insert score
    score = Score(
        user_id=user_id,
        score_value=payload.score,
        highest_tile=payload.highest_tile,
        played_at=datetime.utcnow(),
    )
    db.add(score)
    db.commit()
    db.refresh(score)
    return score


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(db: Session = Depends(get_db)):
    """
    Return the top 10 players by their all-time best score.
    Each user appears at most once (their highest score only).
    """
    # Subquery: one row per user with their max score
    best_per_user = (
        db.query(
            Score.user_id,
            func.max(Score.score_value).label("best_score"),
        )
        .group_by(Score.user_id)
        .subquery()
    )

    # Join back to Score to get the full row (highest_tile, played_at),
    # then join User for the username.
    top_scores = (
        db.query(Score, User.username)
        .join(
            best_per_user,
            (Score.user_id == best_per_user.c.user_id) &
            (Score.score_value == best_per_user.c.best_score),
        )
        .join(User, Score.user_id == User.id)
        .order_by(Score.score_value.desc())
        .limit(10)
        .all()
    )

    entries: List[LeaderboardEntry] = [
        LeaderboardEntry(
            rank=idx + 1,
            username=username,
            score_value=score.score_value,
            highest_tile=score.highest_tile,
            played_at=score.played_at,
        )
        for idx, (score, username) in enumerate(top_scores)
    ]

    return LeaderboardResponse(entries=entries)
