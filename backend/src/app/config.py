"""
Application configuration
@CODE:BACKEND-API-001:CONFIG - 애플리케이션 설정
"""

import sys
from pathlib import Path

# Add src to Python path
src_path = str(Path(__file__).parent.parent)
if src_path not in sys.path:
    sys.path.insert(0, src_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables

def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    app = FastAPI(
        title="TodoApp API",
        description="Simple Todo Management API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json"
    )

    # Configure CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, specify exact origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Create database tables on startup
    @app.on_event("startup")
    async def startup_event():
        """Create database tables on startup"""
        create_tables()

    return app

def get_root_response():
    """Get root response data"""
    return {
        "message": "TodoApp API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }