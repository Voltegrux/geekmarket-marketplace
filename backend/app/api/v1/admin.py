from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.review import Review
from app.repositories.user import UserRepository
from app.repositories.product import ProductRepository
from app.repositories.review import ReviewRepository
from app.schemas.user import UserResponse, UserRoleUpdate

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
async def get_platform_stats(
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar_one()
    total_products = (await db.execute(select(func.count()).select_from(Product))).scalar_one()
    total_orders = (await db.execute(select(func.count()).select_from(Order))).scalar_one()
    total_revenue = (await db.execute(select(func.sum(Order.total_price)))).scalar_one() or 0
    total_reviews = (await db.execute(select(func.count()).select_from(Review))).scalar_one()

    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "total_reviews": total_reviews,
    }


@router.get("/users", response_model=dict)
async def get_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    skip = (page - 1) * per_page
    users = await repo.get_all(skip=skip, limit=per_page)
    total = await repo.count()
    return {
        "items": [UserResponse.model_validate(u) for u in users],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
    }


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    data: UserRoleUpdate,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = data.role
    await repo.update(user)
    return {"message": "Role updated"}


@router.patch("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: int,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    await repo.update(user)
    return {"is_active": user.is_active}


@router.get("/products", response_model=dict)
async def get_all_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload
    skip = (page - 1) * per_page
    count = (await db.execute(select(func.count()).select_from(Product))).scalar_one()
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.seller), selectinload(Product.category), selectinload(Product.tags))
        .offset(skip)
        .limit(per_page)
    )
    products = list(result.scalars().all())
    from app.schemas.product import ProductListResponse
    return {
        "items": [ProductListResponse.model_validate({**p.__dict__, "is_favorited": False}) for p in products],
        "total": count,
        "page": page,
        "per_page": per_page,
        "pages": (count + per_page - 1) // per_page,
    }


@router.patch("/products/{product_id}/toggle-featured")
async def toggle_featured(
    product_id: int,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException
    repo = ProductRepository(db)
    product = await repo.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_featured = not product.is_featured
    await repo.update(product)
    return {"is_featured": product.is_featured}


@router.delete("/reviews/{review_id}", status_code=204)
async def delete_review(
    review_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    from app.services.review import ReviewService
    service = ReviewService(db)
    await service.delete_review(review_id, admin.id, is_admin=True)
