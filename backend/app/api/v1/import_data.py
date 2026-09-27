"""
Роутер импорта данных: KML, GeoJSON, CSV
"""
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import json

from app.database import get_db
from app.models.cable import Cable, CableType, LayingMethod
from app.models.object import Object, ObjectType
from app.models.user import User
from app.api.deps import require_engineer
from app.services.import_service import import_service, ImportResult, ConflictAction
from app.schemas.import_schema import (
    ImportPreviewResponse, 
    ImportConfirmRequest, 
    ImportConfirmResponse,
    ImportItemResponse,
)

router = APIRouter(prefix="/import", tags=["import"])


@router.post("/preview", response_model=ImportPreviewResponse)
async def preview_import(
    file: UploadFile = File(...),
    entity_type: str = Form(default="auto"),  # auto, cable, object
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_engineer),
):
    """
    Предпросмотр импорта — парсит файл и возвращает список элементов.
    Не создаёт записи в БД.
    """
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Файл пуст")
    
    # Определяем формат
    fmt = import_service.detect_format(file.filename or "", content)
    if not fmt:
        raise HTTPException(status_code=400, detail="Не удалось определить формат файла. Поддерживаются: KML, KMZ, GeoJSON, CSV")
    
    # Парсим
    if fmt.value == "kml":
        result = import_service.parse_kml(content)
    elif fmt.value == "kmz":
        result = import_service.parse_kmz(content)
    elif fmt.value == "geojson":
        result = import_service.parse_geojson(content)
    elif fmt.value == "csv":
        # Для CSV нужно знать entity_type
        et = entity_type if entity_type != "auto" else "cable"
        result = import_service.parse_csv(content, entity_type=et)
    else:
        raise HTTPException(status_code=400, detail=f"Формат {fmt} пока не поддерживается")
    
    # Проверяем дубликаты по code
    codes = [item.code for item in result.items]
    if codes:
        # Проверяем в БД
        existing_cables = await db.execute(select(Cable.code).where(Cable.code.in_(codes)))
        existing_objects = await db.execute(select(Object.code).where(Object.code.in_(codes)))
        
        existing_codes = set(existing_cables.scalars().all()) | set(existing_objects.scalars().all())
        result.duplicate_codes = list(existing_codes)
        result.duplicates = len(existing_codes)
    
    return ImportPreviewResponse(
        format=fmt.value,
        total=result.total,
        success=result.success,
        errors=result.errors,
        duplicates=result.duplicates,
        duplicate_codes=result.duplicate_codes,
        error_messages=result.error_messages,
        items=[
            ImportItemResponse(
                entity_type=item.entity_type,
                code=item.code,
                name=item.name,
                geometry=json.loads(item.geometry),
                attributes=item.attributes,
                layer_name=item.layer_name,
                row_index=item.row_index,
                is_duplicate=item.code in result.duplicate_codes,
            )
            for item in result.items
        ],
    )


@router.post("/confirm", response_model=ImportConfirmResponse)
async def confirm_import(
     ImportConfirmRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_engineer),
):
    """
    Подтверждение импорта — создаёт записи в БД.
    conflict_action: skip (пропустить дубли), merge (обновить), overwrite (заменить).
    """
    created = 0
    updated = 0
    skipped = 0
    errors = []
    
    for item in data.items:
        try:
            geom_json = json.dumps(item.geometry)
            
            if item.entity_type == "cable":
                # Проверяем дубликат
                existing = await db.execute(select(Cable).where(Cable.code == item.code))
                cable = existing.scalar_one_or_none()
                
                if cable:
                    if data.conflict_action == ConflictAction.skip:
                        skipped += 1
                        continue
                    elif data.conflict_action in (ConflictAction.merge, ConflictAction.overwrite):
                        # Обновляем
                        cable.name = item.name or cable.name
                        if item.attributes.get('cable_type'):
                            cable.cable_type = CableType(item.attributes['cable_type'])
                        if item.attributes.get('laying_method'):
                            cable.laying_method = LayingMethod(item.attributes['laying_method'])
                        if item.attributes.get('length_m'):
                            cable.length_m = float(item.attributes['length_m'])
                        updated += 1
                else:
                    # Создаём новый кабель
                    from geoalchemy2.elements import WKTElement
                    coords = item.geometry.get('coordinates', [])
                    if len(coords) >= 2:
                        wkt = "LINESTRING(" + ",".join(f"{c[0]} {c[1]}" for c in coords) + ")"
                        
                        cable = Cable(
                            code=item.code,
                            name=item.name,
                            cable_type=CableType(item.attributes.get('cable_type', 'optical')),
                            laying_method=LayingMethod(item.attributes.get('laying_method', 'ground')),
                            length_m=float(item.attributes.get('length_m', 0)),
                            from_object_id=item.attributes.get('from_object_id', 1),  # TODO: маппинг
                            to_object_id=item.attributes.get('to_object_id', 1),
                            geometry=WKTElement(wkt, srid=4326),
                            owner=item.attributes.get('owner'),
                            notes=item.attributes.get('notes'),
                        )
                        db.add(cable)
                        created += 1
            
            elif item.entity_type == "object":
                existing = await db.execute(select(Object).where(Object.code == item.code))
                obj = existing.scalar_one_or_none()
                
                if obj:
                    if data.conflict_action == ConflictAction.skip:
                        skipped += 1
                        continue
                    elif data.conflict_action in (ConflictAction.merge, ConflictAction.overwrite):
                        obj.name = item.name or obj.name
                        if item.attributes.get('object_type'):
                            obj.object_type = ObjectType(item.attributes['object_type'])
                        if item.attributes.get('address'):
                            obj.address = item.attributes['address']
                        updated += 1
                else:
                    from geoalchemy2.elements import WKTElement
                    coords = item.geometry.get('coordinates', [])
                    if len(coords) >= 2:
                        wkt = f"POINT({coords[0]} {coords[1]})"
                        
                        obj = Object(
                            code=item.code,
                            name=item.name,
                            object_type=ObjectType(item.attributes.get('object_type', 'house')),
                            address=item.attributes.get('address'),
                            geometry=WKTElement(wkt, srid=4326),
                            notes=item.attributes.get('notes'),
                        )
                        db.add(obj)
                        created += 1
        
        except Exception as e:
            errors.append(f"{item.code}: {str(e)}")
    
    await db.commit()
    
    return ImportConfirmResponse(
        created=created,
        updated=updated,
        skipped=skipped,
        errors=errors,
    )


@router.get("/templates")
async def get_import_templates():
    """Возвращает ссылки на шаблоны CSV для скачивания"""
    return {
        "cables_csv": {
            "filename": "template_cables.csv",
            "columns": ["code", "name", "cable_type", "laying_method", "from_lon", "from_lat", "to_lon", "to_lat", "owner", "notes"],
            "example": "OK-001;Оптический кабель;optical;sewer;37.6;55.7;37.7;55.8;ООО Провайдер;24 волокна",
        },
        "objects_csv": {
            "filename": "template_objects.csv",
            "columns": ["code", "name", "object_type", "lon", "lat", "address", "notes"],
            "example": "MH-001;Колодец К-15;manhole;37.607;55.761;ул. Тверская;Глубина 2.5м",
        },
        "cable_types": ["optical", "copper", "coaxial"],
        "laying_methods": ["ground", "sewer", "aerial", "wall"],
        "object_types": ["house", "manhole", "coupling", "olt", "splitter", "cross_box", "substation"],
    }
