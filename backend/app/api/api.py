from fastapi import APIRouter
from app.api.endpoints import themes, ranking, auth, mypage

api_router = APIRouter()

# テーマ関連：作成・取得・投票などを一括管理
api_router.include_router(themes.router, prefix="/themes", tags=["themes"])

# ランキング（テーマに紐づくため同じ prefix で統合）
api_router.include_router(ranking.router, prefix="/themes", tags=["ranking"])

# ログイン・認証
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# マイページ用のユーザー別データ取得
api_router.include_router(mypage.router, tags=["mypage"])
