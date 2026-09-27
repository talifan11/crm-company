"""
Pydantic-схемы для объектов
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.object import ObjectType
from app.schemas.attachment import AttachmentResponse


class ObjectCreate(BaseModel):
    code: str
    name: str
    object_type: ObjectType
    address: Optional[str] = None
    geometry: str  # WKT POINT
    parent_id: Optional[int] = None
    notes: Optional[str] = None


class ObjectUpdate(BaseModel):
    name: Optional[str] = None
    object_type: Optional[ObjectType] = None
    address: Optional[str] = None
    parent_id: Optional[int] = None
    notes: Optional[str] = None


class ObjectResponse(BaseModel):
    id: int
    code: str
    name: str
    object_type: ObjectType
    address: Optional[str]
    geometry: str  # WKT
    parent_id: Optional[int]
    notes: Optional[str]
    created_at: datetime
    attachments: List[AttachmentResponse] = []

    class Config:
        from_attributes = True


class ObjectListResponse(BaseModel):
    items: List[ObjectResponse]
    total: int
