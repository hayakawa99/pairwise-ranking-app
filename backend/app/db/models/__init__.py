# backend/app/db/models/__init__.py

from app.db.base import Base

# --- 全モデルをインポートして Base.metadata に登録 ---
from app.db.models.theme      import Theme      # noqa: F401
from app.db.models.option     import Option     # noqa: F401
from app.db.models.comparison import Comparison # noqa: F401
from app.db.models.user       import User       # noqa: F401
from app.db.models.vote       import Vote       # noqa: F401

__all__ = [
    "Theme",
    "Option",
    "Comparison",
    "User",
    "Vote",
]
