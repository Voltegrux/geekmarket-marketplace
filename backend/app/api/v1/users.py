from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import verify_password, get_password_hash
from app.core.storage import upload_file
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserResponse, UserUpdate, UserPasswordUpdate
import uuid

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)
    return await repo.update(current_user)


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
    file_data = await file.read()
    if len(file_data) > 5 * 1024 * 1024:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Avatar too large (max 5MB)")

    object_name = f"public/avatars/{uuid.uuid4()}.{ext}"
    await upload_file(file_data, object_name, file.content_type or "image/jpeg")

    repo = UserRepository(db)
    current_user.avatar_url = f"http://localhost:9000/geekmarket/{object_name}"
    return await repo.update(current_user)


@router.post("/me/password")
async def change_password(
    data: UserPasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Wrong current password")
    repo = UserRepository(db)
    current_user.password_hash = get_password_hash(data.new_password)
    await repo.update(current_user)
    return {"message": "Password updated"}


@router.get("/{username}", response_model=UserResponse)
async def get_user_profile(username: str, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    repo = UserRepository(db)
    user = await repo.get_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
