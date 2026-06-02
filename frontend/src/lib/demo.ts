// Demo mode: serve a static snapshot of seeded data so the site fully works
// when deployed without a backend (e.g. on Vercel as a portfolio showcase).
// Enabled via NEXT_PUBLIC_DEMO_MODE=true.
import demoData from "./demo/data.json";
import type { Product, Category, PaginatedResponse, ReviewsResponse } from "@/types";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const categories = demoData.categories as unknown as Category[];
const products = demoData.products as unknown as Product[];
const details = demoData.details as unknown as Record<string, Product>;
const reviews = demoData.reviews as unknown as Record<string, ReviewsResponse>;

// Axios-like response wrapper
type Resp<T> = { data: T };
const ok = <T>(data: T): Promise<Resp<T>> => Promise.resolve({ data });
const fail = (status: number, detail: string) =>
  Promise.reject({ response: { status, data: { detail } } });

function applyFilters(params: Record<string, unknown> = {}): PaginatedResponse<Product> {
  let list = [...products];

  const search = (params.search as string)?.toLowerCase().trim();
  if (search) {
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.short_description?.toLowerCase().includes(search) ||
        p.tags.some((t) => t.tag.toLowerCase().includes(search))
    );
  }

  const categoryId = params.category_id != null ? Number(params.category_id) : undefined;
  if (categoryId) list = list.filter((p) => p.category.id === categoryId);

  const minPrice = params.min_price != null && params.min_price !== "" ? Number(params.min_price) : undefined;
  const maxPrice = params.max_price != null && params.max_price !== "" ? Number(params.max_price) : undefined;
  if (minPrice != null) list = list.filter((p) => p.price >= minPrice);
  if (maxPrice != null) list = list.filter((p) => p.price <= maxPrice);

  const minRating = params.min_rating != null && params.min_rating !== "" ? Number(params.min_rating) : undefined;
  if (minRating != null) list = list.filter((p) => p.rating >= minRating);

  const sortBy = (params.sort_by as string) || "created_at";
  const order = (params.order as string) || "desc";
  const dir = order === "asc" ? 1 : -1;
  list.sort((a, b) => {
    let av: number, bv: number;
    switch (sortBy) {
      case "price": av = a.price; bv = b.price; break;
      case "rating": av = a.rating; bv = b.rating; break;
      case "sales_count": av = a.sales_count; bv = b.sales_count; break;
      default: av = new Date(a.created_at).getTime(); bv = new Date(b.created_at).getTime();
    }
    return (av - bv) * dir;
  });

  const page = Number(params.page) || 1;
  const perPage = Number(params.per_page) || 20;
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const items = list.slice((page - 1) * perPage, page * perPage);
  return { items, total, page, per_page: perPage, pages };
}

export const demoApi = {
  products: {
    list: (params?: Record<string, unknown>) => ok(applyFilters(params)),
    get: (id: number) =>
      details[id] ? ok(details[id]) : fail(404, "Товар не найден"),
    popular: (limit = 8) =>
      ok([...products].sort((a, b) => b.sales_count - a.sales_count).slice(0, limit)),
    featured: () => ok(products.filter((p) => p.is_featured)),
  },
  categories: {
    list: () => ok(categories),
    get: (slug: string) => {
      const c = categories.find((x) => x.slug === slug);
      return c ? ok(c) : fail(404, "Категория не найдена");
    },
  },
  reviews: {
    getForProduct: (id: number) =>
      ok(reviews[id] ?? { items: [], total: 0, page: 1, per_page: 20, stats: { average_rating: 0, total_reviews: 0, rating_distribution: {} } }),
  },
  auth: {
    blocked: () =>
      fail(403, "Демо-режим: вход и регистрация отключены. Это витрина без серверной части."),
  },
};
