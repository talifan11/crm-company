"""
Тесты API кабелей
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_cable(client: AsyncClient, auth_headers, db_session):
    """Создание кабеля"""
    # Сначала создаём объекты (from/to)
    from app.models.object import Object, ObjectType
    from geoalchemy2.elements import WKTElement
    
    obj1 = Object(code="T1", name="Test1", object_type=ObjectType.olt, geometry=WKTElement("POINT(37.6 55.7)", srid=4326))
    obj2 = Object(code="T2", name="Test2", object_type=ObjectType.house, geometry=WKTElement("POINT(37.7 55.8)", srid=4326))
    db_session.add_all([obj1, obj2])
    await db_session.commit()
    await db_session.refresh(obj1)
    await db_session.refresh(obj2)
    
    response = await client.post("/api/v1/cables", headers=auth_headers, json={
        "code": "TEST-001",
        "name": "Тестовый кабель",
        "cable_type": "optical",
        "laying_method": "sewer",
        "length_m": 500.0,
        "from_object_id": obj1.id,
        "to_object_id": obj2.id,
        "geometry": "LINESTRING(37.6 55.7, 37.65 55.75, 37.7 55.8)",
        "owner": "Тестовая компания",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["code"] == "TEST-001"
    assert data["cable_type"] == "optical"


@pytest.mark.asyncio
async def test_list_cables(client: AsyncClient, auth_headers):
    """Получение списка кабелей"""
    response = await client.get("/api/v1/cables", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_list_cables_with_bbox(client: AsyncClient, auth_headers):
    """Фильтрация по bbox"""
    response = await client.get("/api/v1/cables?bbox=37.0,55.0,38.0,56.0", headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_list_cables_unauthorized(client: AsyncClient):
    """Без токена — 401"""
    response = await client.get("/api/v1/cables")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_cable_viewer_forbidden(client: AsyncClient, db_session):
    """Viewer не может создавать"""
    from app.models.user import User, UserRole
    from app.core.security import hash_password
    
    viewer = User(email="viewer@test.ru", hashed_password=hash_password("pass"), role=UserRole.viewer, full_name="Viewer")
    db_session.add(viewer)
    await db_session.commit()
    
    # Логинимся как viewer
    resp = await client.post("/api/v1/auth/login", json={"email": "viewer@test.ru", "password": "pass"})
    token = resp.json()["access_token"]
    
    response = await client.post("/api/v1/cables", headers={"Authorization": f"Bearer {token}"}, json={
        "code": "X", "name": "X", "cable_type": "optical", "laying_method": "ground",
        "length_m": 100, "from_object_id": 1, "to_object_id": 2, "geometry": "LINESTRING(0 0, 1 1)",
    })
    assert response.status_code == 403
