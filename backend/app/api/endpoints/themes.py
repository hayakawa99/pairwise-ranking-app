from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
from app.schemas import Theme
from app.db.models.theme import ThemeORM
from app.db.models.option import OptionORM
from app.db.session import get_db

router = APIRouter(prefix="/api/themes")

@router.post("")
def create_theme(theme: Theme, db: Session = Depends(get_db)):
    try:
        theme_orm = ThemeORM(id=theme.id, title=theme.title)
        for opt in theme.options:
            db.add(OptionORM(id=opt.id, label=opt.label, rating=opt.rating, theme=theme_orm))
        db.add(theme_orm)
        db.commit()
        return {"status": "ok"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[Theme])
def list_themes(db: Session = Depends(get_db)):
    return db.query(ThemeORM).all()
