"""
Game state save/load endpoints for cloud sync.
"""
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import GameState
from ..schemas import GameStateSave, GameStateLoad
from ..auth import verify_clerk_token

router = APIRouter(prefix="/api/game", tags=["game"])


@router.post("/save", status_code=status.HTTP_200_OK)
async def save_game(
    payload: GameStateSave,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_clerk_token),
):
    """Save (upsert) the current game grid for the authenticated user."""
    state = db.query(GameState).filter(GameState.user_id == user_id).first()
    if state:
        state.grid_json = json.dumps(payload.grid)
        state.score = payload.score
        state.updated_at = datetime.utcnow()
    else:
        state = GameState(
            user_id=user_id,
            grid_json=json.dumps(payload.grid),
            score=payload.score,
        )
        db.add(state)
    db.commit()
    return {"message": "Game saved successfully"}


@router.get("/load", response_model=GameStateLoad)
async def load_game(
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_clerk_token),
):
    """Load the most recent saved game state for the authenticated user."""
    state = db.query(GameState).filter(GameState.user_id == user_id).first()
    if not state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No saved game found for this user",
        )
    return GameStateLoad(
        grid=json.loads(state.grid_json),
        score=state.score,
        updated_at=state.updated_at,
    )
