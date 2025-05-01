# backend/app/api/api.py

from fastapi import APIRouter
from app.api.endpoints import themes, ranking, vote, auth, mypage

api_router = APIRouter()

# ────────────────────────────────────────────────
# テーマ関連
# ────────────────────────────────────────────────
api_router.include_router(
    themes.router,
    prefix="/themes",
    tags=["themes"],
)

# ────────────────────────────────────────────────
# ランキング関連（テーマ配下）
# ────────────────────────────────────────────────
api_router.include_router(
    ranking.router,
    prefix="/themes",
    tags=["ranking"],
)

# ────────────────────────────────────────────────
# 投票関連
# ────────────────────────────────────────────────
api_router.include_router(
    vote.router,
    prefix="/themes",   # ← ここを "/votes" から "/themes" に戻しました
    tags=["votes"],
)

# ────────────────────────────────────────────────
# 認証関連
# ────────────────────────────────────────────────
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"],
)

# ────────────────────────────────────────────────
# マイページ関連
# ────────────────────────────────────────────────
api_router.include_router(
    mypage.router,
    tags=["mypage"],
)
