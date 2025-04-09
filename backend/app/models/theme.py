from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base

class ThemeORM(Base):
    __tablename__ = "themes"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    options = relationship("OptionORM", back_populates="theme", cascade="all, delete")
