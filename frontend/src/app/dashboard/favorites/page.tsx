"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Heart } from "lucide-react";
import { favoritesApi } from "@/lib/api";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import type { PaginatedResponse, Product } from "@/types";

export default function FavoritesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["favorites", page],
    queryFn: () => favoritesApi.list({ page, per_page: 16 }).then((r) => r.data as PaginatedResponse<Product>),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="w-6 h-6 text-danger" /> Избранное
        </h1>
        <span className="text-foreground-muted text-sm">{data?.total ?? 0} товаров</span>
      </div>

      {!isLoading && (data?.items || []).length === 0 ? (
        <div className="card p-12 text-center">
          <Heart className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Избранное пусто</h3>
          <p className="text-foreground-muted mb-6">
            Добавляйте товары в избранное, нажимая на ❤️
          </p>
          <Link href="/catalog" className="btn-primary">Перейти в каталог</Link>
        </div>
      ) : (
        <>
          <ProductGrid products={data?.items || []} loading={isLoading} />
          {(data?.pages ?? 0) > 1 && (
            <Pagination page={page} pages={data!.pages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
