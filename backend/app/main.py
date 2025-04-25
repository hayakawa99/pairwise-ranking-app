from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.db.session import init_db

# ────────────────────────────────────────────────
# CORS 設定
#   - localhost:3000 からのフロントエンドだけを許可
#   - allow_credentials=True と * の併用は NG なので
#     明示的なオリジンを指定する
# ────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    # 本番デプロイ時は ↓ に自サイトドメインを追加
    # "https://example.com",
]

def create_app() -> FastAPI:
    app = FastAPI()

    @app.on_event("startup")
    def startup() -> None:  # 型ヒント追加で静的解析も OK
        init_db()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # すべての API に `/api` プレフィックスを付与
    app.include_router(api_router, prefix="/api")
    return app


app = create_app()
