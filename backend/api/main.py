"""
FastAPI application entry point.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import get_engine, Base
from .routers import scores, game, challenge
from .config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables on startup (lazy — only connects when server starts)."""
    try:
        Base.metadata.create_all(bind=get_engine())
        print("✓ Database tables created/verified")
    except Exception as e:
        print(f"⚠ Database connection failed: {e}")
        print("  Check your DATABASE_URL in api/.env")
    yield  # App runs here


app = FastAPI(
    title="2048 Game API",
    description="Backend API for the 2048 game clone with Clerk authentication",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(scores.router)
app.include_router(game.router)
app.include_router(challenge.router)


# ── Health Check ───────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "service": "2048-api"}
