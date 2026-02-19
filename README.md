# 2048 — Full-Stack Clone

A production-grade 2048 game with a **Next.js** frontend and a **FastAPI** backend.

## Project Structure

```
2048/
├── frontend/          # Next.js app (React, TypeScript, Tailwind, Framer Motion)
│   ├── app/           # Next.js App Router pages
│   ├── components/    # UI components (Board, Tile, Header, PowerUps, etc.)
│   ├── hooks/         # Game logic hook (useGameLogic)
│   ├── lib/           # API client (axios)
│   ├── store/         # Zustand game store
│   ├── public/        # Static assets
│   └── package.json
│
└── backend/           # FastAPI app (Python)
    ├── api/           # FastAPI source
    │   ├── main.py
    │   ├── routers/   # /score, /leaderboard, /game routes
    │   ├── models.py
    │   ├── schemas.py
    │   ├── auth.py
    │   ├── database.py
    │   └── requirements.txt
    └── venv/          # Python virtual environment (not committed)
```

## Getting Started

### Backend (FastAPI)

```bash
cd backend
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r api/requirements.txt
uvicorn api.main:app --reload --port 8000
```

API will be available at `http://localhost:8000`

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

App will be available at `http://localhost:3000`

## Tech Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Zustand |
| Backend  | FastAPI, SQLAlchemy, Supabase (PostgreSQL) |
| Auth     | Clerk                                     |

## Environment Variables

**`frontend/.env.local`**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**`backend/api/.env`**
```
DATABASE_URL=...
CLERK_SECRET_KEY=...
```
