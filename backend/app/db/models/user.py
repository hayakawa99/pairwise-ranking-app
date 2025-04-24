from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)
    image = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # リレーション
    votes = relationship("Vote", back_populates="user")
