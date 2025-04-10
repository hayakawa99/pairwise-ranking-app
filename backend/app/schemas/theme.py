from typing import List
from pydantic import BaseModel
from .option import Option, OptionCreate  # ✅ ここが修正ポイント

class ThemeOut(BaseModel):
    id: int
    title: str
    options: List[Option]

    class Config:
        from_attributes = True  # ✅ Pydantic v2 対応

class ThemeCreate(BaseModel):
    title: str
    options: List[OptionCreate]
