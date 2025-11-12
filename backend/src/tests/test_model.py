"""
Test suite for Todo data models
@TEST:BACKEND-API-001:MODEL - Todo 데이터 모델 테스트
"""

import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Import to be tested (will fail until implemented)
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

class TestTodoModel:
    """Todo model test cases"""

    def test_todo_creation_basic(self, test_db):
        """Test basic Todo creation"""
        # Create a todo item
        todo = Todo(
            title="Test Todo",
            description="This is a test todo item"
        )

        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        # Assertions
        assert todo.id is not None
        assert todo.title == "Test Todo"
        assert todo.description == "This is a test todo item"
        assert todo.completed is False
        assert isinstance(todo.created_at, datetime)
        assert isinstance(todo.updated_at, datetime)

    def test_todo_creation_minimal(self, test_db):
        """Test Todo creation with minimal data (title only)"""
        todo = Todo(title="Minimal Todo")

        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        assert todo.id is not None
        assert todo.title == "Minimal Todo"
        assert todo.description is None
        assert todo.completed is False

    def test_todo_title_length_validation(self, test_db):
        """Test Todo title length validation (should be <= 200 chars)"""
        # Valid title
        long_title = "a" * 200
        todo = Todo(title=long_title, description="Valid long title")

        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        assert len(todo.title) == 200

        # Invalid title (should fail during model creation/validation)
        with pytest.raises(Exception):  # Should raise appropriate validation error
            invalid_todo = Todo(title="a" * 201, description="Invalid title length")
            test_db.add(invalid_todo)
            test_db.commit()

    def test_todo_description_length_validation(self, test_db):
        """Test Todo description length validation (should be <= 1000 chars)"""
        # Valid description
        long_description = "a" * 1000
        todo = Todo(title="Test", description=long_description)

        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        assert len(todo.description) == 1000

        # Invalid description (should fail during model creation/validation)
        with pytest.raises(Exception):  # Should raise appropriate validation error
            invalid_todo = Todo(title="Test", description="a" * 1001)
            test_db.add(invalid_todo)
            test_db.commit()

    def test_todo_completed_status_default(self, test_db):
        """Test Todo completed status defaults to False"""
        todo = Todo(title="Test Completed Status")

        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        assert todo.completed is False

    def test_todo_update_timestamps(self, test_db):
        """Test that updated_at is updated when todo is modified"""
        # Create todo
        todo = Todo(title="Original Title")
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        original_updated_at = todo.updated_at

        # Wait a tiny bit to ensure timestamp difference
        import time
        time.sleep(0.01)

        # Update todo
        todo.title = "Updated Title"
        test_db.commit()
        test_db.refresh(todo)

        assert todo.updated_at > original_updated_at

    def test_todo_string_representation(self, test_db):
        """Test Todo string representation"""
        todo = Todo(title="String Test Todo")
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        # Should have meaningful string representation
        assert str(todo) == f"Todo(id={todo.id}, title='{todo.title}', completed={todo.completed})"

    def test_todo_to_dict_conversion(self, test_db):
        """Test Todo to dictionary conversion"""
        todo = Todo(title="Dict Test", description="Test description")
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        # Should be able to convert to dict
        todo_dict = todo.__dict__.copy()
        expected_keys = {'id', 'title', 'description', 'completed', 'created_at', 'updated_at'}

        assert expected_keys.issubset(todo_dict.keys())
        assert todo_dict['title'] == "Dict Test"
        assert todo_dict['description'] == "Test description"