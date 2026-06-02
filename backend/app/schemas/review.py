from datetime import datetime
from pydantic import BaseModel, field_validator
from app.schemas.user import UserPublicResponse


class ReviewCreate(BaseModel):
    rating: int
    comment: str | None = None

    @field_validator("rating")
    @classmethod
    def rating_must_be_valid(cls, v: int) -> int:
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewUpdate(BaseModel):
    rating: int | None = None
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: int
    rating: int
    comment: str | None = None
    created_at: datetime
    user: UserPublicResponse

    class Config:
        from_attributes = True


class ReviewsStats(BaseModel):
    average_rating: float
    total_reviews: int
    rating_distribution: dict[int, int]
