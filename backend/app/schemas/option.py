from pydantic import BaseModel

class OptionRead(BaseModel):
    id: int
    label: str
    rating: float

    class Config:
        orm_mode = True

class OptionCreate(BaseModel):
    label: str
    rating: float
