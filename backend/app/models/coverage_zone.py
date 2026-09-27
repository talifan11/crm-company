"""
Модель зоны покрытия (заглушка для Шага 1)
Полная реализация будет в Шаге 5
"""
import enum
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geometry
from app.database import Base


class ZoneType(str, enum.Enum):
    service_area = "service_area"
    brigade_area = "brigade_area"
    planned_build = "planned_build"
    competitor_area = "competitor_area"
    problem_area = "problem_area"


class CoverageZone(Base):
    __tablename__ = "coverage_zones"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    zone_type: Mapped[ZoneType] = mapped_column(Enum(ZoneType), nullable=False)
    
    geometry = mapped_column(Geometry("POLYGON", srid=4326), nullable=False)
    
    status: Mapped[str] = mapped_column(String(50), default="active")
    color_override: Mapped[str] = mapped_column(String(7), nullable=True)  # hex color
    brigade_id: Mapped[int] = mapped_column(ForeignKey("brigades.id"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
