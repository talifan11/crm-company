"""
Pydantic-схемы для импорта данных
"""
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from enum import Enum


class ConflictAction(str, Enum):
    skip = "skip"
    merge = "merge"
    overwrite = "overwrite"


class ImportItemPreview(BaseModel):
    """Элемент при предпросмотре"""
    entity_type: str
    code: str
    name: str
    geometry: Dict[str, Any]  # GeoJSON geometry
    attributes: Dict[str, Any] = {}
    layer_name: str = ""
    row_index: int = 0
    is_duplicate: bool = False


class ImportPreviewResponse(BaseModel):
    """Ответ предпросмотра импорта"""
    format: str
    total: int
    success: int
    errors: int
    duplicates: int
    duplicate_codes: List[str] = []
    error_messages: List[str] = []
    items: List[ImportItemPreview] = []


class ImportItemConfirm(BaseModel):
    """Элемент для подтверждения импорта"""
    entity_type: str
    code: str
    name: str
    geometry: Dict[str, Any]
    attributes: Dict[str, Any] = {}


class ImportConfirmRequest(BaseModel):
    """Запрос подтверждения импорта"""
    items: List[ImportItemConfirm]
    conflict_action: ConflictAction = ConflictAction.skip


class ImportConfirmResponse(BaseModel):
    """Ответ подтверждения импорта"""
    created: int
    updated: int
    skipped: int
    errors: List[str] = []
