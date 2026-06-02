from sqlalchemy import select, func, or_, desc, asc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product, ProductFile, ProductTag
from app.models.favorite import Favorite
from app.models.order import OrderItem, Order
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    def __init__(self, db: AsyncSession):
        super().__init__(Product, db)

    def _with_relations(self):
        return select(Product).options(
            selectinload(Product.seller),
            selectinload(Product.category),
            selectinload(Product.tags),
            selectinload(Product.files),
        )

    async def get_with_relations(self, product_id: int) -> Product | None:
        result = await self.db.execute(
            self._with_relations().where(Product.id == product_id)
        )
        return result.scalar_one_or_none()

    async def get_published(
        self,
        skip: int = 0,
        limit: int = 20,
        category_id: int | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        min_rating: float | None = None,
        sort_by: str = "created_at",
        order: str = "desc",
        search: str | None = None,
    ) -> tuple[list[Product], int]:
        query = self._with_relations().where(Product.is_published == True)  # noqa: E712

        if category_id:
            query = query.where(Product.category_id == category_id)
        if min_price is not None:
            query = query.where(Product.price >= min_price)
        if max_price is not None:
            query = query.where(Product.price <= max_price)
        if min_rating is not None:
            query = query.where(Product.rating >= min_rating)

        if search:
            query = query.where(
                or_(
                    Product.title.ilike(f"%{search}%"),
                    Product.short_description.ilike(f"%{search}%"),
                    Product.description.ilike(f"%{search}%"),
                )
            )

        # Count via subquery
        count_subq = query.subquery()
        count_result = await self.db.execute(
            select(func.count()).select_from(count_subq)
        )
        total = count_result.scalar_one()

        sort_col = getattr(Product, sort_by, Product.created_at)
        if order == "asc":
            query = query.order_by(asc(sort_col))
        else:
            query = query.order_by(desc(sort_col))

        result = await self.db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all()), total

    async def get_featured(self, limit: int = 8) -> list[Product]:
        result = await self.db.execute(
            self._with_relations()
            .where(Product.is_published == True, Product.is_featured == True)  # noqa: E712
            .order_by(desc(Product.sales_count))
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_popular(self, limit: int = 8) -> list[Product]:
        result = await self.db.execute(
            self._with_relations()
            .where(Product.is_published == True)  # noqa: E712
            .order_by(desc(Product.sales_count))
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_seller_products(self, seller_id: int, skip: int = 0, limit: int = 20) -> tuple[list[Product], int]:
        query = self._with_relations().where(Product.seller_id == seller_id)
        count_result = await self.db.execute(
            select(func.count()).where(Product.seller_id == seller_id)
        )
        total = count_result.scalar_one()
        result = await self.db.execute(
            query.order_by(desc(Product.created_at)).offset(skip).limit(limit)
        )
        return list(result.scalars().all()), total

    async def is_favorited(self, product_id: int, user_id: int) -> bool:
        result = await self.db.execute(
            select(Favorite).where(Favorite.product_id == product_id, Favorite.user_id == user_id)
        )
        return result.scalar_one_or_none() is not None

    async def is_purchased(self, product_id: int, user_id: int) -> bool:
        result = await self.db.execute(
            select(OrderItem)
            .join(OrderItem.order)
            .where(Order.user_id == user_id, OrderItem.product_id == product_id)
        )
        return result.scalar_one_or_none() is not None

    async def increment_views(self, product_id: int) -> None:
        product = await self.get_by_id(product_id)
        if product:
            product.views_count += 1
            await self.db.flush()

    async def update_rating(self, product_id: int) -> None:
        from app.models.review import Review
        result = await self.db.execute(
            select(func.avg(Review.rating), func.count(Review.id))
            .where(Review.product_id == product_id)
        )
        avg_rating, count = result.one()
        product = await self.get_by_id(product_id)
        if product:
            product.rating = float(avg_rating or 0)
            product.reviews_count = count or 0
            await self.db.flush()
