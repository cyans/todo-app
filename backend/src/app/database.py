"""
Database configuration and connection management
@CODE:BACKEND-API-001:DB - 데이터베이스 설정
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from app.model import Base

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todos.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create database tables"""
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all database tables (for testing)"""
    Base.metadata.drop_all(bind=engine)

# Configure async database support (for future scalability)
# Note: async_engine requires SQLAlchemy 2.0+ and aiosqlite
try:
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    ASYNC_DATABASE_URL = os.getenv("ASYNC_DATABASE_URL", "sqlite+aiosqlite:///./todos.db")
    async_engine = create_async_engine(ASYNC_DATABASE_URL)
    AsyncSessionLocal = sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )
except ImportError:
    # Fallback if async dependencies are not available
    ASYNC_DATABASE_URL = None
    async_engine = None
    AsyncSessionLocal = None