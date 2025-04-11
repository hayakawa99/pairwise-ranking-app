from typing import List
from pydantic import BaseModel
from .option import Option

class Theme(BaseModel):
    id: int
    title: str
    options: List[Option]

    class Config:
        from_attributes = True  # ✅ Pydantic v2対応
