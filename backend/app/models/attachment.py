"""
Модель вложения (документы, паспорта, схемы)
"""
import enum
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class EntityType(str, enum.Enum):
    cable = "cable"
    object = "object"


class DocCategory(str, enum.Enum):
    passport = "passport"    # Паспорт
    scheme = "scheme"        # Схема
    approval = "approval"    # Согласование
    act = "act"              # Акт
    photo = "photo"          # Фото
    other = "other"          # Прочее


class Attachment(Base):
    __tablename__ = "attachments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    entity_type: Mapped[EntityType] = mapped_column(Enum(EntityType), nullable=False)
    entity_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    
    file_key: Mapped[str] = mapped_column(String(500), nullable=False)  # Ключ в MinIO
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size: Mapped[int] = mapped_column(Integer, nullable=False)  # Размер в байтах
    
    uploaded_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    doc_category: Mapped[DocCategory] = mapped_column(Enum(DocCategory), default=DocCategory.other)

    # Relationships (полиморфные — через entity_type)
    cable = relationship("Cable", foreign_keys=[entity_id],
                         primaryjoin="and_(Attachment.entity_type=='cable', foreign(Attachment.entity_id)==Cable.id)",
                         overlaps="attachments", viewonly=True)
    object = relationship("Object", foreign_keys=[entity_id],
                          primaryjoin="and_(Attachment.entity_type=='object', foreign(Attachment.entity_id)==Object.id)",
                          overlaps="attachments", viewonly=True)
    uploader = relationship("User", lazy="selectin")
