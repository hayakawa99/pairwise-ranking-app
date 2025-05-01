from sqlalchemy import Column, Integer, Text, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class SimaenagaLine(Base):
    __tablename__ = "simaenaga_lines"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
