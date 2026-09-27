"""
Зависимости для API: аутентификация, права доступа
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User, UserRole
from app.core.security import decode_token

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Получить текущего пользователя из JWT"""
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Неверный тип токена")
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Недействительный токен")
    
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Пользователь не найден или неактивен")
    
    return user


def require_role(*roles: UserRole):
    """Декоратор проверки роли"""
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
        return current_user
    return role_checker


# Удобные алиасы
require_admin = require_role(UserRole.admin)
require_engineer = require_role(UserRole.admin, UserRole.engineer)
require_any = get_current_user  # Любой авторизованный
