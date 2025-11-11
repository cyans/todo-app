"""
FastAPI main application entry point
@CODE:BACKEND-API-001:MAIN - FastAPI 애플리케이션 진입점
"""

# Import the refactored app
from core.app import app

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)