"""
Challenge router — tracks and awards the ₹100 prize to the first player
who reaches the 16384 tile.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from api.database import get_db
from api.models import User

router = APIRouter(prefix="/api/challenge", tags=["challenge"])

# In-memory store (persists as long as the server is up).
# For production you'd store this in the DB, but this is simple and effective.
_challenge_state: dict = {
    "claimed": False,
    "winner_username": None,
    "winner_user_id": None,
}


class ClaimRequest(BaseModel):
    username: str


class ChallengeStatus(BaseModel):
    claimed: bool
    winner_username: Optional[str] = None


@router.get("", response_model=ChallengeStatus)
def get_challenge_status():
    """Return current challenge status — whether it's been claimed and by whom."""
    return ChallengeStatus(
        claimed=_challenge_state["claimed"],
        winner_username=_challenge_state["winner_username"],
    )


@router.post("/claim", response_model=ChallengeStatus)
def claim_challenge(
    body: ClaimRequest,
    db: Session = Depends(get_db),
):
    """
    Claim the ₹100 prize. Only the FIRST call succeeds; all subsequent calls
    return the existing winner without error.
    """
    if _challenge_state["claimed"]:
        # Already claimed — just return current state
        return ChallengeStatus(
            claimed=True,
            winner_username=_challenge_state["winner_username"],
        )

    # Mark as claimed
    _challenge_state["claimed"] = True
    _challenge_state["winner_username"] = body.username

    return ChallengeStatus(
        claimed=True,
        winner_username=body.username,
    )
