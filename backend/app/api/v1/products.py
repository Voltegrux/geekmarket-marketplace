from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_seller, get_current_user, get_optional_user
from app.models.user import User
from app.services.product import ProductService
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, PaginatedProducts

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=PaginatedProducts)
async def get_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category_id: int | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    min_rating: float | None = None,
    sort_by: str = Query("created_at", pattern="^(created_at|price|rating|sales_count)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    service = ProductService(db)
    return await service.get_catalog(
        page=page,
        per_page=per_page,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        sort_by=sort_by,
        order=order,
        search=search,
        current_user_id=current_user.id if current_user else None,
    )


@router.get("/popular", response_model=list)
async def get_popular(
    limit: int = Query(8, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    from app.repositories.product import ProductRepository
    from app.schemas.product import ProductListResponse
    repo = ProductRepository(db)
    products = await repo.get_popular(limit=limit)
    result = []
    for p in products:
        is_fav = await repo.is_favorited(p.id, current_user.id) if current_user else False
        result.append(ProductListResponse.model_validate({**p.__dict__, "is_favorited": is_fav}))
    return result


@router.get("/featured", response_model=list)
async def get_featured(
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    from app.repositories.product import ProductRepository
    from app.schemas.product import ProductListResponse
    repo = ProductRepository(db)
    products = await repo.get_featured()
    result = []
    for p in products:
        is_fav = await repo.is_favorited(p.id, current_user.id) if current_user else False
        result.append(ProductListResponse.model_validate({**p.__dict__, "is_favorited": is_fav}))
    return result


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    service = ProductService(db)
    return await service.get_product(product_id, current_user.id if current_user else None)


@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate,
    current_user: User = Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.create_product(data, current_user.id)


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    data: ProductUpdate,
    current_user: User = Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.update_product(product_id, data, current_user.id)


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    await service.delete_product(product_id, current_user.id)


@router.post("/{product_id}/files", status_code=201)
async def upload_file(
    product_id: int,
    file: UploadFile = File(...),
    is_preview: bool = False,
    current_user: User = Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    pf = await service.upload_product_file(product_id, file, current_user.id, is_preview)
    return {"id": pf.id, "file_name": pf.file_name, "file_type": pf.file_type}


@router.get("/{product_id}/files/{file_id}/download")
async def download_file(
    product_id: int,
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    url = await service.get_download_url(product_id, file_id, current_user.id)
    return {"download_url": url}


@router.get("/seller/my", response_model=PaginatedProducts)
async def get_my_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_seller),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.product import ProductRepository
    from app.schemas.product import ProductListResponse
    repo = ProductRepository(db)
    skip = (page - 1) * per_page
    products, total = await repo.get_seller_products(current_user.id, skip=skip, limit=per_page)
    items = [ProductListResponse.model_validate({**p.__dict__, "is_favorited": False}) for p in products]
    pages = (total + per_page - 1) // per_page
    return PaginatedProducts(items=items, total=total, page=page, per_page=per_page, pages=pages)
