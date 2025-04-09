from pydantic import BaseModel
from typing import List

class Option(BaseModel):
    id: int
    label: str
    rating: float
    class Config:
        orm_mode = True

class Theme(BaseModel):
    id: int
    title: str
    options: List[Option]
    class Config:
        orm_mode = True