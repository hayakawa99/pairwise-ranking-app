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
