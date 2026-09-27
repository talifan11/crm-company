"""
Тесты API бригад
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_brigade(client: AsyncClient, auth_headers):
    """Создание бригады"""
    response = await client.post("/api/v1/brigades", headers=auth_headers, json={
        "name": "Бригада №1",
        "lead_user_id": 1,
        "member_ids": [2, 3],
        "phone": "+79991234567",
        "vehicle": "ГАЗель",
        "status": "active",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Бригада №1"
    assert data["status"] == "active"


@pytest.mark.asyncio
async def test_list_brigades(client: AsyncClient, auth_headers):
    """Получение списка бригад"""
    response = await client.get("/api/v1/brigades", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_list_brigades_with_status_filter(client: AsyncClient, auth_headers):
    """Фильтрация по статусу"""
    response = await client.get("/api/v1/brigades?status=active", headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_online_brigades(client: AsyncClient, auth_headers):
    """Получение бригад онлайн"""
    response = await client.get("/api/v1/brigades/online", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_update_brigade(client: AsyncClient, auth_headers, db_session):
    """Обновление бригады"""
    # Сначала создаём
    from app.models.brigade import Brigade
    brigade = Brigade(name="Test Brigade", lead_user_id=1, member_ids=[])
    db_session.add(brigade)
    await db_session.commit()
    await db_session.refresh(brigade)
    
    response = await client.put(
        f"/api/v1/brigades/{brigade.id}",
        headers=auth_headers,
        json={"status": "on_ticket", "phone": "+79999999999"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "on_ticket"
    assert data["phone"] == "+79999999999"


@pytest.mark.asyncio
async def test_delete_brigade(client: AsyncClient, auth_headers, db_session):
    """Удаление бригады (soft delete)"""
    from app.models.brigade import Brigade
    brigade = Brigade(name="To Delete", lead_user_id=1, member_ids=[])
    db_session.add(brigade)
    await db_session.commit()
    await db_session.refresh(brigade)
    
    response = await client.delete(f"/api/v1/brigades/{brigade.id}", headers=auth_headers)
    assert response.status_code == 204
    
    # Проверяем что brigade помечена как удалённая
    await db_session.refresh(brigade)
    assert brigade.deleted_at is not None


@pytest.mark.asyncio
async def test_brigade_not_found(client: AsyncClient, auth_headers):
    """Бригада не найдена"""
    response = await client.get("/api/v1/brigades/99999", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_brigade_unauthorized(client: AsyncClient):
    """Без авторизации — 401"""
    response = await client.post("/api/v1/brigades", json={
        "name": "Test",
        "lead_user_id": 1,
    })
    assert response.status_code == 401
