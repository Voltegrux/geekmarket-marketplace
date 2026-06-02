from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order, OrderItem, OrderStatus
from app.models.notification import Notification
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.schemas.order import OrderCreate, OrderResponse


class OrderService:
    def __init__(self, db: AsyncSession):
        self.order_repo = OrderRepository(db)
        self.product_repo = ProductRepository(db)
        self.db = db

    async def create_order(self, data: OrderCreate, user_id: int) -> OrderResponse:
        if not data.product_ids:
            raise HTTPException(status_code=400, detail="No products in order")

        products = []
        for product_id in set(data.product_ids):
            product = await self.product_repo.get_by_id(product_id)
            if not product or not product.is_published:
                raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
            already_purchased = await self.order_repo.user_purchased_product(user_id, product_id)
            if already_purchased:
                raise HTTPException(status_code=400, detail=f"Product {product_id} already purchased")
            products.append(product)

        total = sum(float(p.price) for p in products)

        order = Order(user_id=user_id, total_price=total, status=OrderStatus.COMPLETED)
        order = await self.order_repo.create(order)

        for product in products:
            item = OrderItem(order_id=order.id, product_id=product.id, price=float(product.price))
            self.db.add(item)
            product.sales_count += 1

        notification = Notification(
            user_id=user_id,
            title="Покупка совершена",
            message=f"Заказ #{order.id} на сумму {total:.2f} ₽ успешно оформлен",
            type="purchase",
        )
        self.db.add(notification)

        await self.db.flush()
        order_with_items = await self.order_repo.get_with_items(order.id)
        return OrderResponse.model_validate(order_with_items)

    async def get_user_orders(self, user_id: int, page: int = 1, per_page: int = 20) -> dict:
        skip = (page - 1) * per_page
        orders, total = await self.order_repo.get_user_orders(user_id, skip=skip, limit=per_page)
        return {
            "items": [OrderResponse.model_validate(o) for o in orders],
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
        }

    async def get_order(self, order_id: int, user_id: int) -> OrderResponse:
        order = await self.order_repo.get_with_items(order_id)
        if not order or order.user_id != user_id:
            raise HTTPException(status_code=404, detail="Order not found")
        return OrderResponse.model_validate(order)
