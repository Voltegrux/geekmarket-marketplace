"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  User, Package, Heart, Bell, Settings, BarChart3, Plus,
  ShoppingBag, TrendingUp, Code2, LogOut, ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";

const buyerLinks = [
  { href: "/dashboard", label: "Профиль", icon: User, exact: true },
  { href: "/dashboard/orders", label: "Мои покупки", icon: Package },
  { href: "/dashboard/favorites", label: "Избранное", icon: Heart },
  { href: "/dashboard/notifications", label: "Уведомления", icon: Bell },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
];

const sellerLinks = [
  { href: "/dashboard/seller", label: "Обзор", icon: BarChart3, exact: true },
  { href: "/dashboard/seller/products", label: "Мои товары", icon: ShoppingBag },
  { href: "/dashboard/seller/products/new", label: "Добавить товар", icon: Plus },
  { href: "/dashboard/seller/analytics", label: "Аналитика", icon: TrendingUp },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/auth/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  const isSeller = user.role === "seller" || user.role === "admin";

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-6">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden md:block">
          <div className="card p-5 sticky top-24 space-y-6">
            {/* User info */}
            <div className="flex items-center gap-3 pb-5 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary/30">
                {user.username[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{user.full_name || user.username}</p>
                <p className="text-xs text-foreground-muted capitalize">
                  {user.role === "buyer" ? "Покупатель" : user.role === "seller" ? "Продавец" : "Администратор"}
                </p>
              </div>
            </div>

            {/* Buyer nav */}
            <nav className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-foreground-muted font-medium mb-2 px-2">Аккаунт</p>
              {buyerLinks.map(({ href, label, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                    isActive(href, exact)
                      ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                      : "hover:bg-card-hover text-foreground-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Seller nav */}
            {isSeller && (
              <nav className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-foreground-muted font-medium mb-2 px-2">Продажи</p>
                {sellerLinks.map(({ href, label, icon: Icon, exact }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                      isActive(href, exact)
                        ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                        : "hover:bg-card-hover text-foreground-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Admin */}
            {user.role === "admin" && (
              <nav className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-foreground-muted font-medium mb-2 px-2">Админ</p>
                <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-card-hover text-foreground-muted hover:text-foreground transition-all">
                  <Code2 className="w-4 h-4" /> Панель администратора
                </Link>
              </nav>
            )}

            <button
              onClick={() => { logout(); router.push("/"); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-danger hover:bg-danger/10 transition-all"
            >
              <LogOut className="w-4 h-4" /> Выйти
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
