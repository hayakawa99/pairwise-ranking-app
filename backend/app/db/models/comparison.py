from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from app.db.base import Base

class Comparison(Base):
    __tablename__ = "comparison"

    id = Column(Integer, primary_key=True, index=True)

    # 匿名ユーザー識別子
    session_id = Column(Text, nullable=False)

    # 外部キー群
    theme_id = Column(Integer, ForeignKey("themes.id", ondelete="CASCADE"), nullable=False)
    option1_id = Column(Integer, ForeignKey("options.id", ondelete="CASCADE"), nullable=False)
    option2_id = Column(Integer, ForeignKey("options.id", ondelete="CASCADE"), nullable=False)
    winner_id = Column(Integer, ForeignKey("options.id", ondelete="CASCADE"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("session_id", "theme_id", "option1_id", "option2_id", name="uq_session_comparison"),
    )
