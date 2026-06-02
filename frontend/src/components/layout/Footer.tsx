import Link from "next/link";
import { Github, Twitter, Send } from "lucide-react";

const CATALOG_LINKS = [
  ["Telegram Боты", "/catalog?category=telegram-bots"],
  ["Mini Apps", "/catalog?category=mini-apps"],
  ["Шаблоны сайтов", "/catalog?category=website-templates"],
  ["UI Kits", "/catalog?category=ui-kits"],
  ["SaaS Стартеры", "/catalog?category=saas-starters"],
  ["API Проекты", "/catalog?category=api-projects"],
];

const SELLER_LINKS = [
  ["Стать продавцом", "/auth/register"],
  ["Кабинет продавца", "/dashboard/seller"],
  ["Загрузить товар", "/dashboard/seller/products/new"],
  ["Статистика", "/dashboard/seller/analytics"],
];

const ACCOUNT_LINKS = [
  ["Личный кабинет", "/dashboard"],
  ["Мои покупки", "/dashboard/orders"],
  ["Избранное", "/dashboard/favorites"],
  ["Уведомления", "/dashboard/notifications"],
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-auto bg-surface/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <span className="font-mono text-primary font-bold text-xs leading-none">&gt;_</span>
              </div>
              <span className="font-display font-bold text-base text-foreground tracking-tight">
                Geek<span className="text-primary">Market</span>
              </span>
            </Link>
            <p className="text-sm text-foreground-muted leading-relaxed mb-5 max-w-[200px]">
              Маркетплейс цифровых продуктов для разработчиков
            </p>
            <div className="flex gap-2">
              {[
                { icon: Github, label: "GitHub" },
                { icon: Twitter, label: "Twitter" },
                { icon: Send, label: "Telegram" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground-muted hover:text-primary hover:border-primary/30 transition-all duration-200 cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="font-mono text-xs text-foreground-muted uppercase tracking-widest mb-4">{"// каталог"}</h4>
            <ul className="space-y-2.5">
              {CATALOG_LINKS.map(([name, href]) => (
                <li key={name}>
                  <Link href={href} className="text-sm text-foreground-muted hover:text-foreground transition-colors duration-150">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h4 className="font-mono text-xs text-foreground-muted uppercase tracking-widest mb-4">{"// продавцам"}</h4>
            <ul className="space-y-2.5">
              {SELLER_LINKS.map(([name, href]) => (
                <li key={name}>
                  <Link href={href} className="text-sm text-foreground-muted hover:text-foreground transition-colors duration-150">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-mono text-xs text-foreground-muted uppercase tracking-widest mb-4">{"// аккаунт"}</h4>
            <ul className="space-y-2.5">
              {ACCOUNT_LINKS.map(([name, href]) => (
                <li key={name}>
                  <Link href={href} className="text-sm text-foreground-muted hover:text-foreground transition-colors duration-150">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-foreground-muted font-mono">
            © {new Date().getFullYear()} GeekMarket — все права защищены
          </p>
          <div className="flex gap-5 text-xs text-foreground-muted">
            <a href="#" className="hover:text-foreground transition-colors cursor-pointer">Конфиденциальность</a>
            <a href="#" className="hover:text-foreground transition-colors cursor-pointer">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
