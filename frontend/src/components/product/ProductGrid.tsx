import { Search } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  className?: string;
  loading?: boolean;
}

export function ProductGrid({ products, className, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card overflow-hidden animate-pulse">
            <div className="aspect-video bg-card-hover" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-card-hover rounded w-1/3" />
              <div className="h-4 bg-card-hover rounded w-5/6" />
              <div className="h-3 bg-card-hover rounded w-2/3" />
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <div className="h-6 bg-card-hover rounded w-24" />
                <div className="h-8 bg-card-hover rounded-xl w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
          <Search className="w-6 h-6 text-foreground-muted" />
        </div>
        <h3 className="text-xl font-semibold font-display mb-2">Ничего не найдено</h3>
        <p className="text-foreground-muted text-sm">Попробуйте изменить фильтры или поиск</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
