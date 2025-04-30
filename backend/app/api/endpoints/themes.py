# backend/app/api/endpoints/themes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from typing import List
from pydantic import BaseModel

from app.db.models.theme import Theme
from app.db.models.option import Option
from app.db.models.user import User
from app.db.models.vote import Vote
from app.schemas.theme import ThemeCreate, ThemeRead, VoteRequest
from app.db.session import get_db

router = APIRouter()


class DeleteThemeRequest(BaseModel):
    user_email: str


# ──────────────────────────────
#  Elo Rating (K = 32 固定)
# ──────────────────────────────
def _elo_expected(ra: float, rb: float) -> float:
    return 1 / (1 + 10 ** ((rb - ra) / 400))


def _elo_update(winner: Option, loser: Option, k: int = 32) -> None:
    ea = _elo_expected(winner.trueskill_mu, loser.trueskill_mu)
    eb = 1 - ea
    winner.trueskill_mu += k * (1 - ea)
    loser.trueskill_mu += k * (0 - eb)


# ──────────────────────────────
@router.post("")
def create_theme(theme: ThemeCreate, db: Session = Depends(get_db)):
    try:
        # ユーザーが未登録なら自動作成
        user = db.query(User).filter(User.email == theme.user_email).first()
        if not user:
            user = User(email=theme.user_email)
            db.add(user)
            db.flush()

        theme_orm = Theme(
            title=theme.title,
            user_email=theme.user_email,
            user_id=user.id,
        )
        db.add(theme_orm)
        db.flush()  # theme_orm.id を確定

        for opt in theme.options:
            db.add(
                Option(
                    label=opt.label,
                    trueskill_mu=opt.rating,
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
    return db.query(Theme).options(joinedload(Theme.options)).all()


@router.get("/{id}", response_model=ThemeRead)
def get_theme(id: int, db: Session = Depends(get_db)):
    theme = (
        db.query(Theme)
        .options(joinedload(Theme.options))
        .filter(Theme.id == id)
        .first()
    )
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    return theme


@router.post("/{id}/vote")
def vote(id: int, request: VoteRequest, db: Session = Depends(get_db)):
    try:
        theme = (
            db.query(Theme)
            .options(joinedload(Theme.options))
            .filter(Theme.id == id)
            .first()
        )
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")

        # ユーザーが存在しなければ自動登録
        user = db.query(User).filter(User.email == request.user_email).first()
        if not user:
            user = User(email=request.user_email)
            db.add(user)
            db.flush()  # user.id を取得

        winner = (
            db.query(Option)
            .filter(Option.id == request.winner_id, Option.theme_id == theme.id)
            .first()
        )
        loser = (
            db.query(Option)
            .filter(Option.id == request.loser_id, Option.theme_id == theme.id)
            .first()
        )
        if not winner or not loser:
            raise HTTPException(status_code=400, detail="選択肢が見つかりません")

        # ---- Elo 更新 ----
        _elo_update(winner, loser)

        # ---- 投票履歴 ----
        vote_record = Vote(
            theme_id=theme.id,
            winner_option_id=winner.id,
            loser_option_id=loser.id,
            user_id=user.id,
        )
        db.add(vote_record)

        db.commit()
        return {"status": "ok"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
def delete_theme(id: int, req: DeleteThemeRequest, db: Session = Depends(get_db)):
    theme = db.query(Theme).filter(Theme.id == id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    if theme.user_email != req.user_email:
        raise HTTPException(status_code=403, detail="このお題を削除する権限がありません")

    db.delete(theme)
    db.commit()
    return {"status": "deleted"}
