"""
Модель геолокации бригады (трекинг)
"""
from datetime import datetime
from sqlalchemy import Integer, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.database import Base


class BrigadeLocation(Base):
    __tablename__ = "brigade_locations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    brigade_id: Mapped[int] = mapped_column(ForeignKey("brigades.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    geometry = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    source: Mapped[str] = mapped_column(String(50), nullable=True)  # gps, manual, etc.
    accuracy: Mapped[float] = mapped_column(nullable=True)  # точность в метрах
    speed: Mapped[float] = mapped_column(nullable=True)  # скорость в м/с
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    brigade = relationship("Brigade", back_populates="locations", lazy="selectin")
    user = relationship("User", lazy="selectin")
