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
    user_email: str                    # ← 追加
    options: List[OptionCreate]

class VoteRequest(BaseModel):
    selected_option_id: int
