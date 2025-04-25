from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models.simaenaga_line import SimaenagaLine

def seed():
    db: Session = SessionLocal()
    lines = [
        "こんにちは、シマエナガだよ！",
        "どっちが好き？えらんでね。",
        "迷ったらまた投票してみて！",
        "ランキングもあとで見に行ってね✧",
        "よーし、次はどっちかな？"
    ]
    for text in lines:
        db.add(SimaenagaLine(text=text))
    db.commit()
    db.close()
    print("シマエナガのセリフをシードしました。")

if __name__ == "__main__":
    seed()
