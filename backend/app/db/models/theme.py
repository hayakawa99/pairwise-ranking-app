from sqlalchemy import Column, Integer, Text, DateTime      # ForeignKey を削除
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Theme(Base):
    __tablename__ = "themes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)

    # --- 作成者情報 ---
    user_id = Column(Integer, nullable=True)          # ← FK なし / NULL 許容
    user_email = Column(Text, nullable=True)

    # --- タイムスタンプ ---
    created_at = Column(DateTime(timezone=True),
                        server_default=func.now(),
                        nullable=False)
    updated_at = Column(DateTime(timezone=True),
                        server_default=func.now(),
                        onupdate=func.now(),
                        nullable=False)

    # --- リレーション ---
    options = relationship("Option",
                           back_populates="theme",
                           cascade="all, delete")
