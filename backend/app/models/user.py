import enum
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class UserRole(str, enum.Enum):
    BUYER = "buyer"
    SELLER = "seller"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    # Store as String for SQLite/PostgreSQL compatibility
    role: Mapped[str] = mapped_column(String(20), default="buyer", nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(100))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    bio: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    products: Mapped[list["Product"]] = relationship("Product", back_populates="seller", lazy="select")  # noqa: F821
    orders: Mapped[list["Order"]] = relationship("Order", back_populates="user", lazy="select")  # noqa: F821
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user", lazy="select")  # noqa: F821
    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="user", lazy="select")  # noqa: F821
    notifications: Mapped[list["Notification"]] = relationship("Notification", back_populates="user", lazy="select")  # noqa: F821
