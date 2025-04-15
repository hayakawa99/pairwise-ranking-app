from typing import Optional
from pydantic import BaseModel

class OptionRead(BaseModel):
    id: int
    label: str
    rating: Optional[float]

    class Config:

        from_attributes = True


class OptionCreate(BaseModel):
    label: str
    rating: float
