"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, Package, ArrowRight, Lock } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { ordersApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, removeItem, clearCart, total } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const orderMutation = useMutation({
    mutationFn: () =>
      ordersApi.create(items.map((i) => i.product.id)).then((r) => r.data),
    onSuccess: (order) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Покупка совершена! Файлы доступны в личном кабинете.");
      router.push(`/dashboard/orders`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Ошибка оформления заказа");
    },
  });

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    orderMutation.mutate();
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-12 h-12 text-foreground-muted" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Корзина пуста</h1>
        <p className="text-foreground-muted mb-8">
          Добавьте товары из каталога, чтобы оформить покупку
        </p>
        <Link href="/catalog" className="btn-primary inline-flex items-center gap-2">
          Перейти в каталог <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <ShoppingCart className="w-8 h-8 text-primary" />
        Корзина
        <span className="text-lg font-normal text-foreground-muted">({items.length} товаров)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product }) => (
            <div key={product.id} className="card p-4 flex gap-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-card-hover flex-shrink-0">
                {product.preview_url ? (
                  <Image src={product.preview_url} alt={product.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-8 h-8 text-foreground-muted" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${product.id}`} className="font-semibold hover:text-primary line-clamp-2 transition-colors">
                  {product.title}
                </Link>
                <p className="text-sm text-foreground-muted mt-1">{product.category.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {product.tags.slice(0, 3).map((t) => (
                    <span key={t.id} className="badge bg-card-hover border border-border text-xs">{t.tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span className="text-xl font-bold gradient-text">{formatPrice(product.price)}</span>
                <button
                  onClick={() => removeItem(product.id)}
                  className="p-2 text-foreground-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-20">
            <h3 className="font-bold text-lg mb-5">Итого</h3>

            <div className="space-y-3 mb-5">
              {items.map(({ product }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-foreground-muted line-clamp-1 flex-1 pr-4">{product.title}</span>
                  <span className="flex-shrink-0 font-medium">{formatPrice(product.price)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 mb-5">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Итого:</span>
                <span className="text-2xl font-bold gradient-text">{formatPrice(total())}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={orderMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2 shadow-glow mb-3"
            >
              {orderMutation.isPending ? (
                "Оформление..."
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Оформить заказ
                </>
              )}
            </button>

            <button
              onClick={() => clearCart()}
              className="w-full text-sm text-foreground-muted hover:text-danger transition-colors py-2"
            >
              Очистить корзину
            </button>

            <div className="mt-5 pt-5 border-t border-border space-y-2 text-xs text-foreground-muted">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-success" />
                Безопасная транзакция
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-success" />
                Мгновенный доступ к файлам
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
