from typing import List
from pydantic import BaseModel
from .option import OptionRead, OptionCreate

class ThemeRead(BaseModel):
    id: int
    title: str
    options: List[OptionRead]

    class Config:
        from_attributes = True

class ThemeCreate(BaseModel):
    title: str
    options: List[OptionCreate]
