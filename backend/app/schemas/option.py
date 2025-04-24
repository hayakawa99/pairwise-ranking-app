from pydantic import BaseModel
from typing import Optional

class OptionRead(BaseModel):
    id: int
    label: str
    trueskill_mu: float
    trueskill_sigma: float
    shown_count: int

    class Config:
        from_attributes = True

class OptionCreate(BaseModel):
    label: str
    rating: float 
