"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, SortAsc, Grid, List, Search } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import { productsApi, categoriesApi } from "@/lib/api";
import type { PaginatedResponse, Product, Category } from "@/types";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "created_at_desc", label: "Новые" },
  { value: "sales_count_desc", label: "Популярные" },
  { value: "price_asc", label: "Цена: по возрастанию" },
  { value: "price_desc", label: "Цена: по убыванию" },
  { value: "rating_desc", label: "По рейтингу" },
];

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categorySlug, setCategorySlug] = useState(searchParams.get("category") || "");
  const [sortValue, setSortValue] = useState("created_at_desc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [sort_by, order] = sortValue.split("_").slice(0, -1).join("_").includes("_")
    ? [sortValue.split("_").slice(0, -1).join("_"), sortValue.split("_").at(-1)]
    : [sortValue.split("_")[0], sortValue.split("_")[1]];

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list().then((r) => r.data as Category[]),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, search, categorySlug, sortValue, minPrice, maxPrice, minRating],
    queryFn: async () => {
      const selectedCategory = categories?.find((c) => c.slug === categorySlug);
      return productsApi.list({
        page,
        per_page: 20,
        search: search || undefined,
        category_id: selectedCategory?.id,
        sort_by: sort_by || "created_at",
        order: order || "desc",
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        min_rating: minRating || undefined,
      }).then((r) => r.data as PaginatedResponse<Product>);
    },
    enabled: true,
  });

  useEffect(() => { setPage(1); }, [search, categorySlug, sortValue, minPrice, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">Каталог товаров</h1>
        <p className="text-foreground-muted">
          {data?.total ?? "..."} товаров
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <aside className={cn("lg:w-64 flex-shrink-0", !showFilters && "hidden lg:block")}>
          <div className="card p-5 sticky top-20 space-y-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" /> Фильтры
            </h3>

            {/* Search */}
            <div>
              <label className="text-sm text-foreground-muted mb-2 block">Поиск</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Название, теги..."
                  className="input pl-9 text-sm"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm text-foreground-muted mb-2 block">Категория</label>
              <div className="space-y-1">
                <button
                  onClick={() => setCategorySlug("")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors",
                    !categorySlug ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-card-hover"
                  )}
                >
                  Все категории
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategorySlug(cat.slug)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors",
                      categorySlug === cat.slug ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-card-hover"
                    )}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="text-sm text-foreground-muted mb-2 block">Цена (₽)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="От"
                  className="input text-sm w-1/2"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="До"
                  className="input text-sm w-1/2"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm text-foreground-muted mb-2 block">Минимальный рейтинг</label>
              <div className="space-y-1">
                {["", "3", "4", "4.5"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors",
                      minRating === r ? "bg-primary/10 text-primary" : "hover:bg-card-hover"
                    )}
                  >
                    {r === "" ? "Любой" : `${r}★ и выше`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setSearch(""); setCategorySlug(""); setMinPrice(""); setMaxPrice(""); setMinRating(""); }}
              className="btn-secondary w-full text-sm"
            >
              Сбросить фильтры
            </button>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary text-sm flex items-center gap-2 lg:hidden"
            >
              <Filter className="w-4 h-4" /> Фильтры
            </button>

            <div className="ml-auto flex items-center gap-3">
              <select
                value={sortValue}
                onChange={(e) => setSortValue(e.target.value)}
                className="input text-sm py-2 w-auto cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <ProductGrid products={data?.items || []} loading={isLoading} />

          {(data?.pages ?? 0) > 1 && (
            <div className="mt-10">
              <Pagination page={page} pages={data!.pages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
