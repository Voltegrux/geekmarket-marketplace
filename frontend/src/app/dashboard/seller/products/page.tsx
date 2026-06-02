"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Edit2, Trash2, Eye, EyeOff, TrendingUp, Star } from "lucide-react";
import { productsApi } from "@/lib/api";
import { Pagination } from "@/components/ui/Pagination";
import { formatPrice } from "@/lib/utils";
import type { PaginatedResponse, Product } from "@/types";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function SellerProductsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["seller-products", page],
    queryFn: () => productsApi.myProducts({ page, per_page: 10 }).then((r) => r.data as PaginatedResponse<Product>),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_published }: { id: number; is_published: boolean }) =>
      productsApi.update(id, { is_published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Статус обновлён");
    },
    onError: () => toast.error("Ошибка"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Товар удалён");
    },
    onError: () => toast.error("Ошибка удаления"),
  });

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Удалить товар «${title}»?`)) deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мои товары</h1>
        <Link href="/dashboard/seller/products/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Добавить
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card p-5 h-20" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {(data?.items || []).map((product) => (
            <div key={product.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/product/${product.id}`}
                    className="font-semibold hover:text-primary transition-colors line-clamp-1">
                    {product.title}
                  </Link>
                  <span className={cn(
                    "badge border text-xs flex-shrink-0",
                    product.is_published
                      ? "bg-success/10 text-success border-success/30"
                      : "bg-foreground-muted/10 text-foreground-muted border-border"
                  )}>
                    {product.is_published ? "Опубликован" : "Скрыт"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-warning text-warning" /> {Number(product.rating).toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {product.sales_count} продаж
                  </span>
                  <span className="font-medium text-foreground">{formatPrice(product.price)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleMutation.mutate({ id: product.id, is_published: !product.is_published })}
                  className="p-2 rounded-xl hover:bg-card-hover transition-colors text-foreground-muted hover:text-foreground"
                  title={product.is_published ? "Скрыть" : "Опубликовать"}
                >
                  {product.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <Link
                  href={`/dashboard/seller/products/${product.id}/edit`}
                  className="p-2 rounded-xl hover:bg-card-hover transition-colors text-foreground-muted hover:text-primary"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(product.id, product.title)}
                  className="p-2 rounded-xl hover:bg-danger/10 transition-colors text-foreground-muted hover:text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {(data?.items || []).length === 0 && (
            <div className="card p-12 text-center">
              <p className="text-foreground-muted mb-4">У вас нет товаров</p>
              <Link href="/dashboard/seller/products/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Добавить первый товар
              </Link>
            </div>
          )}
        </div>
      )}

      {(data?.pages ?? 0) > 1 && (
        <Pagination page={page} pages={data!.pages} onPageChange={setPage} />
      )}
    </div>
  );
}
