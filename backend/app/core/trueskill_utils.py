import trueskill

env = trueskill.TrueSkill(
    mu=25.0,
    sigma=25.0/3.0,
    beta=25.0/6.0,
    tau=25.0/300.0,
    draw_probability=0.0
)

def rate_1vs1(mu_w: float, sigma_w: float, mu_l: float, sigma_l: float):
    """勝者と敗者の(mu, sigma)から更新後の(mu, sigma)を返す"""
    r_w = env.Rating(mu=mu_w, sigma=sigma_w)
    r_l = env.Rating(mu=mu_l, sigma=sigma_l)
    new_w, new_l = env.rate_1vs1(r_w, r_l)
    return round(new_w.mu, 4), round(new_w.sigma, 4), round(new_l.mu, 4), round(new_l.sigma, 4)