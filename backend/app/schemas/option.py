from typing import Optional
from pydantic import BaseModel

class OptionRead(BaseModel):
    id: int
    label: str
    rating: Optional[float]  # ← float を Optional[float] に緩和

    class Config:
        from_attributes = True  # ✅ Pydantic v2用設定
        

class OptionCreate(BaseModel):
    label: str
    rating: float
