from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from typing import List

from app.db.models.theme import Theme
from app.db.models.option import Option
from app.schemas.theme import ThemeCreate, ThemeRead, VoteRequest
from app.db.session import get_db

router = APIRouter()


@router.post("")
def create_theme(theme: ThemeCreate, db: Session = Depends(get_db)):
    """
    新規テーマを登録する。
    Google ログイン済みフロントエンドから渡された `user_email` をそのまま保存。
    """
    try:
        # user_email を追加
        theme_orm = Theme(title=theme.title, user_email=theme.user_email)
        db.add(theme_orm)
        db.flush()  # theme_orm.id を確定させる

        # 選択肢を登録
        for opt in theme.options:
            db.add(
                Option(
                    label=opt.label,
                    rating=opt.rating,
                    theme_id=theme_orm.id,
                )
            )

        db.commit()
        return {"status": "ok", "id": theme_orm.id}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=List[ThemeRead])
def list_themes(db: Session = Depends(get_db)):
    themes = db.query(Theme).options(joinedload(Theme.options)).all()
    return themes


@router.get("/{id}", response_model=ThemeRead)
def get_theme(id: int, db: Session = Depends(get_db)):
    theme = db.query(Theme).filter(Theme.id == id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    return theme


@router.post("/{id}/vote")
def vote(id: int, request: VoteRequest, db: Session = Depends(get_db)):
    """
    勝敗を受け取り、Elo レーティングを更新する。
    """
    try:
        theme = db.query(Theme).filter(Theme.id == id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")

        options = theme.options
        winners = []
        losers = []
        for opt in options:
            if opt.id == request.selected_option_id:
                winners.append(opt)
            else:
                losers.append(opt)

        if not winners or not losers:
            raise HTTPException(status_code=400, detail="選択肢の構造が不正です")

        winner = winners[0]
        loser = losers[0]

        Option.update_elo_ratings(winner=winner, loser=loser)

        db.commit()
        return {"status": "ok"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
def delete_theme(id: int, db: Session = Depends(get_db)):
    theme = db.query(Theme).filter(Theme.id == id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    db.delete(theme)
    db.commit()
    return {"status": "deleted"}
