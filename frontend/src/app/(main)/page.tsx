"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, Zap, Shield, Download, TrendingUp, Bot, Smartphone,
  Layout, Palette, Rocket, Code2, Component, Star, Users, Package,
} from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { productsApi, categoriesApi } from "@/lib/api";
import type { Product, Category } from "@/types";
import { motion } from "framer-motion";

const categoryIcons: Record<string, React.ElementType> = {
  Bot, Smartphone, Layout, Palette, Rocket, Code2, Component, Star,
};

const stats = [
  { label: "Товаров", value: "50+", icon: Package },
  { label: "Разработчиков", value: "500+", icon: Users },
  { label: "Продаж", value: "2K+", icon: TrendingUp },
  { label: "Рейтинг", value: "4.9", icon: Star },
];

const features = [
  { icon: Zap, title: "Мгновенный доступ", desc: "Скачай сразу после оплаты" },
  { icon: Shield, title: "Безопасно", desc: "Защита покупателей и продавцов" },
  { icon: Download, title: "Все форматы", desc: "ZIP, PDF, Figma, SVG и другие" },
  { icon: Code2, title: "Для разработчиков", desc: "Код, архитектура, документация" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export default function HomePage() {
  const { data: popularData, isLoading: loadingPopular } = useQuery({
    queryKey: ["products", "popular"],
    queryFn: () => productsApi.popular(8).then((r) => r.data as Product[]),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list().then((r) => r.data as Category[]),
  });

  return (
    <div className="overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex items-center">
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-full px-3.5 py-1.5 text-xs font-medium text-primary font-mono mb-7"
              >
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-slow" />
                Production-ready цифровые продукты
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="font-display text-5xl md:text-6xl xl:text-7xl font-bold text-foreground leading-[1.08] tracking-tight mb-6"
              >
                Маркетплейс
                <br />
                <span className="text-primary">цифровых</span>
                <br />
                продуктов
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.16 }}
                className="text-foreground-muted text-lg leading-relaxed mb-10 max-w-lg"
              >
                Telegram-боты, Mini Apps, UI Kits, SaaS-стартеры —
                готовые решения для ускорения твоего проекта.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.22 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link href="/catalog" className="btn-primary text-base px-6 py-3 shadow-glow">
                  Смотреть каталог
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/auth/register" className="btn-secondary text-base px-6 py-3">
                  Стать продавцом
                  <TrendingUp className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* Right: bento stats grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:grid grid-cols-2 gap-3"
            >
              {stats.map(({ label, value, icon: Icon }, i) => (
                <div
                  key={label}
                  className="card p-6 flex flex-col justify-between group cursor-default"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <Icon className="w-5 h-5 text-foreground-muted mb-6" />
                  <div>
                    <div className="text-4xl font-display font-bold text-foreground mb-1">{value}</div>
                    <div className="text-sm text-foreground-muted">{label}</div>
                  </div>
                  <div className="mt-4 h-px bg-gradient-to-r from-primary/40 to-transparent" />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Mobile stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 lg:hidden">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="card p-4 flex flex-col items-center text-center">
                <Icon className="w-4 h-4 text-primary mb-2" />
                <div className="text-2xl font-display font-bold text-foreground">{value}</div>
                <div className="text-xs text-foreground-muted mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features strip ── */}
      <section className="py-6 border-y border-border/60 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border/40 rounded-2xl overflow-hidden">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 p-5 bg-background">
                <div className="w-9 h-9 bg-primary/8 border border-primary/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground font-display">{title}</p>
                  <p className="text-xs text-foreground-muted mt-0.5 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary font-mono text-xs font-medium mb-2 uppercase tracking-widest">
                {"// categories"}
              </p>
              <h2 className="section-title">Популярные категории</h2>
            </div>
            <Link href="/catalog" className="btn-ghost flex items-center gap-1 text-sm">
              Все <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(categories || []).map((cat, i) => {
              const Icon = categoryIcons[cat.icon || "Package"] || Package;
              return (
                <motion.div
                  key={cat.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeUp}
                >
                  <Link
                    href={`/catalog?category=${cat.slug}`}
                    className="group card p-5 flex flex-col cursor-pointer hover:border-primary/25 transition-all duration-300 block"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105"
                      style={{ background: `${cat.color}12`, border: `1px solid ${cat.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: cat.color || "#00D68F" }} />
                    </div>
                    <h3 className="font-semibold text-sm font-display text-foreground group-hover:text-primary transition-colors">{cat.title}</h3>
                    <p className="text-xs text-foreground-muted mt-1 leading-relaxed line-clamp-2">{cat.description}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Popular products ── */}
      <section className="py-20 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary font-mono text-xs font-medium mb-2 uppercase tracking-widest">
                {"// popular"}
              </p>
              <h2 className="section-title">Топ товаров</h2>
            </div>
            <Link href="/catalog?sort_by=sales_count" className="btn-ghost flex items-center gap-1 text-sm">
              Смотреть все <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ProductGrid products={popularData || []} loading={loadingPopular} />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 border-t border-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-primary/15 bg-surface">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />

            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <p className="font-mono text-xs text-primary uppercase tracking-widest mb-4">{"// start selling"}</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                Начните зарабатывать
                <br />
                <span className="text-primary">уже сегодня</span>
              </h2>
              <p className="text-foreground-muted text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                Создайте аккаунт продавца, загрузите продукты и начните получать доход
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/register" className="btn-primary text-base px-8 py-3.5 shadow-glow">
                  Стать продавцом
                </Link>
                <Link href="/catalog" className="btn-secondary text-base px-8 py-3.5">
                  Смотреть каталог
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
