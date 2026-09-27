"""
Главный роутер API v1
"""
from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.cables import router as cables_router
from app.api.v1.import_data import router as import_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router)
api_v1_router.include_router(cables_router)
api_v1_router.include_router(import_router)
# TODO: objects, attachments, users, search, audit
