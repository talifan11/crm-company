"""
Тесты API аутентификации
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, admin_user):
    """Успешный вход"""
    response = await client.post("/api/v1/auth/login", json={
        "email": "test_admin@test.ru",
        "password": "testpass",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, admin_user):
    """Неверный пароль"""
    response = await client.post("/api/v1/auth/login", json={
        "email": "test_admin@test.ru",
        "password": "wrongpass",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    """Несуществующий пользователь"""
    response = await client.post("/api/v1/auth/login", json={
        "email": "nobody@test.ru",
        "password": "anypass",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, auth_headers):
    """Получение информации о себе"""
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test_admin@test.ru"
    assert data["role"] == "admin"


@pytest.mark.asyncio
async def test_get_me_unauthorized(client: AsyncClient):
    """Без токена — 401"""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401
