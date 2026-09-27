"""
Модель смены бригады
"""
import enum
from datetime import datetime
from sqlalchemy import Integer, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.database import Base


class ShiftStatus(str, enum.Enum):
    started = "started"        # Начата
    active = "active"          # Активна
    paused = "paused"          # Пауза
    ended = "ended"            # Завершена


class BrigadeShift(Base):
    __tablename__ = "brigade_shifts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    brigade_id: Mapped[int] = mapped_column(ForeignKey("brigades.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ended_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    
    status: Mapped[ShiftStatus] = mapped_column(Enum(ShiftStatus), default=ShiftStatus.started)
    
    # Геопозиция начала и конца смены
    geo_start = mapped_column(Geometry("POINT", srid=4326), nullable=True)
    geo_end = mapped_column(Geometry("POINT", srid=4326), nullable=True)
    
    notes: Mapped[str] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    brigade = relationship("Brigade", back_populates="shifts", lazy="selectin")
    user = relationship("User", lazy="selectin")
