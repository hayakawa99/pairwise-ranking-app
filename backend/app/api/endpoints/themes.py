from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List

from app.db.models.theme import Theme
from app.db.models.option import Option
from app.schemas.theme import ThemeCreate, ThemeRead, VoteRequest
from app.db.session import get_db
from sqlalchemy.sql import func

router = APIRouter()

@router.post("")
def create_theme(theme: ThemeCreate, db: Session = Depends(get_db)):
    try:
        theme_orm = Theme(title=theme.title)
        db.add(theme_orm)
        db.flush()

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
def vote(id: int, request: VoteRequest, db: Session = Depends(get_db)):
    try:
        theme, selected = Theme.get_theme_and_option_or_404(db, theme_id=id, option_id=request.selected_option_id)

        opponent = (
            db.query(Option)
            .filter(Option.theme_id == id, Option.id != selected.id)
            .order_by(func.random())
            .first()
        )
        if not opponent:
            raise HTTPException(status_code=400, detail="No opponent to compare")

        Option.update_elo_ratings(winner=selected, loser=opponent)

        db.commit()
        return {"status": "ok"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
