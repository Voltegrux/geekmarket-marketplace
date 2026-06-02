"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, reviewsApi } from "@/lib/api";
import { productsApi } from "@/lib/api";
import { Trash2, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

// Admin reviews: get reviews for all products (simplified via product list)
export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data: productsData } = useQuery({
    queryKey: ["admin-products-for-reviews"],
    queryFn: () => adminApi.products({ page: 1, per_page: 50 }).then((r) => r.data),
  });

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["admin-reviews", selectedProductId, page],
    queryFn: () =>
      selectedProductId
        ? reviewsApi.getForProduct(selectedProductId, { page, per_page: 20 }).then((r) => r.data)
        : null,
    enabled: !!selectedProductId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Отзыв удалён");
    },
    onError: () => toast.error("Ошибка"),
  });

  const products = productsData?.items || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Модерация отзывов</h1>

      <div className="card p-4">
        <label className="text-sm font-medium mb-2 block">Выберите товар для просмотра отзывов:</label>
        <select
          className="input"
          value={selectedProductId || ""}
          onChange={(e) => { setSelectedProductId(Number(e.target.value) || null); setPage(1); }}
        >
          <option value="">-- Выберите товар --</option>
          {products.map((p: any) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {selectedProductId && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-5 h-24" />)}
            </div>
          ) : (reviewsData?.items || []).length === 0 ? (
            <div className="card p-8 text-center text-foreground-muted">Отзывов нет</div>
          ) : (
            (reviewsData?.items || []).map((review: any) => (
              <div key={review.id} className="card p-4 flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{review.user?.username}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-warning text-warning" : "text-foreground-muted"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-foreground-muted">{formatDate(review.created_at)}</span>
                  </div>
                  {review.comment && <p className="text-sm text-foreground-muted">{review.comment}</p>}
                </div>
                <button
                  onClick={() => deleteMutation.mutate(review.id)}
                  className="p-2 rounded-xl hover:bg-danger/10 text-foreground-muted hover:text-danger transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
