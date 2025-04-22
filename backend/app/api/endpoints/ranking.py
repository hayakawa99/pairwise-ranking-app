from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.models import Theme
from app.db.session import get_db
from app.schemas.theme import ThemeRead
from app.core.ranking import calculate_ranking

router = APIRouter()

@router.get("/{theme_id}/ranking", response_model=ThemeRead)
def get_theme_with_ranking(theme_id: int, db: Session = Depends(get_db)):
    theme = db.query(Theme).filter(Theme.id == theme_id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    ranked_options = calculate_ranking(theme.options)

    return ThemeRead(
        id=theme.id,
        title=theme.title,
        options=ranked_options
    )
