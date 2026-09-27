"""
Pydantic-схемы для вложений
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.attachment import EntityType, DocCategory


class AttachmentResponse(BaseModel):
    id: int
    entity_type: EntityType
    entity_id: int
    filename: str
    mime_type: str
    size: int
    doc_category: DocCategory
    uploaded_at: datetime
    download_url: Optional[str] = None

    class Config:
        from_attributes = True
