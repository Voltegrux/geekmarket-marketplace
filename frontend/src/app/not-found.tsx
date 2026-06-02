import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-black gradient-text mb-6">404</div>
        <h1 className="text-3xl font-bold mb-3">Страница не найдена</h1>
        <p className="text-foreground-muted mb-8 text-lg">
          Запрашиваемая страница не существует или была перемещена
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          На главную
        </Link>
      </div>
    </div>
  );
}
