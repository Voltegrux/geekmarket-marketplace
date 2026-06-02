"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { Pagination } from "@/components/ui/Pagination";
import { formatPrice } from "@/lib/utils";
import { Star, TrendingUp, Zap, ZapOff } from "lucide-react";
import type { PaginatedResponse, Product } from "@/types";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page],
    queryFn: () => adminApi.products({ page, per_page: 20 }).then((r) => r.data as PaginatedResponse<Product>),
  });

  const featuredMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Статус изменён");
    },
  });

  const products: Product[] = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Товары</h1>
        <span className="text-foreground-muted text-sm">{data?.total ?? 0} товаров</span>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Товар</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Продавец</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Цена</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Продажи</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Рейтинг</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Топ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="p-4"><div className="h-6 bg-card-hover rounded animate-pulse" /></td></tr>
                ))
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-card-hover/50 transition-colors">
                  <td className="p-4">
                    <Link href={`/product/${p.id}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-1 max-w-xs block">
                      {p.title}
                    </Link>
                    <span className="text-xs text-foreground-muted">{p.category?.title}</span>
                  </td>
                  <td className="p-4 text-sm text-foreground-muted">{p.seller?.username}</td>
                  <td className="p-4 text-sm font-medium">{formatPrice(p.price)}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3.5 h-3.5 text-success" /> {p.sales_count}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5 fill-warning text-warning" /> {Number(p.rating).toFixed(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => featuredMutation.mutate(p.id)}
                      className={cn(
                        "p-2 rounded-xl transition-colors",
                        p.is_featured
                          ? "bg-warning/10 text-warning"
                          : "hover:bg-warning/10 text-foreground-muted hover:text-warning"
                      )}
                      title={p.is_featured ? "Убрать из топа" : "Добавить в топ"}
                    >
                      {p.is_featured ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(data?.pages ?? 0) > 1 && (
        <Pagination page={page} pages={data!.pages} onPageChange={setPage} />
      )}
    </div>
  );
}
