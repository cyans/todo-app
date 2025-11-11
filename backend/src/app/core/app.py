"""
Core FastAPI application setup
@CODE:BACKEND-API-001:CORE - FastAPI 애플리케이션 핵심 설정
"""

import sys
from pathlib import Path

# Add src to Python path
src_path = str(Path(__file__).parent.parent.parent)
if src_path not in sys.path:
    sys.path.insert(0, src_path)

import uvicorn
from config import create_app, get_root_response
from routers import todos, health

# Create FastAPI app
app = create_app()

# Include routers
app.include_router(todos.router)
app.include_router(health.router)

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return get_root_response()

if __name__ == "__main__":
    uvicorn.run("app.core.app:app", host="0.0.0.0", port=8000, reload=True)