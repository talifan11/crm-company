"""
Pytest fixtures для тестирования API
"""
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.database import get_db, Base
from app.main import app
from app.core.security import hash_password
from app.models.user import User, UserRole


# Тестовая БД (in-memory SQLite для тестов)
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

engine_test = create_async_engine(TEST_DATABASE_URL, echo=False)
async_session_test = async_sessionmaker(engine_test, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
async def setup_db():
    """Создать таблицы перед тестами"""
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session(setup_db):
    """Сессия БД для каждого теста"""
    async with async_session_test() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def client(db_session):
    """HTTP-клиент с подменой БД"""
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest.fixture
async def admin_user(db_session):
    """Создать тестового админа"""
    user = User(
        email="test_admin@test.ru",
        hashed_password=hash_password("testpass"),
        role=UserRole.admin,
        full_name="Тест Админ",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def engineer_user(db_session):
    """Создать тестового инженера"""
    user = User(
        email="test_engineer@test.ru",
        hashed_password=hash_password("testpass"),
        role=UserRole.engineer,
        full_name="Тест Инженер",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def auth_headers(client, admin_user):
    """Заголовки авторизации для админа"""
    response = await client.post("/api/v1/auth/login", json={
        "email": "test_admin@test.ru",
        "password": "testpass",
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
