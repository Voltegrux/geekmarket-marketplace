"use client";
import { useQuery } from "@tanstack/react-query";
import { sellerApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { DollarSign, TrendingUp, Package, BarChart3 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import type { SellerStats } from "@/types";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b"];

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery<SellerStats>({
    queryKey: ["seller-stats"],
    queryFn: () => sellerApi.stats().then((r) => r.data),
  });

  const { data: topProducts } = useQuery({
    queryKey: ["seller-top-products"],
    queryFn: () => sellerApi.topProducts().then((r) => r.data as any[]),
  });

  const chartData = stats?.sales_by_day ? [...stats.sales_by_day].reverse() : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" /> Аналитика
      </h1>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Выручка за всё время", value: formatPrice(stats?.total_revenue || 0), icon: DollarSign, color: "text-success" },
          { label: "Всего продаж", value: stats?.total_sales || 0, icon: TrendingUp, color: "text-primary" },
          { label: "Товаров на платформе", value: stats?.total_products || 0, icon: Package, color: "text-warning" },
          {
            label: "Ср. чек",
            value: stats?.total_sales ? formatPrice((stats.total_revenue) / stats.total_sales) : "—",
            icon: BarChart3, color: "text-violet-400"
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <div className="text-xl font-bold">{isLoading ? "—" : value}</div>
            <div className="text-xs text-foreground-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Revenue area chart */}
      <div className="card p-6">
        <h3 className="font-semibold mb-5">Доход за 30 дней</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                formatter={(v: number) => [formatPrice(v), "Доход"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-60 flex items-center justify-center text-foreground-muted">
            Недостаточно данных для отображения графика
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales bars */}
        <div className="card p-6">
          <h3 className="font-semibold mb-5">Продажи по дням</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                />
                <Bar dataKey="sales" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-foreground-muted">Нет данных</div>
          )}
        </div>

        {/* Top products pie */}
        <div className="card p-6">
          <h3 className="font-semibold mb-5">Топ-5 товаров по продажам</h3>
          {(topProducts || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={topProducts?.slice(0, 5)}
                  cx="50%" cy="50%"
                  outerRadius={80}
                  dataKey="sales"
                  nameKey="title"
                  label={({ name, percent }) => `${name?.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {topProducts?.slice(0, 5).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  formatter={(v, n) => [v + " продаж", n]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-foreground-muted">Нет данных</div>
          )}
        </div>
      </div>
    </div>
  );
}
