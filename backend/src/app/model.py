"""
Todo data models using SQLAlchemy ORM
@CODE:BACKEND-API-001:MODEL - SQLAlchemy 모델 구현
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, Session

Base = declarative_base()

class Todo(Base):
    """Todo 모델 - 할 일 항목 데이터베이스 테이블"""
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String(1000), nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return (f"Todo(id={self.id}, title='{self.title}', "
                f"completed={self.completed})")

    def __str__(self):
        return self.__repr__()

    def to_dict(self):
        """Convert Todo instance to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }