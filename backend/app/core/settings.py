from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str

    # TrueSkill のデフォルトパラメータ
    trueskill_mu: float = 25.0                     # 初期平均
    trueskill_sigma_divisor: float = 3.0           # 初期σ = μ / 3
    trueskill_beta_divisor: float = 6.0            # beta = μ / 6
    trueskill_tau_divisor: float = 300.0           # tau = μ / 300
    trueskill_draw_probability: float = 0.0        # 引き分け確率

    class Config:
        env_file = ".env"
        env_prefix = ""

settings = Settings()
