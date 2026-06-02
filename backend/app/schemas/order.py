from datetime import datetime
from pydantic import BaseModel
from app.models.order import OrderStatus
from app.schemas.product import ProductListResponse


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    price: float
    product: ProductListResponse

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    product_ids: list[int]


class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_price: float
    status: OrderStatus
    created_at: datetime
    items: list[OrderItemResponse] = []

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    id: int
    total_price: float
    status: OrderStatus
    created_at: datetime
    items_count: int

    class Config:
        from_attributes = True
