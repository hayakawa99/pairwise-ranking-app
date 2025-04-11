from fastapi import APIRouter
from app.api.endpoints import themes

api_router = APIRouter()
api_router.include_router(themes.router, prefix="/themes", tags=["themes"])  # ✅ 明示的にprefix付与
