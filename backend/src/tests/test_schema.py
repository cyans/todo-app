"""
Test suite for Pydantic schemas
@TEST:BACKEND-API-001:SCHEMA - Pydantic 스키마 테스트
"""

import pytest
from datetime import datetime
from typing import List
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import to be tested (will fail until implemented)
from schema import TodoCreate, TodoUpdate, TodoResponse, TodoList
from model import Base, Todo

@pytest.fixture
def test_db():
    """Create in-memory SQLite database for testing"""
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Create tables
    Base.metadata.create_all(bind=engine)

    # Create a session
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Clean up
        Base.metadata.drop_all(bind=engine)

class TestTodoCreateSchema:
    """TodoCreate schema test cases"""

    def test_todo_create_valid(self):
        """Test TodoCreate with valid data"""
        data = {
            "title": "Test Todo",
            "description": "This is a test todo item"
        }

        schema = TodoCreate(**data)
        assert schema.title == "Test Todo"
        assert schema.description == "This is a test todo item"

    def test_todo_create_minimal(self):
        """Test TodoCreate with minimal data (title only)"""
        data = {"title": "Minimal Todo"}
        schema = TodoCreate(**data)
        assert schema.title == "Minimal Todo"
        assert schema.description is None

    def test_todo_create_validation_missing_title(self):
        """Test TodoCreate validation fails without title"""
        data = {"description": "Missing title"}
        with pytest.raises(ValueError):
            TodoCreate(**data)

    def test_todo_create_title_length_validation(self):
        """Test TodoCreate title length validation"""
        # Valid title
        valid_title = "a" * 200
        schema = TodoCreate(title=valid_title)
        assert len(schema.title) == 200

        # Invalid title
        invalid_title = "a" * 201
        with pytest.raises(ValueError):
            TodoCreate(title=invalid_title)

    def test_todo_create_description_length_validation(self):
        """Test TodoCreate description length validation"""
        # Valid description
        valid_description = "a" * 1000
        schema = TodoCreate(title="Test", description=valid_description)
        assert len(schema.description) == 1000

        # Invalid description
        invalid_description = "a" * 1001
        with pytest.raises(ValueError):
            TodoCreate(title="Test", description=invalid_description)

class TestTodoUpdateSchema:
    """TodoUpdate schema test cases"""

    def test_todo_update_all_fields(self):
        """Test TodoUpdate with all fields"""
        data = {
            "title": "Updated Title",
            "description": "Updated description",
            "completed": True
        }
        schema = TodoUpdate(**data)
        assert schema.title == "Updated Title"
        assert schema.description == "Updated description"
        assert schema.completed is True

    def test_todo_update_partial(self):
        """Test TodoUpdate with partial fields"""
        data = {"title": "Updated Title"}
        schema = TodoUpdate(**data)
        assert schema.title == "Updated Title"
        assert schema.description is None
        assert schema.completed is False  # default

    def test_todo_update_no_fields(self):
        """Test TodoUpdate with no fields (should default all)"""
        schema = TodoUpdate()
        assert schema.title is None
        assert schema.description is None
        assert schema.completed is False

    def test_todo_update_validation_missing_title(self):
        """Test TodoUpdate validation for title"""
        data = {"description": "Missing title"}
        schema = TodoUpdate(**data)
        assert schema.title is None
        assert schema.description == "Missing title"

class TestTodoResponseSchema:
    """TodoResponse schema test cases"""

    def test_todo_response_with_database_model(self, test_db):
        """Test TodoResponse conversion from database model"""
        # Create database todo
        db_todo = Todo(title="Test Todo", description="Description")
        test_db.add(db_todo)
        test_db.commit()
        test_db.refresh(db_todo)

        # Convert to response schema
        response = TodoResponse.from_orm(db_todo)

        assert response.id == db_todo.id
        assert response.title == db_todo.title
        assert response.description == db_todo.description
        assert response.completed == db_todo.completed
        assert response.created_at == db_todo.created_at
        assert response.updated_at == db_todo.updated_at

    def test_todo_response_dict_conversion(self, test_db):
        """Test TodoResponse dict conversion"""
        # Create database todo
        db_todo = Todo(title="Test Dict", description="Dict description")
        test_db.add(db_todo)
        test_db.commit()
        test_db.refresh(db_todo)

        response = TodoResponse.from_orm(db_todo)
        response_dict = response.dict()

        assert response_dict["id"] == db_todo.id
        assert response_dict["title"] == db_todo.title
        assert response_dict["description"] == db_todo.description
        assert response_dict["completed"] == db_todo.completed

class TestTodoListSchema:
    """TodoList schema test cases"""

    def test_todo_list_empty(self):
        """Test TodoList with empty list"""
        list_response = TodoList(todos=[], total=0, skip=0, limit=10)
        assert len(list_response.todos) == 0
        assert list_response.total == 0
        assert list_response.skip == 0
        assert list_response.limit == 10

    def test_todo_list_with_items(self, test_db):
        """Test TodoList with multiple items"""
        # Create multiple todos
        todos = [
            Todo(title=f"Todo {i}", description=f"Description {i}")
            for i in range(3)
        ]

        for todo in todos:
            test_db.add(todo)
        test_db.commit()

        # Refresh all todos
        for todo in todos:
            test_db.refresh(todo)

        # Convert to list response
        todo_responses = [TodoResponse.from_orm(todo) for todo in todos]
        list_response = TodoList(todos=todo_responses, total=3, skip=0, limit=10)

        assert len(list_response.todos) == 3
        assert list_response.total == 3
        assert list_response.skip == 0
        assert list_response.limit == 10
        assert list_response.todos[0].title == "Todo 0"

    def test_todo_list_pagination_info(self, test_db):
        """Test TodoList pagination metadata"""
        todo_responses = []
        list_response = TodoList(
            todos=todo_responses,
            total=25,
            skip=10,
            limit=15
        )

        assert len(list_response.todos) == 0
        assert list_response.total == 25
        assert list_response.skip == 10
        assert list_response.limit == 15