from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base import Base


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    theme_id = Column(Integer, ForeignKey("themes.id"), nullable=False)
    winner_option_id = Column(Integer, ForeignKey("options.id"), nullable=False)
    loser_option_id = Column(Integer, ForeignKey("options.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # リレーション
    user = relationship("User", back_populates="votes")
    theme = relationship("Theme", back_populates="votes")
    winner_option = relationship("Option", foreign_keys=[winner_option_id])
    loser_option = relationship("Option", foreign_keys=[loser_option_id])
