from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base

class Vote(Base):
    __tablename__ = "votes"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )
    # user_id を任意に変更（ログイン無しでも投票可に）
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
    )
    theme_id = Column(
        Integer,
        ForeignKey("themes.id", ondelete="CASCADE"),
        nullable=False,
    )
    winner_option_id = Column(
        Integer,
        ForeignKey("options.id", ondelete="CASCADE"),
        nullable=False,
    )
    loser_option_id = Column(
        Integer,
        ForeignKey("options.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # リレーション
    user = relationship("User", back_populates="votes")
    theme = relationship("Theme", back_populates="votes")
    winner_option = relationship(
        "Option",
        back_populates="winner_votes",
        foreign_keys=[winner_option_id],
    )
    loser_option = relationship(
        "Option",
        back_populates="loser_votes",
        foreign_keys=[loser_option_id],
    )
