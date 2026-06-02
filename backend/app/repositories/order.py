from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order, OrderItem
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    def __init__(self, db: AsyncSession):
        super().__init__(Order, db)

    def _with_relations(self):
        return select(Order).options(
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(
                __import__("app.models.product", fromlist=["Product"]).Product.seller
            ),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(
                __import__("app.models.product", fromlist=["Product"]).Product.category
            ),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(
                __import__("app.models.product", fromlist=["Product"]).Product.tags
            ),
        )

    async def get_user_orders(self, user_id: int, skip: int = 0, limit: int = 20) -> tuple[list[Order], int]:
        count = await self.db.execute(
            select(func.count()).where(Order.user_id == user_id)
        )
        total = count.scalar_one()
        result = await self.db.execute(
            self._with_relations()
            .where(Order.user_id == user_id)
            .order_by(desc(Order.created_at))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all()), total

    async def get_with_items(self, order_id: int) -> Order | None:
        result = await self.db.execute(
            self._with_relations().where(Order.id == order_id)
        )
        return result.scalar_one_or_none()

    async def user_purchased_product(self, user_id: int, product_id: int) -> bool:
        result = await self.db.execute(
            select(OrderItem)
            .join(OrderItem.order)
            .where(Order.user_id == user_id, OrderItem.product_id == product_id)
        )
        return result.scalar_one_or_none() is not None

    async def get_seller_revenue(self, seller_id: int) -> float:
        result = await self.db.execute(
            select(func.sum(OrderItem.price))
            .join(OrderItem.product)
            .where(
                __import__("app.models.product", fromlist=["Product"]).Product.seller_id == seller_id
            )
        )
        return float(result.scalar_one() or 0)

    async def get_seller_sales_stats(self, seller_id: int) -> list[dict]:
        from sqlalchemy import text
        result = await self.db.execute(
            text("""
                SELECT DATE(o.created_at) as date, COUNT(oi.id) as sales, SUM(oi.price) as revenue
                FROM orders o
                JOIN order_items oi ON oi.order_id = o.id
                JOIN products p ON p.id = oi.product_id
                WHERE p.seller_id = :seller_id
                GROUP BY DATE(o.created_at)
                ORDER BY date DESC
                LIMIT 30
            """),
            {"seller_id": seller_id},
        )
        return [{"date": str(r.date), "sales": r.sales, "revenue": float(r.revenue)} for r in result]
