from pydantic import BaseModel

class Option(BaseModel):
    id: int
    label: str
    rating: float

    class Config:
        orm_mode = True
