from datetime import datetime
from pydantic import BaseModel, field_validator
from app.schemas.user import UserPublicResponse


class CategoryResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: str | None = None
    icon: str | None = None
    color: str | None = None

    class Config:
        from_attributes = True


class ProductFileResponse(BaseModel):
    id: int
    file_name: str
    file_type: str
    file_size: int
    is_preview: bool

    class Config:
        from_attributes = True


class ProductTagResponse(BaseModel):
    id: int
    tag: str

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    title: str
    short_description: str
    description: str
    price: float
    category_id: int
    technologies: str | None = None
    version: str | None = None

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Price must be non-negative")
        return v


class ProductCreate(ProductBase):
    tags: list[str] = []
    is_published: bool = True


class ProductUpdate(BaseModel):
    title: str | None = None
    short_description: str | None = None
    description: str | None = None
    price: float | None = None
    category_id: int | None = None
    technologies: str | None = None
    version: str | None = None
    tags: list[str] | None = None
    is_published: bool | None = None


class ProductResponse(BaseModel):
    id: int
    title: str
    short_description: str
    description: str
    price: float
    preview_url: str | None = None
    rating: float
    reviews_count: int
    sales_count: int
    views_count: int
    technologies: str | None = None
    version: str | None = None
    is_published: bool
    is_featured: bool
    created_at: datetime
    updated_at: datetime
    seller: UserPublicResponse
    category: CategoryResponse
    tags: list[ProductTagResponse] = []
    files: list[ProductFileResponse] = []
    is_favorited: bool = False
    is_purchased: bool = False

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    id: int
    title: str
    short_description: str
    price: float
    preview_url: str | None = None
    rating: float
    reviews_count: int
    sales_count: int
    is_featured: bool
    created_at: datetime
    seller: UserPublicResponse
    category: CategoryResponse
    tags: list[ProductTagResponse] = []
    is_favorited: bool = False

    class Config:
        from_attributes = True


class PaginatedProducts(BaseModel):
    items: list[ProductListResponse]
    total: int
    page: int
    per_page: int
    pages: int
