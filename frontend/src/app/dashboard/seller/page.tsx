"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { TrendingUp, DollarSign, ShoppingBag, Package, Plus, ArrowRight } from "lucide-react";
import { sellerApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import type { SellerStats } from "@/types";

export default function SellerDashboardPage() {
  const { data: stats, isLoading } = useQuery<SellerStats>({
    queryKey: ["seller-stats"],
    queryFn: () => sellerApi.stats().then((r) => r.data),
  });

  const { data: topProducts } = useQuery({
    queryKey: ["seller-top-products"],
    queryFn: () => sellerApi.topProducts().then((r) => r.data as any[]),
  });

  const summaryCards = [
    { label: "Выручка", value: formatPrice(stats?.total_revenue || 0), icon: DollarSign, color: "text-success", bg: "bg-success/10" },
    { label: "Продаж", value: stats?.total_sales || 0, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "Товаров", value: stats?.total_products || 0, icon: Package, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Кабинет продавца</h1>
        <Link href="/dashboard/seller/products/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Добавить товар
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold">{isLoading ? "—" : value}</div>
            <div className="text-sm text-foreground-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Доход по дням</h3>
          {stats?.sales_by_day && stats.sales_by_day.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[...stats.sales_by_day].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  formatter={(v: number) => [formatPrice(v), "Доход"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-foreground-muted">
              Нет данных
            </div>
          )}
        </div>

        {/* Sales chart */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Продажи по дням</h3>
          {stats?.sales_by_day && stats.sales_by_day.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[...stats.sales_by_day].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                />
                <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-foreground-muted">
              Нет данных
            </div>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Топ товаров</h3>
          <Link href="/dashboard/seller/products" className="text-sm text-primary hover:underline flex items-center gap-1">
            Все товары <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {(topProducts || []).slice(0, 5).map((p, i) => (
            <div key={p.id} className="flex items-center gap-4 p-3 bg-card-hover rounded-xl">
              <span className="text-foreground-muted text-sm font-mono w-5 text-center">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${p.id}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-1">
                  {p.title}
                </Link>
                <p className="text-xs text-foreground-muted">{p.sales} продаж · ★ {p.rating.toFixed(1)}</p>
              </div>
              <span className="font-bold text-sm gradient-text flex-shrink-0">{formatPrice(p.price)}</span>
            </div>
          ))}
          {(topProducts || []).length === 0 && (
            <p className="text-center text-foreground-muted py-6">Нет товаров</p>
          )}
        </div>
      </div>
    </div>
  );
}
