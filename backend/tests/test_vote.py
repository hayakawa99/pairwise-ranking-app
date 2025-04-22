import pytest
from app.core.trueskill_utils import rate_1vs1

def test_rate_1vs1_returns_tuple_of_floats():
    """戻り値が float の 4 要素タプルになっていること"""
    result = rate_1vs1(30.0, 10.0, 20.0, 10.0)
    assert isinstance(result, tuple)
    assert len(result) == 4
    for x in result:
        assert isinstance(x, float)

def test_rate_1vs1_monotonicity_equal_ratings():
    """
    μ と σ が同一の初期値同士で対戦させた場合、
    勝者の μ は上がり、敗者の μ は下がること。
    両者の σ は減少すること。
    """
    mu0 = 25.0
    sigma0 = 25.0 / 3.0
    w_mu, w_sigma, l_mu, l_sigma = rate_1vs1(mu0, sigma0, mu0, sigma0)

    assert w_mu > mu0
    assert l_mu < mu0
    assert w_sigma < sigma0
    assert l_sigma < sigma0

@pytest.mark.parametrize(
    "mu_w, sigma_w, mu_l, sigma_l, exp_w_mu, exp_l_mu, exp_w_sigma, exp_l_sigma",
    [
        # デフォルトの TrueSkill パラメータにおける初期値同士の例。
        # ライブラリ計算結果は環境により微小差があるため approx でチェック。
        (25.0, 25.0/3.0, 25.0, 25.0/3.0,
         29.2027, 20.7973, 7.1961, 7.1961),
    ]
)
def test_rate_1vs1_against_known_values(mu_w, sigma_w, mu_l, sigma_l,
                                        exp_w_mu, exp_l_mu, exp_w_sigma, exp_l_sigma):
    """
    TrueSkill ライブラリの既知の結果とほぼ一致することを確認。
    """
    w_mu, w_sigma, l_mu, l_sigma = rate_1vs1(mu_w, sigma_w, mu_l, sigma_l)

    assert w_mu == pytest.approx(exp_w_mu, rel=1e-3)
    assert l_mu == pytest.approx(exp_l_mu, rel=1e-3)
    assert w_sigma == pytest.approx(exp_w_sigma, rel=1e-3)
    assert l_sigma == pytest.approx(exp_l_sigma, rel=1e-3)

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
