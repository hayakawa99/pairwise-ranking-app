# backend/app/api/endpoints/vote.py

from fastapi import APIRouter, HTTPException, Depends, Path
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models.option import Option
from app.db.models.vote import Vote
from app.db.models.user import User
from app.core.trueskill_utils import rate_1vs1

router = APIRouter(
    prefix="/{theme_id}",  # テーマ ID をここに集約
    tags=["votes"],
)

class VoteRequest(BaseModel):
    winner_id: int
    loser_id: int
    user_email: Optional[str] = None

@router.post("/vote")
def vote(
    request: VoteRequest,
    theme_id: int = Path(..., description="対象テーマのID"),
    db: Session = Depends(get_db),
):
    # --- 対象オプションをロック付きで取得 ---
    winner = db.query(Option).with_for_update().get(request.winner_id)
    loser  = db.query(Option).with_for_update().get(request.loser_id)

    if not winner or not loser:
        raise HTTPException(status_code=400, detail="選択肢が存在しません")
    if winner.theme_id != theme_id or loser.theme_id != theme_id:
        raise HTTPException(status_code=400, detail="テーマIDが不正です")

    # --- TrueSkill レーティング更新 ---
    new_mu_w, new_sigma_w, new_mu_l, new_sigma_l = rate_1vs1(
        winner.trueskill_mu, winner.trueskill_sigma,
        loser.trueskill_mu,  loser.trueskill_sigma
    )
    winner.trueskill_mu    = new_mu_w
    winner.trueskill_sigma = new_sigma_w
    loser.trueskill_mu     = new_mu_l
    loser.trueskill_sigma  = new_sigma_l

    # --- 統計情報更新 ---
    winner.wins        += 1
    loser.losses       += 1
    winner.shown_count += 1
    loser.shown_count  += 1

    # --- Vote レコード作成（ゲスト投票対応） ---
    vote_record = Vote(
        theme_id         = theme_id,
        winner_option_id = winner.id,
        loser_option_id  = loser.id,
        user_id          = None,
    )
    if request.user_email:
        user = db.query(User).filter(User.email == request.user_email).first()
        if user:
            vote_record.user_id = user.id

    db.add(vote_record)
    db.commit()

    return {"message": "TrueSkill を適用し、投票を記録しました"}
