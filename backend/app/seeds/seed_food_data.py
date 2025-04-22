from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models.theme import Theme
from app.db.models.option import Option

def seed_food():
    db: Session = SessionLocal()

    theme_data = {
        "title": "好きな食べ物は？",
        "options": [
            "寿司",
            "ラーメン",
            "焼肉",
            "カレー",
            "パスタ",
            "ピザ",
            "ハンバーガー",
            "天ぷら",
            "うどん",
            "オムライス",
        ]
    }

    existing = db.query(Theme).filter(Theme.title == theme_data["title"]).first()
    if existing:
        print(f"テーマ「{theme_data['title']}」はすでに存在します。スキップします。")
        db.close()
        return

    theme = Theme(title=theme_data["title"])
    db.add(theme)
    db.flush()

    for label in theme_data["options"]:
        db.add(Option(label=label, theme_id=theme.id))

    db.commit()
    db.close()
    print(f"テーマ「{theme_data['title']}」と {len(theme_data['options'])} 件の選択肢を登録しました。")

if __name__ == "__main__":
    seed_food()
