"""
Модель бригады
"""
import enum
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, Enum, func, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.database import Base


class BrigadeStatus(str, enum.Enum):
    active = "active"          # Активна
    on_ticket = "on_ticket"    # На заявке
    en_route = "en_route"      # На выезде
    day_off = "day_off"        # Выходной
    inactive = "inactive"      # Неактивна


class Brigade(Base):
    __tablename__ = "brigades"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    lead_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    member_ids: Mapped[list[int]] = mapped_column(ARRAY(Integer), nullable=False, default=[])
    
    # Зона ответственности (опционально)
    zone_id: Mapped[int] = mapped_column(ForeignKey("coverage_zones.id"), nullable=True)
    
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    vehicle: Mapped[str] = mapped_column(String(100), nullable=True)
    status: Mapped[BrigadeStatus] = mapped_column(Enum(BrigadeStatus), default=BrigadeStatus.active)
    
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    lead = relationship("User", foreign_keys=[lead_user_id], lazy="selectin")
    shifts = relationship("BrigadeShift", back_populates="brigade", lazy="selectin")
    locations = relationship("BrigadeLocation", back_populates="brigade", lazy="selectin")
