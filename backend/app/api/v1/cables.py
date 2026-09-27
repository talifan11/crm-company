"""
Роутер кабелей: CRUD + фильтрация по bbox для карты
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.database import get_db
from app.models.cable import Cable, CableType, LayingMethod
from app.schemas.cable import CableCreate, CableUpdate, CableResponse, CableListResponse
from app.api.deps import require_engineer, require_any
from app.models.user import User

router = APIRouter(prefix="/cables", tags=["cables"])


@router.get("", response_model=CableListResponse)
async def list_cables(
    bbox: Optional[str] = Query(None, description="Bounding box: minx,miny,maxx,maxy"),
    type: Optional[CableType] = Query(None),
    method: Optional[LayingMethod] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_any),
):
    """Получить список кабелей с опциональной фильтрацией по bbox"""
    query = select(Cable)
    count_query = select(func.count(Cable.id))
    
    # Фильтр по bounding box (PostGIS)
    if bbox:
        coords = [float(x) for x in bbox.split(",")]
        if len(coords) == 4:
            from geoalchemy2.functions import ST_MakeEnvelope
            envelope = ST_MakeEnvelope(coords[0], coords[1], coords[2], coords[3], 4326)
            query = query.where(Cable.geometry.intersects(envelope))
            count_query = count_query.where(Cable.geometry.intersects(envelope))
    
    if type:
        query = query.where(Cable.cable_type == type)
        count_query = count_query.where(Cable.cable_type == type)
    
    if method:
        query = query.where(Cable.laying_method == method)
        count_query = count_query.where(Cable.laying_method == method)
    
    # Считаем total
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Пагинация
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return CableListResponse(items=items, total=total)


@router.post("", response_model=CableResponse, status_code=201)
async def create_cable(
    data: CableCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_engineer),
):
    """Создать кабель"""
    from geoalchemy2.elements import WKTElement
    cable = Cable(
        **data.model_dump(exclude={"geometry"}),
        geometry=WKTElement(data.geometry, srid=4326),
    )
    db.add(cable)
    await db.flush()
    await db.refresh(cable)
    return cable


@router.get("/{cable_id}", response_model=CableResponse)
async def get_cable(
    cable_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_any),
):
    """Получить кабель по ID"""
    result = await db.execute(select(Cable).where(Cable.id == cable_id))
    cable = result.scalar_one_or_none()
    if not cable:
        raise HTTPException(status_code=404, detail="Кабель не найден")
    return cable


@router.put("/{cable_id}", response_model=CableResponse)
async def update_cable(
    cable_id: int,
    data: CableUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_engineer),
):
    """Обновить кабель"""
    result = await db.execute(select(Cable).where(Cable.id == cable_id))
    cable = result.scalar_one_or_none()
    if not cable:
        raise HTTPException(status_code=404, detail="Кабель не найден")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(cable, key, value)
    
    await db.flush()
    await db.refresh(cable)
    return cable


@router.delete("/{cable_id}", status_code=204)
async def delete_cable(
    cable_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_engineer),
):
    """Удалить кабель"""
    result = await db.execute(select(Cable).where(Cable.id == cable_id))
    cable = result.scalar_one_or_none()
    if not cable:
        raise HTTPException(status_code=404, detail="Кабель не найден")
    
    await db.delete(cable)
