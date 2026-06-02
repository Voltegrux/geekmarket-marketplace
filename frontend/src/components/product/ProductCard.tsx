"use client";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, Heart, Package, TrendingUp } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { favoritesApi } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { isInCart, addItem, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(product.is_favorited);
  const inCart = isInCart(product.id);

  const favMutation = useMutation({
    mutationFn: () =>
      isFavorited ? favoritesApi.remove(product.id) : favoritesApi.add(product.id),
    onSuccess: () => {
      setIsFavorited(!isFavorited);
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: () => toast.error("Ошибка"),
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Войдите в аккаунт");
      return;
    }
    favMutation.mutate();
  };

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) {
      removeItem(product.id);
      toast("Удалено из корзины");
    } else {
      addItem(product as unknown as Parameters<typeof addItem>[0]);
      toast.success("Добавлено в корзину");
    }
  };

  return (
    <Link href={`/product/${product.id}`} className={cn("group block cursor-pointer", className)}>
      <article className="card overflow-hidden h-full flex flex-col">

        {/* Preview image */}
        <div className="relative aspect-video bg-surface overflow-hidden">
          {product.preview_url ? (
            <Image
              src={product.preview_url}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/8 to-accent/5">
              <Package className="w-10 h-10 text-primary/25" />
            </div>
          )}

          {/* Featured badge */}
          {product.is_featured && (
            <span className="absolute top-2.5 left-2.5 badge bg-primary/90 text-background font-mono font-bold">
              top
            </span>
          )}

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            aria-label={isFavorited ? "Убрать из избранного" : "В избранное"}
            className={cn(
              "absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-sm",
              isFavorited
                ? "bg-danger/90 text-white"
                : "bg-background/60 text-foreground-muted hover:bg-danger/80 hover:text-white opacity-0 group-hover:opacity-100"
            )}
          >
            <Heart className={cn("w-3.5 h-3.5", isFavorited && "fill-current")} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 gap-3">

          {/* Category + tags */}
          <div className="flex flex-wrap gap-1.5">
            <span className="tag text-primary border-primary/20 bg-primary/5">
              {product.category.title}
            </span>
            {product.tags.slice(0, 2).map((t) => (
              <span key={t.id} className="tag">
                {t.tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200 text-[15px]">
            {product.title}
          </h3>

          {/* Meta: rating + sales */}
          <div className="flex items-center gap-3 text-xs text-foreground-muted">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-warning text-warning" />
              <span className="text-foreground font-medium">{product.rating.toFixed(1)}</span>
              <span>({product.reviews_count})</span>
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {product.sales_count}
            </span>
          </div>

          {/* Seller */}
          <p className="text-xs text-foreground-muted font-mono">
            @{product.seller.username}
          </p>

          {/* Price + cart */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/60">
            <span className="text-xl font-display font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <button
              onClick={handleCart}
              aria-label={inCart ? "В корзине" : "Добавить в корзину"}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 cursor-pointer",
                inCart
                  ? "bg-primary/10 text-primary border border-primary/25"
                  : "bg-surface text-foreground-muted border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/25"
              )}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {inCart ? "В корзине" : "Купить"}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
