from sqlalchemy import Column, Integer, Text, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import math

class Option(Base):
    __tablename__ = "options"

    id = Column(Integer, primary_key=True, index=True)
    theme_id = Column(Integer, ForeignKey("themes.id", ondelete="CASCADE"), nullable=False)
    label = Column(Text, nullable=False)
    rating = Column(Float, default=1500.0, nullable=False)
    wins = Column(Integer, default=0, nullable=False)
    losses = Column(Integer, default=0, nullable=False)
    shown_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    theme = relationship("Theme", back_populates="options")

    @staticmethod
    def update_elo_ratings(winner, loser, k=32):
        expected_win = 1 / (1 + 10 ** ((loser.rating - winner.rating) / 400))
        expected_lose = 1 / (1 + 10 ** ((winner.rating - loser.rating) / 400))

        winner.rating += k * (1 - expected_win)
        loser.rating += k * (0 - expected_lose)

        winner.wins += 1
        loser.losses += 1

        winner.shown_count += 1
        loser.shown_count += 1
