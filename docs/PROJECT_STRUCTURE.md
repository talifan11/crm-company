# Структура репозитория CRM интернет-провайдера

```
isp-crm/
├── docker-compose.yml          # Оркестрация контейнеров
├── .env.example                # Шаблон переменных окружения
├── nginx/
│   └── nginx.conf              # Конфигурация reverse proxy
│
├── backend/                    # FastAPI приложение
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       └── 001_initial.py
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # Точка входа FastAPI
│   │   ├── config.py           # Настройки из .env
│   │   ├── database.py         # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── cable.py
│   │   │   ├── object.py
│   │   │   ├── attachment.py
│   │   │   └── audit_log.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── cable.py
│   │   │   ├── object.py
│   │   │   ├── attachment.py
│   │   │   └── auth.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py         # Зависимости (auth, db)
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py   # Главный роутер v1
│   │   │   │   ├── auth.py
│   │   │   │   ├── cables.py
│   │   │   │   ├── objects.py
│   │   │   │   ├── attachments.py
│   │   │   │   ├── users.py
│   │   │   │   ├── search.py
│   │   │   │   └── audit.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # JWT, password hashing
│   │   │   ├── minio.py        # MinIO клиент
│   │   │   └── audit.py        # Логирование действий
│   │   └── core/
│   │       ├── __init__.py
│   │       ├── security.py     # bcrypt, JWT утилиты
│   │       └── exceptions.py   # Кастомные исключения
│   └── tests/
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_cables.py
│       └── test_objects.py
│
├── frontend/                   # React + Vite приложение
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── api/
│       │   ├── client.ts       # Axios instance
│       │   ├── auth.ts
│       │   ├── cables.ts
│       │   ├── objects.ts
│       │   └── attachments.ts
│       ├── components/
│       │   ├── ui/
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Drawer.tsx
│       │   │   ├── Toast.tsx
│       │   │   └── FileUpload.tsx
│       │   ├── map/
│       │   │   ├── MapView.tsx
│       │   │   ├── MapLayers.tsx
│       │   │   ├── DrawControls.tsx
│       │   │   └── FeaturePopup.tsx
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Header.tsx
│       │   │   └── ProtectedRoute.tsx
│       │   └── tables/
│       │       ├── CableTable.tsx
│       │       └── ObjectTable.tsx
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── MapPage.tsx
│       │   ├── CablesPage.tsx
│       │   ├── ObjectsPage.tsx
│       │   ├── DocumentsPage.tsx
│       │   ├── UsersPage.tsx
│       │   └── AuditPage.tsx
│       ├── stores/
│       │   ├── authStore.ts    # Zustand — авторизация
│       │   ├── mapStore.ts     # Zustand — состояние карты
│       │   └── uiStore.ts      # Zustand — тема, drawer
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useCables.ts
│       │   └── useObjects.ts
│       ├── types/
│       │   └── index.ts        # TypeScript типы
│       └── utils/
│           ├── constants.ts
│           └── formatters.ts
│
└── README.md
```
