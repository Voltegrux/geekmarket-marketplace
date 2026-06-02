from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.favorite import Favorite
from app.repositories.favorite import FavoriteRepository
from app.schemas.product import ProductListResponse

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("/", response_model=dict)
async def get_my_favorites(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = FavoriteRepository(db)
    skip = (page - 1) * per_page
    favorites, total = await repo.get_user_favorites(current_user.id, skip=skip, limit=per_page)
    items = []
    for fav in favorites:
        items.append(ProductListResponse.model_validate({**fav.product.__dict__, "is_favorited": True}))
    pages = (total + per_page - 1) // per_page
    return {"items": items, "total": total, "page": page, "per_page": per_page, "pages": pages}


@router.post("/{product_id}", status_code=201)
async def add_to_favorites(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = FavoriteRepository(db)
    existing = await repo.get_user_favorite(current_user.id, product_id)
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")
    fav = Favorite(user_id=current_user.id, product_id=product_id)
    await repo.create(fav)
    return {"message": "Added to favorites"}


@router.delete("/{product_id}", status_code=204)
async def remove_from_favorites(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = FavoriteRepository(db)
    fav = await repo.get_user_favorite(current_user.id, product_id)
    if not fav:
        raise HTTPException(status_code=404, detail="Not in favorites")
    await repo.delete(fav)
