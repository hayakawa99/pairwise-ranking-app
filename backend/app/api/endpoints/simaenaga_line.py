from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from random import choice

from app.db.session import get_db
from app.db.models.simaenaga_line import SimaenagaLine
from app.schemas.simaenaga_line import SimaenagaLineRead

router = APIRouter(prefix="/simaenaga_lines", tags=["simaenaga"])

@router.get("/random", response_model=SimaenagaLineRead)
def get_random_line(db: Session = Depends(get_db)):
    lines = db.query(SimaenagaLine).all()
    if not lines:
        raise HTTPException(404, "セリフが登録されていません")
    return choice(lines)
