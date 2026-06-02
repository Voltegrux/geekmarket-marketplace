from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_seller
from app.models.user import User
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository

router = APIRouter(prefix="/seller", tags=["seller"])


@router.get("/stats")
async def get_seller_stats(
    current_user: User = Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    order_repo = OrderRepository(db)
    product_repo = ProductRepository(db)

    revenue = await order_repo.get_seller_revenue(current_user.id)
    sales_stats = await order_repo.get_seller_sales_stats(current_user.id)
    _, total_products = await product_repo.get_seller_products(current_user.id, limit=1)

    from sqlalchemy import select, func
    from app.models.order import OrderItem, Order
    from app.models.product import Product

    total_sales_result = await db.execute(
        select(func.count(OrderItem.id))
        .join(OrderItem.product)
        .where(Product.seller_id == current_user.id)
    )
    total_sales = total_sales_result.scalar_one()

    return {
        "total_revenue": revenue,
        "total_sales": total_sales,
        "total_products": total_products,
        "sales_by_day": sales_stats,
    }


@router.get("/top-products")
async def get_top_products(
    current_user: User = Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select, func, desc
    from app.models.order import OrderItem
    from app.models.product import Product

    result = await db.execute(
        select(Product, func.count(OrderItem.id).label("sales"))
        .outerjoin(OrderItem, OrderItem.product_id == Product.id)
        .where(Product.seller_id == current_user.id)
        .group_by(Product.id)
        .order_by(desc("sales"))
        .limit(10)
    )
    rows = result.all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "price": float(p.price),
            "sales": sales,
            "rating": float(p.rating),
        }
        for p, sales in rows
    ]
