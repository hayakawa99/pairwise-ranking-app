from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.option import Option
from app.core.trueskill_utils import rate_1vs1
from pydantic import BaseModel

router = APIRouter()

class VoteRequest(BaseModel):
    winner_id: int
    loser_id: int

@router.post("/vote")
def vote(request: VoteRequest, db: Session = Depends(get_db)):
    winner = db.query(Option).with_for_update().get(request.winner_id)
    loser  = db.query(Option).with_for_update().get(request.loser_id)

    if not winner or not loser:
        raise HTTPException(status_code=400, detail="選択肢が存在しません")

    new_mu_w, new_sigma_w, new_mu_l, new_sigma_l = rate_1vs1(
        winner.trueskill_mu, winner.trueskill_sigma,
        loser.trueskill_mu,  loser.trueskill_sigma
    )

    winner.trueskill_mu    = new_mu_w
    winner.trueskill_sigma = new_sigma_w
    loser.trueskill_mu     = new_mu_l
    loser.trueskill_sigma  = new_sigma_l

    winner.wins       += 1
    loser.losses      += 1
    winner.shown_count+= 1
    loser.shown_count += 1

    db.commit()
    return {"message": "TrueSkill を適用しました"}
