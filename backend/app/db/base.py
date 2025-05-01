from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# ── 全モデルをインポート ──
import app.db.models.theme
import app.db.models.option
import app.db.models.comparison
import app.db.models.user
import app.db.models.vote

