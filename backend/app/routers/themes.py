from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..schemas import Theme
from ..models.theme import ThemeORM
from ..models.option import OptionORM
from ..db import get_db

router = APIRouter(prefix="/api/themes")

@router.post("")
def create_theme(theme: Theme, db: Session = Depends(get_db)):
    theme_orm = ThemeORM(id=theme.id, title=theme.title)
    for opt in theme.options:
        db.add(OptionORM(id=opt.id, label=opt.label, rating=opt.rating, theme=theme_orm))
    db.add(theme_orm)
    db.commit()
    return {"status": "ok"}

@router.get("", response_model=List[Theme])
def list_themes(db: Session = Depends(get_db)):
    return db.query(ThemeORM).all()
