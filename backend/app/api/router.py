from fastapi import APIRouter
from app.api.v1 import auth, users, products, categories, orders, reviews, favorites, notifications, seller, admin

api_router = APIRouter(prefix="/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(products.router)
api_router.include_router(categories.router)
api_router.include_router(orders.router)
api_router.include_router(reviews.router)
api_router.include_router(favorites.router)
api_router.include_router(notifications.router)
api_router.include_router(seller.router)
api_router.include_router(admin.router)
