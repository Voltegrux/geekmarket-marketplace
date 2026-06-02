"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Shield, Users, Package, BarChart3, Star, Code2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Обзор", icon: BarChart3, exact: true },
  { href: "/admin/users", label: "Пользователи", icon: Users },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/reviews", label: "Отзывы", icon: Star },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") router.push("/");
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "admin") return null;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-6">
        <aside className="w-56 flex-shrink-0 hidden md:block">
          <div className="card p-4 sticky top-24 space-y-1">
            <div className="flex items-center gap-2 px-3 py-2 mb-3 pb-3 border-b border-border">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold">Администратор</span>
            </div>
            {adminLinks.map(({ href, label, icon: Icon, exact }) => (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  isActive(href, exact)
                    ? "bg-primary/10 text-primary font-medium border border-primary/20"
                    : "hover:bg-card-hover text-foreground-muted hover:text-foreground"
                )}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border">
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-card-hover text-foreground-muted">
                <Code2 className="w-4 h-4" /> Вернуться
              </Link>
            </div>
          </div>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
