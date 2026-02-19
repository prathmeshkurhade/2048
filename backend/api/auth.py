"""
Clerk JWT verification dependency for FastAPI.
Fetches the JWKS from Clerk and validates the Authorization Bearer token.
"""
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from .config import settings

security = HTTPBearer()

# Cache JWKS to avoid fetching on every request
_jwks_cache: dict | None = None


async def _get_jwks() -> dict:
    """Fetch and cache Clerk's JSON Web Key Set."""
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient() as client:
            resp = await client.get(settings.CLERK_JWKS_URL)
            resp.raise_for_status()
            _jwks_cache = resp.json()
    return _jwks_cache


async def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    Verify a Clerk JWT token from the Authorization header.
    Returns the Clerk user_id (sub claim) on success.
    Raises HTTP 401 on failure.
    """
    token = credentials.credentials
    try:
        jwks = await _get_jwks()
        # Decode without audience verification (Clerk tokens use azp claim)
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject claim",
            )
        return user_id
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
        )
