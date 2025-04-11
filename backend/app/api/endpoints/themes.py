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

@router.get("/{id}", response_model=ThemeRead)
def get_theme(id: int, db: Session = Depends(get_db)):
    theme = db.query(Theme).filter(Theme.id == id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    return theme

@router.post("/{id}/vote")
def vote(id: int, selected_option: str, db: Session = Depends(get_db)):
    try:
        theme = db.query(Theme).filter(Theme.id == id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")

        option = db.query(Option).filter(Option.label == selected_option, Option.theme_id == id).first()
        if not option:
            raise HTTPException(status_code=404, detail="Option not found")

        # Eloレーティングの更新処理などをここに記載

        db.commit()
        return {"status": "ok"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
