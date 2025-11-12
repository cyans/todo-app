"""
Test suite for API endpoints
@TEST:BACKEND-API-001:API - API 엔드포인트 테스트
"""

import sys
import os
from pathlib import Path
import unittest.mock

# Add src to Python path for testing
src_path = str(Path(__file__).parent.parent)
if src_path not in sys.path:
    sys.path.insert(0, src_path)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Imports to be tested (will fail until implemented)
from app.main import app
from app.database import get_db, SessionLocal, engine, create_tables
from app.model import Base, Todo
from app.schema import TodoCreate, TodoUpdate, TodoResponse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture(scope="function")
def test_db():
    """Create a separate test database for each test function"""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    # Create a separate in-memory database for tests
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

    # Create all tables for this test database
    Base.metadata.create_all(bind=test_engine)

    # Create test session factory
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    # Create a session for this test
    db = TestSessionLocal()
    try:
        # Ensure the session is bound to the test engine
        assert db.bind is not None, "Session bind should not be None"
        assert db.bind == test_engine, "Session should be bound to test engine"
        yield db
    finally:
        db.close()

@pytest.fixture
def client(test_db):
    """Create test client with database dependency override"""
    # Override the database dependency
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    # Apply the override
    app.dependency_overrides[get_db] = override_get_db

    # Create test client
    with TestClient(app) as c:
        yield c

    # Clean up the override
    app.dependency_overrides.clear()


class TestTodoAPI:
    """Todo API endpoint test cases"""

    def test_database_connection(self, test_db):
        """Test that the test database connection works"""
        # Test basic database operations
        from app.model import Todo
        from sqlalchemy import text

        # Create a simple table query
        result = test_db.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = result.fetchall()

        # Should have todos table
        table_names = [table[0] for table in tables]
        print(f"Tables in database: {table_names}")

        # Check if todos table exists
        assert "todos" in table_names, f"todos table not found in {table_names}"

    def test_create_todo_success(self, client):
        """Test successful todo creation"""
        todo_data = {
            "title": "Test Todo",
            "description": "Test description"
        }

        response = client.post("/api/todos", json=todo_data)

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Todo"
        assert data["description"] == "Test description"
        assert data["completed"] is False
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_todo_minimal(self, client):
        """Test todo creation with minimal data"""
        todo_data = {"title": "Minimal Todo"}

        response = client.post("/api/todos", json=todo_data)

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Minimal Todo"
        assert data["description"] is None
        assert data["completed"] is False

    def test_create_todo_invalid_data(self, client):
        """Test todo creation with invalid data"""
        # Missing title
        response = client.post("/api/todos", json={"description": "Missing title"})
        assert response.status_code == 422  # Validation error

        # Empty title
        response = client.post("/api/todos", json={"title": ""})
        assert response.status_code == 422

        # Title too long
        long_title = "a" * 201
        response = client.post("/api/todos", json={"title": long_title})
        assert response.status_code == 422

    def test_get_all_todos_empty(self, client):
        """Test getting all todos when empty"""
        response = client.get("/api/todos")

        assert response.status_code == 200
        data = response.json()
        assert data["todos"] == []
        assert data["total"] == 0
        assert data["skip"] == 0
        assert data["limit"] == 100  # Default limit

    def test_get_all_todos_with_data(self, client):
        """Test getting all todos with data"""
        # Create test todos via API
        for i in range(3):
            todo_data = {
                "title": f"Todo {i}",
                "description": f"Description {i}"
            }
            response = client.post("/api/todos", json=todo_data)
            assert response.status_code == 201

        response = client.get("/api/todos")

        assert response.status_code == 200
        data = response.json()
        assert len(data["todos"]) == 3
        assert data["total"] == 3
        assert data["todos"][0]["title"] == "Todo 0"

    def test_get_todo_by_id_success(self, client):
        """Test getting todo by ID when it exists"""
        # Create test todo via API
        todo_data = {
            "title": "Test Todo",
            "description": "Description"
        }
        create_response = client.post("/api/todos", json=todo_data)
        assert create_response.status_code == 201
        todo_id = create_response.json()["id"]

        response = client.get(f"/api/todos/{todo_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == todo_id
        assert data["title"] == "Test Todo"
        assert data["description"] == "Description"

    def test_get_todo_by_id_not_found(self, client):
        """Test getting todo by ID when it doesn't exist"""
        response = client.get("/api/todos/999")

        assert response.status_code == 404

    def test_update_todo_success(self, client):
        """Test successful todo update"""
        # Create test todo via API
        todo_data = {
            "title": "Original Title",
            "description": "Original description"
        }
        create_response = client.post("/api/todos", json=todo_data)
        assert create_response.status_code == 201
        todo_id = create_response.json()["id"]

        update_data = {
            "title": "Updated Title",
            "description": "Updated description",
            "completed": True
        }

        response = client.put(f"/api/todos/{todo_id}", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["description"] == "Updated description"
        assert data["completed"] is True

    def test_update_todo_partial(self, client):
        """Test partial todo update"""
        # Create test todo via API
        todo_data = {
            "title": "Original Title",
            "description": "Original description"
        }
        create_response = client.post("/api/todos", json=todo_data)
        assert create_response.status_code == 201
        todo_id = create_response.json()["id"]

        update_data = {"title": "Updated Title Only"}

        response = client.put(f"/api/todos/{todo_id}", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title Only"
        assert data["description"] == "Original description"  # Unchanged
        assert data["completed"] is False  # Unchanged

    def test_update_todo_not_found(self, client):
        """Test updating todo that doesn't exist"""
        update_data = {"title": "Updated Title"}

        response = client.put("/api/todos/999", json=update_data)

        assert response.status_code == 404

    def test_delete_todo_success(self, client):
        """Test successful todo deletion"""
        # Create test todo via API
        todo_data = {
            "title": "To Delete",
            "description": "Will be deleted"
        }
        create_response = client.post("/api/todos", json=todo_data)
        assert create_response.status_code == 201
        todo_id = create_response.json()["id"]

        response = client.delete(f"/api/todos/{todo_id}")

        assert response.status_code == 204
        assert response.content == b""

    def test_delete_todo_not_found(self, client):
        """Test deleting todo that doesn't exist"""
        response = client.delete("/api/todos/999")

        assert response.status_code == 404

    def test_pagination_skip_and_limit(self, client):
        """Test pagination with skip and limit parameters"""
        # Create test todos via API
        for i in range(5):
            todo_data = {"title": f"Todo {i}"}
            response = client.post("/api/todos", json=todo_data)
            assert response.status_code == 201

        # Test with skip=1, limit=2 (should get todos 1 and 2)
        response = client.get("/api/todos?skip=1&limit=2")

        assert response.status_code == 200
        data = response.json()
        assert len(data["todos"]) == 2
        assert data["total"] == 5
        assert data["skip"] == 1
        assert data["limit"] == 2
        assert data["todos"][0]["title"] == "Todo 1"

    def test_pagination_limit_validation(self, client):
        """Test that limit parameter respects reasonable bounds"""
        # Very large limit should still work
        response = client.get("/api/todos?limit=1000")
        assert response.status_code == 200