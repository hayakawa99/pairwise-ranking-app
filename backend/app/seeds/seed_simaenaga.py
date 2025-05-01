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
        "よーし、次はどっちかな？",
        "まだまだ迷うよね〜",
        "気軽にポチポチ選んでね！",
        "悩んだらこっち！",
        "どんどんいこう！",
        "ふわっと選んでいいよ！",
        "じーっと見てても答え出ないよ？",
        "そろそろお腹空かない？",
        "次は簡単かも？",
        "これ、難問かな〜？",
        "スッと直感で選んでね！",
        "お茶でも飲んでひと息いれよう！",
        "どちらも魅力的だねぇ",
        "ちょっと休憩も大事だよ〜",
        "勢いで決めちゃおう！",
        "今日の気分はどっち？",
        "また明日も遊びに来てね！",
        "いつでも待ってるよ〜！",
        "楽しく迷おう！",
        "選ぶのもワクワクするね！",
        "考えすぎちゃダメだよ〜！"
    ]
    for text in lines:
        db.add(SimaenagaLine(text=text))
    db.commit()
    db.close()
    print("シマエナガのセリフをシードしました。")

if __name__ == "__main__":
    seed()