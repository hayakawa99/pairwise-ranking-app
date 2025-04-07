from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
from .models import Base, ThemeORM, OptionORM
import os
import time
from sqlalchemy.exc import OperationalError

# --- DB接続 ---
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./test.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# --- DB初期化（リトライ付き） ---
def init_db():
    print("main.py start")
    for i in range(10):
        try:
            Base.metadata.create_all(bind=engine)
            print("✅ DB初期化成功")
            return
        except OperationalError:
            print(f"⏳ DB接続待機中... ({i+1}/10)")
            time.sleep(1)
    raise Exception("❌ DB起動を待てずタイムアウト")

init_db()  # ← これが必須

# --- FastAPIアプリ ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydanticスキーマ ---
class Option(BaseModel):
    id: int
    label: str
    rating: float
    class Config:
        orm_mode = True  # Pydantic v2では from_attributes = True

class Theme(BaseModel):
    id: int
    title: str
    options: List[Option]
    class Config:
        orm_mode = True  # Pydantic v2では from_attributes = True

# --- DBセッション依存 ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API定義 ---
@app.post("/api/themes")
def create_theme(theme: Theme, db: Session = Depends(get_db)):
    theme_orm = ThemeORM(id=theme.id, title=theme.title)
    for opt in theme.options:
        db.add(OptionORM(id=opt.id, label=opt.label, rating=opt.rating, theme=theme_orm))
    db.add(theme_orm)
    db.commit()
    return {"status": "ok"}

@app.get("/api/themes", response_model=List[Theme])
def list_themes(db: Session = Depends(get_db)):
    return db.query(ThemeORM).all()
