# ISP CRM — Система учёта кабельных линий

CRM-панель для интернет-провайдера: учёт кабельных линий на карте с привязкой паспортов и документации к каждому объекту.

## Стек

### Backend
- Python 3.11 + FastAPI
- SQLAlchemy 2.0 (async) + Alembic
- PostgreSQL 15 + PostGIS 3.3
- MinIO (S3-совместимое хранилище)
- JWT аутентификация (access + refresh)

### Frontend
- React 18 + TypeScript + Vite
- MapLibre GL JS (карта)
- TailwindCSS
- TanStack Query + Zustand
- React Router v6

### Инфраструктура
- Docker Compose (app, db, minio, nginx)
- Nginx reverse proxy

## Быстрый старт

```bash
# 1. Клонировать и настроить
cp .env.example .env
# Отредактировать .env (секреты!)

# 2. Запустить
docker-compose up -d

# 3. Применить миграции
docker-compose exec backend alembic upgrade head

# 4. Открыть
# Frontend: http://localhost:5173
# API docs: http://localhost:8000/docs
# MinIO:    http://localhost:9001
```

## Демо-доступ (фронтенд)

| Email | Пароль | Роль |
|-------|--------|------|
| admin@isp.ru | admin123 | Администратор |
| engineer@isp.ru | eng123 | Инженер |
| viewer@isp.ru | view123 | Наблюдатель |

## API (REST, /api/v1)

- `POST /auth/login` — вход
- `POST /auth/refresh` — обновление токена
- `GET /auth/me` — текущий пользователь
- `GET /cables` — список кабелей (с bbox-фильтрацией)
- `POST /cables` — создать кабель
- `GET /objects` — список объектов
- `POST /objects` — создать объект
- `POST /objects/{id}/attachments` — загрузить документ
- `GET /attachments/{id}/download` — presigned URL

## Роли и права

| Роль | Кабели | Объекты | Документы | Пользователи | Аудит |
|------|--------|---------|-----------|--------------|-------|
| admin | CRUD | CRUD | CRUD | CRUD | R |
| engineer | CRUD | CRUD | CRUD | — | — |
| viewer | R | R | R | — | — |

## Структура проекта

См. [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

## Тесты

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm run test
```
