from typing import List
from pydantic import BaseModel
from .option import OptionRead, OptionCreate  # ✅ ここが修正ポイント

class ThemeRead(BaseModel):
    id: int
    title: str
    options: List[OptionRead]

    class Config:
        from_attributes = True  # ✅ Pydantic v2 対応

class ThemeCreate(BaseModel):
    title: str
    options: List[OptionCreate]
