from datetime import datetime
from sqlalchemy import String, Text, Numeric, Integer, ForeignKey, Boolean, DateTime, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class ProductTag(Base):
    __tablename__ = "product_tags"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    tag: Mapped[str] = mapped_column(String(50), nullable=False)

    product: Mapped["Product"] = relationship("Product", back_populates="tags")


class ProductFile(Base):
    __tablename__ = "product_files"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(20), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, default=0)
    is_preview: Mapped[bool] = mapped_column(Boolean, default=False)

    product: Mapped["Product"] = relationship("Product", back_populates="files")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    short_description: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    preview_url: Mapped[str | None] = mapped_column(String(500))

    rating: Mapped[float] = mapped_column(Numeric(3, 2), default=0.0)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0)
    sales_count: Mapped[int] = mapped_column(Integer, default=0)
    views_count: Mapped[int] = mapped_column(Integer, default=0)

    technologies: Mapped[str | None] = mapped_column(String(500))
    version: Mapped[str | None] = mapped_column(String(50))

    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)

    # Plain text column for search (SQLite-compatible; PostgreSQL uses TSVECTOR via trigger)
    search_vector: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    seller: Mapped["User"] = relationship("User", back_populates="products")  # noqa: F821
    category: Mapped["Category"] = relationship("Category", back_populates="products")  # noqa: F821
    files: Mapped[list["ProductFile"]] = relationship("ProductFile", back_populates="product", cascade="all, delete-orphan")
    tags: Mapped[list["ProductTag"]] = relationship("ProductTag", back_populates="product", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="product", lazy="select")  # noqa: F821
    order_items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="product")  # noqa: F821
    favorited_by: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="product")  # noqa: F821

    __table_args__ = (
        Index("ix_products_seller_published", "seller_id", "is_published"),
    )
