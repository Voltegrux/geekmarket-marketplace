"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { ShoppingCart, Search, Bell, User, Menu, X, LogOut, Settings, Package, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";

const NAV_LINKS = [
  { href: "/catalog", label: "Каталог" },
  { href: "/catalog?category=telegram-bots", label: "Боты" },
  { href: "/catalog?category=saas-starters", label: "SaaS" },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.count());
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: () => notificationsApi.unreadCount().then((r) => r.data),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(search)}`);
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <span className="font-mono text-primary font-bold text-xs leading-none">&gt;_</span>
            </div>
            <span className="font-display font-bold text-base text-foreground hidden sm:block tracking-tight">
              Geek<span className="text-primary">Market</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 ml-3">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href.split("?")[0]));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-foreground-muted hover:text-foreground hover:bg-surface"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden md:block mx-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">

            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="btn-ghost p-2 rounded-lg md:hidden"
              aria-label="Поиск"
            >
              <Search className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative btn-ghost p-2 rounded-lg" aria-label="Корзина">
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-background text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold font-mono">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link href="/dashboard/notifications" className="relative btn-ghost p-2 rounded-lg" aria-label="Уведомления">
                  <Bell className="w-[18px] h-[18px]" />
                  {(unreadData?.count ?? 0) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold font-mono">
                      {unreadData?.count}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-surface transition-colors cursor-pointer"
                    aria-label="Меню пользователя"
                  >
                    <div className="w-6 h-6 bg-primary/15 rounded-lg flex items-center justify-center text-primary font-bold text-xs border border-primary/25 font-mono">
                      {user?.username?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-foreground">{user?.username}</span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border rounded-2xl z-50 py-1.5 overflow-hidden shadow-card animate-slide-down">
                        <div className="px-3.5 py-2.5 border-b border-border mb-1">
                          <p className="font-semibold text-sm font-display">{user?.full_name || user?.username}</p>
                          <p className="text-xs text-foreground-muted font-mono mt-0.5">{user?.email}</p>
                        </div>
                        {[
                          { href: "/dashboard", icon: User, label: "Личный кабинет" },
                          { href: "/dashboard/orders", icon: Package, label: "Мои покупки" },
                          ...(user?.role === "seller" || user?.role === "admin"
                            ? [{ href: "/dashboard/seller", icon: BarChart3, label: "Кабинет продавца" }]
                            : []),
                          ...(user?.role === "admin"
                            ? [{ href: "/admin", icon: Settings, label: "Админ-панель" }]
                            : []),
                        ].map(({ href, icon: Icon, label }) => (
                          <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-card-hover text-sm transition-colors text-foreground-muted hover:text-foreground"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                          </Link>
                        ))}
                        <div className="border-t border-border mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-danger/10 text-danger text-sm w-full transition-colors cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Выйти
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link href="/auth/login" className="btn-ghost text-sm px-3.5 py-1.5 rounded-lg">Войти</Link>
                <Link href="/auth/register" className="btn-primary text-sm px-3.5 py-1.5 !rounded-lg">Регистрация</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn-ghost p-2 rounded-lg md:hidden ml-1 cursor-pointer"
              aria-label="Меню"
            >
              {mobileOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden pb-3 animate-slide-down">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground-muted" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск товаров..."
                  className="input pl-9 text-sm"
                />
              </div>
            </form>
          </div>
        )}

        {/* Mobile nav menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-border/60 pt-3 animate-slide-down">
            <nav className="flex flex-col gap-0.5">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="py-2.5 px-3 hover:bg-surface rounded-xl text-sm text-foreground-muted hover:text-foreground transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              ))}
              {!isAuthenticated && (
                <>
                  <div className="border-t border-border/60 mt-2 pt-2 flex flex-col gap-1.5">
                    <Link href="/auth/login" className="py-2.5 px-3 hover:bg-surface rounded-xl text-sm text-foreground-muted hover:text-foreground transition-colors" onClick={() => setMobileOpen(false)}>
                      Войти
                    </Link>
                    <Link href="/auth/register" className="btn-primary text-sm justify-center" onClick={() => setMobileOpen(false)}>
                      Регистрация
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
