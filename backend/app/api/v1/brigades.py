"""
Роутер бригад: CRUD + онлайн-статус
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.database import get_db
from app.models.brigade import Brigade, BrigadeStatus
from app.models.brigade_location import BrigadeLocation
from app.schemas.brigade import BrigadeCreate, BrigadeUpdate, BrigadeResponse, BrigadeListResponse
from app.api.deps import require_admin, require_any
from app.models.user import User

router = APIRouter(prefix="/brigades", tags=["brigades"])


@router.get("", response_model=BrigadeListResponse)
async def list_brigades(
    status: Optional[BrigadeStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_any),
):
    """Получить список бригад"""
    query = select(Brigade).where(Brigade.deleted_at.is_(None))
    count_query = select(func.count(Brigade.id)).where(Brigade.deleted_at.is_(None))
    
    if status:
        query = query.where(Brigade.status == status)
        count_query = count_query.where(Brigade.status == status)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return BrigadeListResponse(items=items, total=total)


@router.get("/online", response_model=list[dict])
async def get_online_brigades(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_any),
):
    """Получить бригады онлайн с последней геолокацией"""
    # Подзапрос: последняя локация для каждой бригады
    latest_locations = (
        select(
            BrigadeLocation.brigade_id,
            func.max(BrigadeLocation.recorded_at).label('max_time')
        )
        .group_by(BrigadeLocation.brigade_id)
        .subquery()
    )
    
    # Основной запрос: бригады + их последние локации
    query = (
        select(Brigade, BrigadeLocation)
        .join(latest_locations, Brigade.id == latest_locations.c.brigade_id)
        .join(
            BrigadeLocation,
            (BrigadeLocation.brigade_id == latest_locations.c.brigade_id) &
            (BrigadeLocation.recorded_at == latest_locations.c.max_time)
        )
        .where(Brigade.deleted_at.is_(None))
        .where(Brigade.status.in_([BrigadeStatus.active, BrigadeStatus.on_ticket, BrigadeStatus.en_route]))
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    online_brigades = []
    for brigade, location in rows:
        # Извлекаем координаты из PostGIS
        from geoalchemy2.functions import ST_AsGeoJSON
        geo_result = await db.execute(
            select(ST_AsGeoJSON(location.geometry))
        )
        geojson = geo_result.scalar()
        
        online_brigades.append({
            "brigade_id": brigade.id,
            "brigade_name": brigade.name,
            "status": brigade.status.value,
            "lead_user_id": brigade.lead_user_id,
            "phone": brigade.phone,
            "geometry": geojson,
            "recorded_at": location.recorded_at.isoformat(),
        })
    
    return online_brigades


@router.post("", response_model=BrigadeResponse, status_code=201)
async def create_brigade(
     BrigadeCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_admin),
):
    """Создать бригаду"""
    brigade = Brigade(**data.model_dump())
    db.add(brigade)
    await db.flush()
    await db.refresh(brigade)
    return brigade


@router.get("/{brigade_id}", response_model=BrigadeResponse)
async def get_brigade(
    brigade_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_any),
):
    """Получить бригаду по ID"""
    result = await db.execute(
        select(Brigade).where(Brigade.id == brigade_id, Brigade.deleted_at.is_(None))
    )
    brigade = result.scalar_one_or_none()
    if not brigade:
        raise HTTPException(status_code=404, detail="Бригада не найдена")
    return brigade


@router.put("/{brigade_id}", response_model=BrigadeResponse)
async def update_brigade(
    brigade_id: int,
     BrigadeUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_admin),
):
    """Обновить бригаду"""
    result = await db.execute(
        select(Brigade).where(Brigade.id == brigade_id, Brigade.deleted_at.is_(None))
    )
    brigade = result.scalar_one_or_none()
    if not brigade:
        raise HTTPException(status_code=404, detail="Бригада не найдена")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(brigade, key, value)
    
    await db.flush()
    await db.refresh(brigade)
    return brigade


@router.delete("/{brigade_id}", status_code=204)
async def delete_brigade(
    brigade_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_admin),
):
    """Удалить бригаду (soft delete)"""
    result = await db.execute(
        select(Brigade).where(Brigade.id == brigade_id, Brigade.deleted_at.is_(None))
    )
    brigade = result.scalar_one_or_none()
    if not brigade:
        raise HTTPException(status_code=404, detail="Бригада не найдена")
    
    from datetime import datetime
    brigade.deleted_at = datetime.utcnow()
