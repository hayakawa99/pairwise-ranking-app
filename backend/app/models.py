from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class ThemeORM(Base):
    __tablename__ = "themes"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    options = relationship("OptionORM", back_populates="theme", cascade="all, delete")

class OptionORM(Base):
    __tablename__ = "options"
    id = Column(Integer, primary_key=True)
    label = Column(String, nullable=False)
    rating = Column(Float, default=1500)
    theme_id = Column(Integer, ForeignKey("themes.id"))
    theme = relationship("ThemeORM", back_populates="options")
