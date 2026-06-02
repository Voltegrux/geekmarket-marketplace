"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ShoppingCart, Heart, Download, Star, Users, Eye, Calendar, Tag,
  Code2, Package, ChevronRight, AlertCircle, CheckCircle2, Clock
} from "lucide-react";
import { productsApi, reviewsApi, ordersApi, favoritesApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { StarRating } from "@/components/ui/StarRating";
import { formatPrice, formatDate, formatFileSize } from "@/lib/utils";
import type { Product, ReviewsResponse } from "@/types";
import toast from "react-hot-toast";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { isInCart, addItem, removeItem } = useCartStore();
  const queryClient = useQueryClient();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "files">("description");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.get(Number(id)).then((r) => r.data as Product),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => reviewsApi.getForProduct(Number(id)).then((r) => r.data as ReviewsResponse),
  });

  const inCart = product ? isInCart(product.id) : false;

  const favMutation = useMutation({
    mutationFn: () =>
      product?.is_favorited
        ? favoritesApi.remove(product!.id)
        : favoritesApi.add(product!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      toast.success(product?.is_favorited ? "Удалено из избранного" : "Добавлено в избранное");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      reviewsApi.create(Number(id), { rating: reviewRating, comment: reviewComment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      setReviewComment("");
      toast.success("Отзыв добавлен!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Ошибка");
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (fileId: number) =>
      productsApi.downloadFile(product!.id, fileId).then((r) => r.data),
    onSuccess: (data) => {
      window.open(data.download_url, "_blank");
    },
    onError: () => toast.error("Ошибка получения файла"),
  });

  const handleBuy = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (inCart) {
      router.push("/cart");
    } else {
      addItem(product as unknown as Parameters<typeof addItem>[0]);
      router.push("/cart");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-card rounded w-1/3" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 aspect-video bg-card rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-card rounded" />
              <div className="h-4 bg-card rounded w-2/3" />
              <div className="h-12 bg-card rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="p-10 text-center">Товар не найден</div>;

  const nonPreviewFiles = product.files.filter((f) => !f.is_preview);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted mb-8">
        <Link href="/" className="hover:text-foreground">Главная</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/catalog" className="hover:text-foreground">Каталог</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-foreground">
          {product.category.title}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview */}
          <div className="relative aspect-video bg-gradient-card rounded-2xl overflow-hidden border border-border">
            {product.preview_url ? (
              <Image src={product.preview_url} alt={product.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-20 h-20 text-primary/30" />
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border gap-6">
            {[
              ["description", "Описание"],
              ["reviews", `Отзывы (${product.reviews_count})`],
              ["files", `Файлы (${nonPreviewFiles.length})`],
            ].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "description" && (
            <div className="prose prose-invert max-w-none">
              <div className="text-foreground-muted leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>
              {product.technologies && (
                <div className="mt-6 p-4 bg-card rounded-xl border border-border">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-primary" /> Технологии
                  </h4>
                  <p className="text-sm text-foreground-muted">{product.technologies}</p>
                </div>
              )}
              {product.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.map((t) => (
                    <Link
                      key={t.id}
                      href={`/catalog?search=${t.tag}`}
                      className="badge bg-card border border-border hover:border-primary/40 transition-colors text-sm"
                    >
                      <Tag className="w-3 h-3" /> {t.tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Stats */}
              {reviewsData && reviewsData.stats.total_reviews > 0 && (
                <div className="card p-5 flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold gradient-text">
                      {reviewsData.stats.average_rating.toFixed(1)}
                    </div>
                    <StarRating rating={reviewsData.stats.average_rating} size="lg" />
                    <p className="text-sm text-foreground-muted mt-1">
                      {reviewsData.stats.total_reviews} отзывов
                    </p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((r) => {
                      const count = reviewsData.stats.rating_distribution[r] || 0;
                      const pct = reviewsData.stats.total_reviews > 0
                        ? (count / reviewsData.stats.total_reviews) * 100
                        : 0;
                      return (
                        <div key={r} className="flex items-center gap-2 text-sm">
                          <span className="w-4 text-foreground-muted">{r}</span>
                          <Star className="w-3 h-3 fill-warning text-warning flex-shrink-0" />
                          <div className="flex-1 bg-card-hover rounded-full h-2">
                            <div
                              className="bg-warning rounded-full h-2 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-foreground-muted w-6">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Write review */}
              {isAuthenticated && product.is_purchased && (
                <div className="card p-5 space-y-4">
                  <h4 className="font-semibold">Написать отзыв</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground-muted">Оценка:</span>
                    <StarRating
                      rating={reviewRating}
                      size="lg"
                      interactive
                      onChange={setReviewRating}
                    />
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Поделитесь впечатлениями о товаре..."
                    rows={4}
                    className="input resize-none"
                  />
                  <button
                    onClick={() => reviewMutation.mutate()}
                    disabled={reviewMutation.isPending}
                    className="btn-primary"
                  >
                    {reviewMutation.isPending ? "Отправка..." : "Отправить отзыв"}
                  </button>
                </div>
              )}

              {/* Reviews list */}
              <div className="space-y-4">
                {(reviewsData?.items || []).map((review) => (
                  <div key={review.id} className="card p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {review.user.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{review.user.username}</span>
                          <span className="text-xs text-foreground-muted">{formatDate(review.created_at)}</span>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                        {review.comment && (
                          <p className="text-sm text-foreground-muted mt-2 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {(reviewsData?.items || []).length === 0 && (
                  <p className="text-center text-foreground-muted py-8">Отзывов пока нет</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="space-y-3">
              {nonPreviewFiles.length === 0 ? (
                <p className="text-foreground-muted text-center py-8">Файлы недоступны</p>
              ) : product.is_purchased ? (
                nonPreviewFiles.map((file) => (
                  <div key={file.id} className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{file.file_name}</p>
                      <p className="text-xs text-foreground-muted">
                        {file.file_type.toUpperCase()} • {formatFileSize(file.file_size)}
                      </p>
                    </div>
                    <button
                      onClick={() => downloadMutation.mutate(file.id)}
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Скачать
                    </button>
                  </div>
                ))
              ) : (
                <div className="card p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                  <p className="font-semibold mb-2">Файлы доступны после покупки</p>
                  <p className="text-sm text-foreground-muted">
                    Приобретите товар, чтобы получить доступ к {nonPreviewFiles.length} файлам
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — Sidebar */}
        <div className="space-y-5">
          {/* Price card */}
          <div className="card p-6 sticky top-20">
            <div className="mb-4">
              <h1 className="text-2xl font-bold leading-tight mb-2">{product.title}</h1>
              <p className="text-foreground-muted text-sm">{product.short_description}</p>
            </div>

            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
              <span className="text-4xl font-extrabold gradient-text">
                {formatPrice(product.price)}
              </span>
              {product.is_purchased && (
                <span className="badge bg-success/10 text-success border border-success/30">
                  <CheckCircle2 className="w-3 h-3" /> Куплено
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { icon: Star, value: `${product.rating.toFixed(1)}★`, label: "Рейтинг" },
                { icon: Users, value: product.sales_count, label: "Продаж" },
                { icon: Eye, value: product.views_count, label: "Просмотров" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-card-hover rounded-xl p-3 text-center">
                  <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <div className="font-bold text-sm">{value}</div>
                  <div className="text-xs text-foreground-muted">{label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            {product.is_purchased ? (
              <button
                onClick={() => setActiveTab("files")}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
              >
                <Download className="w-5 h-5" /> Скачать файлы
              </button>
            ) : (
              <button
                onClick={handleBuy}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-3 shadow-glow"
              >
                <ShoppingCart className="w-5 h-5" />
                {inCart ? "Перейти в корзину" : "Купить"}
              </button>
            )}

            <button
              onClick={() => favMutation.mutate()}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border transition-all ${
                product.is_favorited
                  ? "border-danger/50 bg-danger/10 text-danger"
                  : "border-border hover:border-danger/40 hover:text-danger"
              }`}
            >
              <Heart className={`w-4 h-4 ${product.is_favorited ? "fill-current" : ""}`} />
              {product.is_favorited ? "В избранном" : "В избранное"}
            </button>

            {/* Meta */}
            <div className="space-y-2 mt-5 pt-5 border-t border-border text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-foreground-muted" />
                <span className="text-foreground-muted">Продавец:</span>
                <Link href={`/users/${product.seller.username}`} className="text-primary hover:underline">
                  {product.seller.username}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-foreground-muted" />
                <span className="text-foreground-muted">Обновлено:</span>
                <span>{formatDate(product.updated_at)}</span>
              </div>
              {product.version && (
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-foreground-muted" />
                  <span className="text-foreground-muted">Версия:</span>
                  <span>{product.version}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
