"""
Pydantic-схемы для бригад
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.brigade import BrigadeStatus


class BrigadeCreate(BaseModel):
    name: str
    lead_user_id: int
    member_ids: List[int] = []
    zone_id: Optional[int] = None
    phone: Optional[str] = None
    vehicle: Optional[str] = None
    status: BrigadeStatus = BrigadeStatus.active
    notes: Optional[str] = None


class BrigadeUpdate(BaseModel):
    name: Optional[str] = None
    lead_user_id: Optional[int] = None
    member_ids: Optional[List[int]] = None
    zone_id: Optional[int] = None
    phone: Optional[str] = None
    vehicle: Optional[str] = None
    status: Optional[BrigadeStatus] = None
    notes: Optional[str] = None


class BrigadeResponse(BaseModel):
    id: int
    name: str
    lead_user_id: int
    member_ids: List[int]
    zone_id: Optional[int]
    phone: Optional[str]
    vehicle: Optional[str]
    status: BrigadeStatus
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BrigadeListResponse(BaseModel):
    items: List[BrigadeResponse]
    total: int
