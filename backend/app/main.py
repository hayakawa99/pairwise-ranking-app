from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.db.session import init_db

def create_app() -> FastAPI:
    app = FastAPI()

    @app.on_event("startup")
    def startup():
        init_db()

    # ✅ CORSミドルウェアを正しく構成（開発中のため * を許可）
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # 開発中は *、本番では正確なドメインを指定
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ✅ 全APIに "/api" プレフィックスを付けてルーティング
    app.include_router(api_router, prefix="/api")

    return app

app = create_app()
