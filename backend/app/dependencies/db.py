"""
app/dependencies/db.py
───────────────────────
Re-export get_async_session for use as a FastAPI Depends() across routers.
"""
from app.core.database import get_async_session

__all__ = ["get_async_session"]
