"""
Модель объекта инфраструктуры (дом, колодец, муфта и т.д.)
"""
import enum
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.database import Base


class ObjectType(str, enum.Enum):
    house = "house"              # Дом
    manhole = "manhole"          # Колодец
    coupling = "coupling"        # Муфта
    olt = "olt"                  # OLT (оптический линейный терминал)
    splitter = "splitter"        # Сплиттер
    cross_box = "cross_box"      # Кросс-бокс
    substation = "substation"    # Подстанция


class Object(Base):
    __tablename__ = "objects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    object_type: Mapped[ObjectType] = mapped_column(Enum(ObjectType), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=True)
    
    # Геометрия — точка
    geometry = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    
    # Иерархия (опционально)
    parent_id: Mapped[int] = mapped_column(ForeignKey("objects.id"), nullable=True)
    
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    parent = relationship("Object", remote_side="Object.id", lazy="selectin")
    attachments = relationship("Attachment", back_populates="object", lazy="selectin",
                               primaryjoin="and_(Attachment.entity_type=='object', foreign(Attachment.entity_id)==Object.id)")
