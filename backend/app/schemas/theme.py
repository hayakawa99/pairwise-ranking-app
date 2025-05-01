from typing import List, Optional
from pydantic import BaseModel
from .option import OptionRead, OptionCreate

class ThemeRead(BaseModel):
    id: int
    title: str
    options: Optional[List[OptionRead]]

    class Config:
        from_attributes = True

class ThemeCreate(BaseModel):
    title: str
    user_email: str
    options: List[OptionCreate]

class VoteRequest(BaseModel):
    winner_id: int
    loser_id: int
    user_email: Optional[str] = None  # ← 任意に変更
