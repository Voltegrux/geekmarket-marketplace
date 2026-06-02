"use client";
import { useQuery } from "@tanstack/react-query";
import { Users, Package, ShoppingBag, DollarSign, Star, TrendingUp } from "lucide-react";
import { adminApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats().then((r) => r.data as {
      total_users: number; total_products: number;
      total_orders: number; total_revenue: number; total_reviews: number;
    }),
  });

  const cards = [
    { label: "Пользователей", value: stats?.total_users || 0, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Товаров", value: stats?.total_products || 0, icon: Package, color: "text-violet-400", bg: "bg-violet-400/10" },
    { label: "Заказов", value: stats?.total_orders || 0, icon: ShoppingBag, color: "text-warning", bg: "bg-warning/10" },
    { label: "Выручка", value: formatPrice(stats?.total_revenue || 0), icon: DollarSign, color: "text-success", bg: "bg-success/10" },
    { label: "Отзывов", value: stats?.total_reviews || 0, icon: Star, color: "text-danger", bg: "bg-danger/10" },
    { label: "Ср. чек", value: stats?.total_orders ? formatPrice(stats.total_revenue / stats.total_orders) : "—", icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Панель администратора</h1>
        <p className="text-foreground-muted text-sm mt-1">Статистика платформы GeekMarket</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold">{isLoading ? "—" : value}</div>
            <div className="text-sm text-foreground-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Быстрые действия</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { href: "/admin/users", label: "Управление пользователями", icon: Users },
            { href: "/admin/products", label: "Управление товарами", icon: Package },
            { href: "/admin/reviews", label: "Модерация отзывов", icon: Star },
          ].map(({ href, label, icon: Icon }) => (
            <a key={href} href={href}
              className="card p-4 hover:border-primary/40 flex items-center gap-3 transition-all">
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
