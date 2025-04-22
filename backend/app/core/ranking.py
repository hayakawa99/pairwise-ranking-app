from typing import List, Any

def calculate_ranking(options: List[Any]) -> List[Any]:
    return sorted(
        options,
        key=lambda o: o.trueskill_mu - 3 * o.trueskill_sigma,
        reverse=True
    )
