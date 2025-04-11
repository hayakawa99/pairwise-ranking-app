from math import pow

def expected_score(rating_a: float, rating_b: float) -> float:
    return 1 / (1 + pow(10, (rating_b - rating_a) / 400))

def update_elo(winner_rating: float, loser_rating: float, k: int = 32) -> tuple[float, float]:
    expected_win = expected_score(winner_rating, loser_rating)
    expected_lose = expected_score(loser_rating, winner_rating)

    new_winner_rating = winner_rating + k * (1 - expected_win)
    new_loser_rating = loser_rating + k * (0 - expected_lose)

    return round(new_winner_rating, 2), round(new_loser_rating, 2)
