"""
Модель журнала аудита
"""
import enum
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class AuditAction(str, enum.Enum):
    create = "create"
    update = "update"
    delete = "delete"
    login = "login"
    logout = "logout"
    upload = "upload"
    download = "download"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    action: Mapped[AuditAction] = mapped_column(Enum(AuditAction), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=True)
    entity_id: Mapped[int] = mapped_column(Integer, nullable=True)
    payload: Mapped[str] = mapped_column(Text, nullable=True)  # JSON с изменениями
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", lazy="selectin")
