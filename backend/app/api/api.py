from fastapi import APIRouter
from app.api.endpoints import themes

api_router = APIRouter()
# ここで prefix="/themes" を付けるので最終的に /themes となる
api_router.include_router(themes.router, prefix="/themes", tags=["themes"])
