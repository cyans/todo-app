"""
Pydantic schemas for data validation and serialization
@CODE:BACKEND-API-001:SCHEMA - Pydantic 스키마 구현
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from pydantic import ConfigDict

# Alias for backward compatibility
try:
    from pydantic import model_validator
except ImportError:
    # Fallback for older Pydantic versions
    from pydantic import field_validator as model_validator

class TodoCreate(BaseModel):
    """Todo creation schema - request validation"""
    title: str = Field(..., min_length=1, max_length=200,
                       description="Todo title (1-200 characters)")
    description: Optional[str] = Field(None, max_length=1000,
                                     description="Optional todo description (max 1000 characters)")

    @field_validator('title')
    @classmethod
    def title_must_not_be_empty(cls, v):
        """Validate title is not empty or whitespace only"""
        if not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()

class TodoUpdate(BaseModel):
    """Todo update schema - request validation"""
    title: Optional[str] = Field(None, min_length=1, max_length=200,
                                description="Updated todo title (1-200 characters)")
    description: Optional[str] = Field(None, max_length=1000,
                                      description="Updated description (max 1000 characters)")
    completed: Optional[bool] = Field(False,
                                     description="Todo completion status")

    @field_validator('title')
    @classmethod
    def title_must_not_be_empty(cls, v):
        """Validate title is not empty if provided"""
        if v is not None and not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip() if v is not None else v

    model_config = ConfigDict(
        populate_by_name=True,
        use_enum_values=True
    )

class TodoResponse(BaseModel):
    """Todo response schema - API response format"""
    id: int
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,  # Pydantic v2 equivalent of from_orm
        populate_by_name=True
    )

class TodoList(BaseModel):
    """Todo list response schema with pagination"""
    todos: List[TodoResponse]
    total: int
    skip: int
    limit: int

    model_config = ConfigDict(
        populate_by_name=True,
        use_enum_values=True
    )