from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.favorite import Favorite
from app.models.product import Product
from app.repositories.base import BaseRepository


class FavoriteRepository(BaseRepository[Favorite]):
    def __init__(self, db: AsyncSession):
        super().__init__(Favorite, db)

    async def get_user_favorite(self, user_id: int, product_id: int) -> Favorite | None:
        result = await self.db.execute(
            select(Favorite).where(Favorite.user_id == user_id, Favorite.product_id == product_id)
        )
        return result.scalar_one_or_none()

    async def get_user_favorites(self, user_id: int, skip: int = 0, limit: int = 20) -> tuple[list[Favorite], int]:
        count = await self.db.execute(
            select(func.count()).where(Favorite.user_id == user_id)
        )
        total = count.scalar_one()
        result = await self.db.execute(
            select(Favorite)
            .options(
                selectinload(Favorite.product).selectinload(Product.seller),
                selectinload(Favorite.product).selectinload(Product.category),
                selectinload(Favorite.product).selectinload(Product.tags),
            )
            .where(Favorite.user_id == user_id)
            .order_by(desc(Favorite.created_at))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all()), total
