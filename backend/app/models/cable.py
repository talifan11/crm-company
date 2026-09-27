"""
Модель кабельной линии
"""
import enum
from datetime import datetime, date
from sqlalchemy import String, Integer, Float, DateTime, Date, Text, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.database import Base


class CableType(str, enum.Enum):
    optical = "optical"      # Оптический
    copper = "copper"        # Медный
    coaxial = "coaxial"      # Коаксиальный


class LayingMethod(str, enum.Enum):
    ground = "ground"        # В земле
    sewer = "sewer"          # В канализации
    aerial = "aerial"        # Воздушная
    wall = "wall"            # По стене


class Cable(Base):
    __tablename__ = "cables"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    cable_type: Mapped[CableType] = mapped_column(Enum(CableType), nullable=False)
    laying_method: Mapped[LayingMethod] = mapped_column(Enum(LayingMethod), nullable=False)
    length_m: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Связи с объектами
    from_object_id: Mapped[int] = mapped_column(ForeignKey("objects.id"), nullable=False)
    to_object_id: Mapped[int] = mapped_column(ForeignKey("objects.id"), nullable=False)
    
    # Геометрия — линия трассы
    geometry = mapped_column(Geometry("LINESTRING", srid=4326), nullable=False)
    
    owner: Mapped[str] = mapped_column(String(255), nullable=True)
    install_date: Mapped[date] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    from_object = relationship("Object", foreign_keys=[from_object_id], lazy="selectin")
    to_object = relationship("Object", foreign_keys=[to_object_id], lazy="selectin")
    attachments = relationship("Attachment", back_populates="cable", lazy="selectin",
                               primaryjoin="and_(Attachment.entity_type=='cable', foreign(Attachment.entity_id)==Cable.id)")
