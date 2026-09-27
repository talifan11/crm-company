"""
Pydantic-схемы для кабелей
"""
from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List
from app.models.cable import CableType, LayingMethod
from app.schemas.attachment import AttachmentResponse


class CableCreate(BaseModel):
    code: str
    name: str
    cable_type: CableType
    laying_method: LayingMethod
    length_m: float
    from_object_id: int
    to_object_id: int
    geometry: str  # WKT LINESTRING
    owner: Optional[str] = None
    install_date: Optional[date] = None
    notes: Optional[str] = None


class CableUpdate(BaseModel):
    name: Optional[str] = None
    cable_type: Optional[CableType] = None
    laying_method: Optional[LayingMethod] = None
    length_m: Optional[float] = None
    owner: Optional[str] = None
    install_date: Optional[date] = None
    notes: Optional[str] = None


class CableResponse(BaseModel):
    id: int
    code: str
    name: str
    cable_type: CableType
    laying_method: LayingMethod
    length_m: float
    from_object_id: int
    to_object_id: int
    geometry: str  # WKT
    owner: Optional[str]
    install_date: Optional[date]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    attachments: List[AttachmentResponse] = []

    class Config:
        from_attributes = True


class CableListResponse(BaseModel):
    items: List[CableResponse]
    total: int
