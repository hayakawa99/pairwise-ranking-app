from fastapi import APIRouter
from app.api.endpoints import themes, vote

api_router = APIRouter()
api_router.include_router(themes.router, prefix="/themes", tags=["themes"])  # ✅ 修正点
api_router.include_router(vote.router, tags=["vote"])
