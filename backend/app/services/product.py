import uuid
from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.storage import upload_file, get_presigned_url, delete_file
from app.models.product import Product, ProductFile, ProductTag
from app.models.user import UserRole
from app.repositories.product import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse, PaginatedProducts
from sqlalchemy import text

ALLOWED_FILE_TYPES = {"zip", "pdf", "docx", "pptx", "fig", "png", "jpg", "jpeg", "svg"}
IMAGE_TYPES = {"png", "jpg", "jpeg", "svg", "webp"}


class ProductService:
    def __init__(self, db: AsyncSession):
        self.repo = ProductRepository(db)
        self.db = db

    async def get_catalog(
        self,
        page: int = 1,
        per_page: int = 20,
        category_id: int | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        min_rating: float | None = None,
        sort_by: str = "created_at",
        order: str = "desc",
        search: str | None = None,
        current_user_id: int | None = None,
    ) -> PaginatedProducts:
        skip = (page - 1) * per_page
        products, total = await self.repo.get_published(
            skip=skip,
            limit=per_page,
            category_id=category_id,
            min_price=min_price,
            max_price=max_price,
            min_rating=min_rating,
            sort_by=sort_by,
            order=order,
            search=search,
        )

        items = []
        for p in products:
            is_fav = await self.repo.is_favorited(p.id, current_user_id) if current_user_id else False
            items.append(ProductListResponse.model_validate({**p.__dict__, "is_favorited": is_fav}))

        pages = (total + per_page - 1) // per_page
        return PaginatedProducts(items=items, total=total, page=page, per_page=per_page, pages=pages)

    async def get_product(self, product_id: int, current_user_id: int | None = None) -> ProductResponse:
        product = await self.repo.get_with_relations(product_id)
        if not product or not product.is_published:
            raise HTTPException(status_code=404, detail="Product not found")

        is_fav = await self.repo.is_favorited(product_id, current_user_id) if current_user_id else False
        is_purchased = await self.repo.is_purchased(product_id, current_user_id) if current_user_id else False

        # Build the response BEFORE incrementing views: increment_views() flushes,
        # which expires onupdate columns (updated_at) and drops them from __dict__.
        response = ProductResponse.model_validate({
            **product.__dict__,
            "is_favorited": is_fav,
            "is_purchased": is_purchased,
        })

        await self.repo.increment_views(product_id)

        return response

    async def create_product(self, data: ProductCreate, seller_id: int) -> ProductResponse:
        product = Product(
            seller_id=seller_id,
            title=data.title,
            short_description=data.short_description,
            description=data.description,
            price=data.price,
            category_id=data.category_id,
            technologies=data.technologies,
            version=data.version,
            is_published=data.is_published,
        )
        product = await self.repo.create(product)

        for tag_text in data.tags:
            tag = ProductTag(product_id=product.id, tag=tag_text.strip())
            self.db.add(tag)

        await self._update_search_vector(product.id)
        await self.db.flush()

        return await self.get_product(product.id, seller_id)

    async def update_product(self, product_id: int, data: ProductUpdate, seller_id: int) -> ProductResponse:
        product = await self.repo.get_with_relations(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if product.seller_id != seller_id:
            raise HTTPException(status_code=403, detail="Not your product")

        update_data = data.model_dump(exclude_unset=True, exclude={"tags"})
        for key, value in update_data.items():
            setattr(product, key, value)

        if data.tags is not None:
            for tag in product.tags:
                await self.db.delete(tag)
            for tag_text in data.tags:
                tag = ProductTag(product_id=product.id, tag=tag_text.strip())
                self.db.add(tag)

        await self._update_search_vector(product.id)
        product = await self.repo.update(product)
        return await self.get_product(product.id, seller_id)

    async def delete_product(self, product_id: int, seller_id: int, is_admin: bool = False) -> None:
        product = await self.repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if not is_admin and product.seller_id != seller_id:
            raise HTTPException(status_code=403, detail="Not your product")
        await self.repo.delete(product)

    async def upload_product_file(
        self, product_id: int, file: UploadFile, seller_id: int, is_preview: bool = False
    ) -> ProductFile:
        product = await self.repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if product.seller_id != seller_id:
            raise HTTPException(status_code=403, detail="Not your product")

        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if ext not in ALLOWED_FILE_TYPES:
            raise HTTPException(status_code=400, detail=f"File type .{ext} not allowed")

        file_data = await file.read()
        if len(file_data) > 100 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 100MB)")

        prefix = "public/previews" if is_preview else f"products/{product_id}"
        object_name = f"{prefix}/{uuid.uuid4()}.{ext}"
        content_type = file.content_type or "application/octet-stream"

        await upload_file(file_data, object_name, content_type)

        product_file = ProductFile(
            product_id=product_id,
            file_url=object_name,
            file_name=file.filename,
            file_type=ext,
            file_size=len(file_data),
            is_preview=is_preview,
        )
        self.db.add(product_file)
        await self.db.flush()
        await self.db.refresh(product_file)

        if is_preview:
            product.preview_url = get_presigned_url(object_name, expires_hours=24 * 365)
            await self.repo.update(product)

        return product_file

    async def get_download_url(self, product_id: int, file_id: int, user_id: int) -> str:
        purchased = await self.repo.is_purchased(product_id, user_id)
        product = await self.repo.get_by_id(product_id)
        is_owner = product and product.seller_id == user_id
        if not purchased and not is_owner:
            raise HTTPException(status_code=403, detail="Purchase the product first")

        from sqlalchemy import select
        from app.models.product import ProductFile
        result = await self.db.execute(
            select(ProductFile).where(ProductFile.id == file_id, ProductFile.product_id == product_id)
        )
        pf = result.scalar_one_or_none()
        if not pf:
            raise HTTPException(status_code=404, detail="File not found")

        return get_presigned_url(pf.file_url, expires_hours=1)

    async def _update_search_vector(self, product_id: int) -> None:
        # Store plain-text search vector (works with SQLite and PostgreSQL LIKE search)
        product = await self.repo.get_by_id(product_id)
        if product:
            product.search_vector = f"{product.title} {product.short_description} {product.description}"
            await self.db.flush()
