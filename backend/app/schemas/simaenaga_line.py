from pydantic import BaseModel

class SimaenagaLineRead(BaseModel):
    id: int
    text: str

    class Config:
        orm_mode = True
