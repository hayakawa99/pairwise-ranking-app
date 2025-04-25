from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from app.db.models import Theme
from app.db.session import get_db
from app.schemas.theme import ThemeRead
from app.core.ranking import calculate_ranking

router = APIRouter()

@router.get("/{theme_id}/ranking", response_model=ThemeRead)
def get_theme_with_ranking(theme_id: int, db: Session = Depends(get_db)):
    # テーマと紐付く選択肢を一括取得
    theme = (
        db.query(Theme)
        .options(selectinload(Theme.options))
        .filter(Theme.id == theme_id)
        .first()
    )
    if theme is None:
        raise HTTPException(status_code=404, detail="Theme not found")

    # レーティング順に並べ替え
    ranked_options = calculate_ranking(list(theme.options))

    # Pydantic の orm_mode により SQLAlchemy オブジェクトをそのまま返せる
    theme.options = ranked_options  # type: ignore[attr-defined]

    return theme
