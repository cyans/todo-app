"""
Todo API endpoints
@CODE:BACKEND-API-001:TODOS - Todo API 엔드포인트
"""

import sys
from pathlib import Path

# Add src to Python path
src_path = str(Path(__file__).parent.parent.parent)
if src_path not in sys.path:
    sys.path.insert(0, src_path)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from model import Todo
from schema import TodoCreate, TodoUpdate, TodoResponse, TodoList

router = APIRouter(prefix="/api/todos", tags=["Todos"])

@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    """
    Create a new todo item

    - **title**: Todo title (1-200 characters, required)
    - **description**: Optional description (max 1000 characters)
    """
    # Check if todo with same title already exists
    existing_todo = db.query(Todo).filter(Todo.title == todo.title).first()
    if existing_todo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Todo with this title already exists"
        )

    # Create new todo
    db_todo = Todo(
        title=todo.title,
        description=todo.description
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)

    return db_todo

@router.get("", response_model=TodoList)
async def get_todos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all todos with pagination

    - **skip**: Number of items to skip (default: 0)
    - **limit**: Maximum number of items to return (default: 100, max: 1000)
    """
    # Validate limit
    if limit > 1000:
        limit = 1000

    # Get todos with pagination
    todos = db.query(Todo).offset(skip).limit(limit).all()
    total = db.query(Todo).count()

    return TodoList(
        todos=todos,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(todo_id: int, db: Session = Depends(get_db)):
    """
    Get a specific todo by ID

    - **todo_id**: The ID of the todo to retrieve
    """
    todo = db.query(Todo).filter(Todo.id == todo_id).first()

    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found"
        )

    return todo

@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: int,
    todo_update: TodoUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing todo

    - **todo_id**: The ID of the todo to update
    - **title**: Updated title (optional)
    - **description**: Updated description (optional)
    - **completed**: Updated completion status (optional)
    """
    # Get existing todo
    todo = db.query(Todo).filter(Todo.id == todo_id).first()

    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found"
        )

    # Update fields
    update_data = todo_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(todo, field, value)

    db.commit()
    db.refresh(todo)

    return todo

@router.delete("/{todo_id}")
async def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    """
    Delete a todo item

    - **todo_id**: The ID of the todo to delete
    """
    # Get todo to delete
    todo = db.query(Todo).filter(Todo.id == todo_id).first()

    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found"
        )

    # Delete todo
    db.delete(todo)
    db.commit()

    return {"message": f"Todo with id {todo_id} deleted successfully"}