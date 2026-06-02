from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review import Review
from app.models.notification import Notification
from app.repositories.review import ReviewRepository
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse, ReviewsStats


class ReviewService:
    def __init__(self, db: AsyncSession):
        self.review_repo = ReviewRepository(db)
        self.order_repo = OrderRepository(db)
        self.product_repo = ProductRepository(db)
        self.db = db

    async def create_review(self, product_id: int, data: ReviewCreate, user_id: int) -> ReviewResponse:
        purchased = await self.order_repo.user_purchased_product(user_id, product_id)
        if not purchased:
            raise HTTPException(status_code=403, detail="You must purchase the product first")

        existing = await self.review_repo.get_user_review(user_id, product_id)
        if existing:
            raise HTTPException(status_code=400, detail="You already reviewed this product")

        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        review = Review(user_id=user_id, product_id=product_id, rating=data.rating, comment=data.comment)
        review = await self.review_repo.create(review)
        await self.product_repo.update_rating(product_id)

        notification = Notification(
            user_id=product.seller_id,
            title="Новый отзыв",
            message=f"На ваш товар «{product.title}» оставлен отзыв с оценкой {data.rating}/5",
            type="review",
        )
        self.db.add(notification)
        await self.db.flush()
        await self.db.refresh(review)

        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        result = await self.db.execute(
            select(Review).options(selectinload(Review.user)).where(Review.id == review.id)
        )
        review = result.scalar_one()
        return ReviewResponse.model_validate(review)

    async def get_product_reviews(
        self, product_id: int, page: int = 1, per_page: int = 20
    ) -> dict:
        skip = (page - 1) * per_page
        reviews, total = await self.review_repo.get_product_reviews(product_id, skip=skip, limit=per_page)
        distribution = await self.review_repo.get_rating_distribution(product_id)
        avg = sum(k * v for k, v in distribution.items()) / max(total, 1)

        return {
            "items": [ReviewResponse.model_validate(r) for r in reviews],
            "total": total,
            "page": page,
            "per_page": per_page,
            "stats": ReviewsStats(
                average_rating=round(avg, 2),
                total_reviews=total,
                rating_distribution=distribution,
            ),
        }

    async def delete_review(self, review_id: int, user_id: int, is_admin: bool = False) -> None:
        review = await self.review_repo.get_by_id(review_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        if not is_admin and review.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your review")
        product_id = review.product_id
        await self.review_repo.delete(review)
        await self.product_repo.update_rating(product_id)
