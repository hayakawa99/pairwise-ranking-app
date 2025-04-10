from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models.theme import Theme
from app.db.models.option import Option

def seed():
    db: Session = SessionLocal()

    seed_data = {
        "好きな果物は？": ["りんご", "バナナ", "ぶどう", "みかん", "パイナップル", "メロン"],
        "好きな動物は？": ["ねこ", "いぬ", "うさぎ", "とり", "きつね", "パンダ"],
        "好きな飲み物は？": ["コーヒー", "紅茶", "水", "牛乳", "ジュース", "炭酸水"],
        "好きな季節は？": ["春", "夏", "秋", "冬", "梅雨", "初夏"],
    }

    for theme_title, options in seed_data.items():
        existing = db.query(Theme).filter(Theme.title == theme_title).first()
        if existing:
            continue

        theme = Theme(title=theme_title)
        db.add(theme)
        db.flush()  # theme.id を取得するため

        for label in options:
            db.add(Option(label=label, theme_id=theme.id))

    db.commit()
    db.close()

if __name__ == "__main__":
    seed()
