from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.option import Option
from app.core.elo import update_elo

router = APIRouter()

@router.post("/vote")
def vote(winner_id: int, loser_id: int, db: Session = Depends(get_db)):
    winner = db.query(Option).filter(Option.id == winner_id).with_for_update().first()
    loser = db.query(Option).filter(Option.id == loser_id).with_for_update().first()

    if not winner or not loser:
        raise HTTPException(status_code=400, detail="選択肢が存在しません")

    winner.rating, loser.rating = update_elo(winner.rating, loser.rating)

    winner.wins += 1
    loser.losses += 1
    winner.shown_count += 1
    loser.shown_count += 1

    db.commit()
    return {"message": "レートを更新しました"}