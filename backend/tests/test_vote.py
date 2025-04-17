import pytest
from app.core.elo import update_elo


@pytest.mark.usefixtures("fruit_theme")
def test_vote_status_code(client):
    themes_response = client.get("/api/themes")
    options = themes_response.json()[0]["options"]
    winner_id = options[0]["id"]
    loser_id = options[1]["id"]

    vote_response = client.post("/api/vote", json={
        "winner_id": winner_id,
        "loser_id": loser_id
    })

    assert vote_response.status_code == 200
    assert vote_response.json()["message"] == "レートを更新しました"


@pytest.mark.usefixtures("fruit_theme")
def test_vote_rating_update(client):
    themes_response = client.get("/api/themes")
    options = themes_response.json()[0]["options"]
    winner_id = options[0]["id"]
    loser_id = options[1]["id"]

    before_ratings = {
        opt["id"]: opt["rating"]
        for opt in options
    }

    client.post("/api/vote", json={
        "winner_id": winner_id,
        "loser_id": loser_id
    })

    updated = client.get("/api/themes").json()[0]["options"]
    after_ratings = {
        opt["id"]: opt["rating"]
        for opt in updated
    }

    expected_winner, expected_loser = update_elo(
        winner_rating=before_ratings[winner_id],
        loser_rating=before_ratings[loser_id]
    )

    assert round(after_ratings[winner_id], 2) == expected_winner
    assert round(after_ratings[loser_id], 2) == expected_loser


def test_update_elo_calculation():
    winner, loser = update_elo(1500, 1500)
    assert winner == 1516.0
    assert loser == 1484.0


# 🧪 表示回数×レート優遇マッチングロジックのテスト
def test_first_option_sampling_bias():
    options = [
        {"id": 1, "label": "A"},
        {"id": 2, "label": "B"},
        {"id": 3, "label": "C"},
        {"id": 4, "label": "D"},
    ]
    shown_counts = {1: 0, 2: 3, 3: 2, 4: 0}
    ratings = {1: 1700, 2: 1500, 3: 1600, 4: 1400}

    def weight(opt):
        shown = shown_counts.get(opt["id"], 0)
        rating = ratings.get(opt["id"], 1500)
        visibility = 1 / (shown + 1)
        bonus = 1 + (rating - 1500) / 3000
        return visibility * bonus

    weights = [weight(opt) for opt in options]
    top_idx = max(range(len(weights)), key=lambda i: weights[i])

    assert top_idx == 0  # id=1 should be top priority
