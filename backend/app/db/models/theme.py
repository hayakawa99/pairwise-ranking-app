from sqlalchemy import Column, Integer, Text, DateTime
from sqlalchemy.orm import relationship, Session
from sqlalchemy.sql import func
from fastapi import HTTPException

from app.db.base import Base
from app.db.models.option import Option

class Theme(Base):
    __tablename__ = "themes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    options = relationship("Option", back_populates="theme", cascade="all, delete")

    @staticmethod
    def get_theme_and_option_or_404(db: Session, theme_id: int, option_id: int):
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")

        option = db.query(Option).filter(
            Option.id == option_id, Option.theme_id == theme_id
        ).first()
        if not option:
            raise HTTPException(status_code=404, detail="Option not found")

        return theme, option
