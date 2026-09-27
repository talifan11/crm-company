"""
Роутер аутентификации: login, refresh, me
"""
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Вход в систему. Refresh token — в httpOnly cookie."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль")
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Аккаунт заблокирован")
    
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    # Refresh token в httpOnly cookie на 7 дней
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # В проде: True
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )
    
    return TokenResponse(access_token=access_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(response: Response, refresh_token: str = Depends(lambda r: r.cookies.get("refresh_token"))):
    """Обновить access token по refresh token из cookie"""
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token отсутствует")
    
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Неверный тип токена")
    except Exception:
        raise HTTPException(status_code=401, detail="Недействительный refresh token")
    
    new_access = create_access_token({"sub": payload["sub"]})
    return TokenResponse(access_token=new_access)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Информация о текущем пользователе"""
    return current_user
