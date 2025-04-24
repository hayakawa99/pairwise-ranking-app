from fastapi import APIRouter
from app.api.endpoints import themes, vote, ranking, auth, mypage

api_router = APIRouter()

api_router.include_router(themes.router, prefix="/themes", tags=["themes"])
api_router.include_router(vote.router, tags=["vote"])
api_router.include_router(ranking.router, prefix="/themes", tags=["ranking"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(mypage.router, tags=["mypage"])
