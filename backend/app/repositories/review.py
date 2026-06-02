from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review import Review
from app.repositories.base import BaseRepository


class ReviewRepository(BaseRepository[Review]):
    def __init__(self, db: AsyncSession):
        super().__init__(Review, db)

    async def get_product_reviews(self, product_id: int, skip: int = 0, limit: int = 20) -> tuple[list[Review], int]:
        count = await self.db.execute(
            select(func.count()).where(Review.product_id == product_id)
        )
        total = count.scalar_one()
        result = await self.db.execute(
            select(Review)
            .options(selectinload(Review.user))
            .where(Review.product_id == product_id)
            .order_by(desc(Review.created_at))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all()), total

    async def get_user_review(self, user_id: int, product_id: int) -> Review | None:
        result = await self.db.execute(
            select(Review).where(Review.user_id == user_id, Review.product_id == product_id)
        )
        return result.scalar_one_or_none()

    async def get_rating_distribution(self, product_id: int) -> dict[int, int]:
        result = await self.db.execute(
            select(Review.rating, func.count(Review.id))
            .where(Review.product_id == product_id)
            .group_by(Review.rating)
        )
        distribution = {i: 0 for i in range(1, 6)}
        for rating, count in result.all():
            distribution[rating] = count
        return distribution
