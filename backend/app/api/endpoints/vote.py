from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.option import Option
from app.db.models.vote import Vote
from app.db.models.user import User
from app.core.trueskill_utils import rate_1vs1
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class VoteRequest(BaseModel):
    winner_id: int
    loser_id: int
    user_email: Optional[str] = None  # フロントから送る（将来的には認証セッションに置換）

@router.post("/vote")
def vote(request: VoteRequest, db: Session = Depends(get_db)):
    winner = db.query(Option).with_for_update().get(request.winner_id)
    loser = db.query(Option).with_for_update().get(request.loser_id)

    if not winner or not loser:
        raise HTTPException(status_code=400, detail="選択肢が存在しません")

    # レーティング更新
    new_mu_w, new_sigma_w, new_mu_l, new_sigma_l = rate_1vs1(
        winner.trueskill_mu, winner.trueskill_sigma,
        loser.trueskill_mu,  loser.trueskill_sigma
    )

    winner.trueskill_mu = new_mu_w
    winner.trueskill_sigma = new_sigma_w
    loser.trueskill_mu = new_mu_l
    loser.trueskill_sigma = new_sigma_l

    winner.wins += 1
    loser.losses += 1
    winner.shown_count += 1
    loser.shown_count += 1

    vote_record = Vote(
        theme_id=winner.theme_id,
        winner_option_id=winner.id,
        loser_option_id=loser.id,
        user_id=None,
    )
    if request.user_email:
        user = db.query(User).filter(User.email == request.user_email).first()
        if not user:
            raise HTTPException(status_code=401, detail="認証ユーザーが登録されていません")
        vote_record.user_id = user.id

    db.commit()
    return {"message": "TrueSkill を適用し、投票を記録しました"}
