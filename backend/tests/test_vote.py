from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_vote_success():
    # テーマ＋選択肢をPOSTで作成
    theme_response = client.post("/api/themes", json={
        "title": "果物",
        "options": [
            {"label": "りんご", "rating": 1500.0},
            {"label": "バナナ", "rating": 1500.0}
        ]
    })

    assert theme_response.status_code == 200
    theme = theme_response.json()

    # 選択肢のIDを取得（GETでtheme一覧を取得してもOK）
    themes_response = client.get("/api/themes")
    assert themes_response.status_code == 200
    options = themes_response.json()[0]["options"]
    winner_id = options[0]["id"]
    loser_id = options[1]["id"]

    # vote API を呼び出し
    vote_response = client.post(f"/api/vote?winner_id={winner_id}&loser_id={loser_id}")
    assert vote_response.status_code == 200
    assert vote_response.json()["message"] == "レートを更新しました"
