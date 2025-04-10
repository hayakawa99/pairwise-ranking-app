from typing import List
from pydantic import BaseModel
from .option import Option

class Theme(BaseModel):
    id: int
    title: str
    options: List[Option]

    class Config:
        orm_mode = True
