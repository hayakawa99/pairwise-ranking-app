from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List

from app.db.models.theme import Theme
from app.db.models.option import Option
from app.schemas.theme import ThemeCreate, ThemeRead
from app.db.session import get_db

# prefixは空にしておく
router = APIRouter()

@router.post("")
def create_theme(theme: ThemeCreate, db: Session = Depends(get_db)):
    try:
        theme_orm = Theme(title=theme.title)
        db.add(theme_orm)
        db.flush()  # ← theme_orm.id を確定させる

        for opt in theme.options:
            db.add(Option(label=opt.label, rating=opt.rating, theme_id=theme_orm.id))

        db.commit()
        return {"status": "ok"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[ThemeRead])
def list_themes(db: Session = Depends(get_db)):
    return db.query(Theme).all()
