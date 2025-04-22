from sqlalchemy import Column, Integer, Text, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from app.core.settings import settings

class Option(Base):
    __tablename__ = "options"

    id = Column(Integer, primary_key=True, index=True)
    theme_id = Column(Integer, ForeignKey("themes.id", ondelete="CASCADE"), nullable=False)
    label = Column(Text, nullable=False)
    wins = Column(Integer, default=0, nullable=False)
    losses = Column(Integer, default=0, nullable=False)
    shown_count = Column(Integer, default=0, nullable=False)

    trueskill_mu    = Column(
        Float, nullable=False,
        default=settings.trueskill_mu
    )
    trueskill_sigma = Column(
        Float, nullable=False,
        default=settings.trueskill_mu / settings.trueskill_sigma_divisor
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    theme = relationship("Theme", back_populates="options")