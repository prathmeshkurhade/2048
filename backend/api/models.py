"""
SQLAlchemy ORM models for User, Score, and GameState.
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    """Represents a user synced from Clerk."""
    __tablename__ = "users"

    id = Column(String, primary_key=True)  # Clerk user_id (e.g. "user_abc123")
    username = Column(String, nullable=False, default="Anonymous")
    created_at = Column(DateTime, default=datetime.utcnow)

    scores = relationship("Score", back_populates="user", cascade="all, delete-orphan")
    game_states = relationship("GameState", back_populates="user", cascade="all, delete-orphan")


class Score(Base):
    """Represents a submitted game score."""
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    score_value = Column(Integer, nullable=False)
    highest_tile = Column(Integer, nullable=False, default=0)
    played_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="scores")


class GameState(Base):
    """Stores a saved game grid for cloud sync."""
    __tablename__ = "game_states"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    grid_json = Column(Text, nullable=False)   # JSON-serialized 4x4 grid
    score = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="game_states")
