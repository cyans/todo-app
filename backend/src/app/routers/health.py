"""
Health check endpoints
@CODE:BACKEND-API-001:HEALTH - Health check 엔드포인트
"""

import sys
from pathlib import Path

# Add src to Python path
src_path = str(Path(__file__).parent.parent.parent)
if src_path not in sys.path:
    sys.path.insert(0, src_path)

from fastapi import APIRouter
from fastapi import status

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "TodoApp API is running"}