from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class OptionORM(Base):
    __tablename__ = "options"

    id = Column(Integer, primary_key=True)
    label = Column(String, nullable=False)
    rating = Column(Float, default=1500)
    times_compared = Column(Integer, default=0, nullable=False)

    theme_id = Column(Integer, ForeignKey("themes.id"))
    theme = relationship("ThemeORM", back_populates="options")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
