import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "GeekMarket — Маркетплейс цифровых продуктов",
    template: "%s | GeekMarket",
  },
  description:
    "Готовые решения, шаблоны и инструменты для разработчиков: Telegram-боты, Mini Apps, UI Kits, SaaS-стартеры и многое другое.",
  keywords: ["telegram bot", "mini app", "ui kit", "saas", "fastapi", "next.js", "шаблоны"],
  authors: [{ name: "GeekMarket" }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    title: "GeekMarket — Маркетплейс цифровых продуктов",
    description: "Готовые решения для разработчиков и дизайнеров",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
