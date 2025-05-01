import os
import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from .base import Base

DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def init_db() -> None:
    print("🔄 DB初期化開始")
    for i in range(30):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            print("✅ DB初期化成功")
            return
        except OperationalError:
            print(f"⏳ DB接続待機中... ({i+1}/30)")
            time.sleep(2)
    raise Exception("❌ DB起動を待てずタイムアウト")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
