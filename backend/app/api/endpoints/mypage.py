from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.db.models.vote import Vote
from app.db.models.user import User
from app.db.models.option import Option
from app.db.models.theme import Theme

router = APIRouter()

@router.get("/user/votes")
def get_user_votes(email: str = Query(...), db: Session = Depends(get_db)):
    """
    指定されたユーザーの投票履歴を返す（emailベース）。
    フロント側は session.user.email を付けてリクエストする。
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return []  # ユーザーが存在しない場合も空配列を返す

    votes = (
        db.query(Vote)
        .options(
            joinedload(Vote.winner_option),
            joinedload(Vote.loser_option),
            joinedload(Vote.theme),
        )
        .filter(Vote.user_id == user.id)
        .order_by(Vote.created_at.desc())
        .all()
    )

    result = []
    for vote in votes:
        if not vote.theme or not vote.winner_option or not vote.loser_option:
            continue
        result.append({
            "theme_id": vote.theme.id,
            "theme_title": vote.theme.title,
            "winner_label": vote.winner_option.label,
            "loser_label": vote.loser_option.label,
            "created_at": vote.created_at,
        })
    return result


@router.get("/user/themes")
def get_user_created_themes(email: str = Query(...), db: Session = Depends(get_db)):
    """
    指定されたユーザーが作成したテーマ一覧を返す。
    フロント側は session.user.email を渡す。
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return []  # ユーザーが存在しない場合も空配列を返す

    themes = (
        db.query(Theme)
        .filter(Theme.user_id == user.id)
        .order_by(Theme.created_at.desc())
        .all()
    )

    return [
        {
            "id": theme.id,
            "title": theme.title,
            "created_at": theme.created_at,
            "user_email": theme.user_email,
        }
        for theme in themes
    ]
