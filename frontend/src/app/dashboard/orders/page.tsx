"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Package, Download, ChevronRight, ShoppingBag } from "lucide-react";
import { ordersApi, productsApi } from "@/lib/api";
import { Pagination } from "@/components/ui/Pagination";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Order } from "@/types";
import toast from "react-hot-toast";

const statusConfig = {
  completed: { label: "Выполнен", className: "bg-success/10 text-success border-success/30" },
  pending: { label: "Ожидает", className: "bg-warning/10 text-warning border-warning/30" },
  refunded: { label: "Возврат", className: "bg-foreground-muted/10 text-foreground-muted border-border" },
  cancelled: { label: "Отменён", className: "bg-danger/10 text-danger border-danger/30" },
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page],
    queryFn: () => ordersApi.list({ page, per_page: 10 }).then((r) => r.data),
  });

  const handleDownload = async (productId: number, fileId: number) => {
    try {
      const { data } = await productsApi.downloadFile(productId, fileId);
      window.open(data.download_url, "_blank");
    } catch {
      toast.error("Ошибка скачивания файла");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-6 h-32" />
        ))}
      </div>
    );
  }

  const orders: Order[] = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мои покупки</h1>
        <span className="text-foreground-muted text-sm">{data?.total ?? 0} заказов</span>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Покупок пока нет</h3>
          <p className="text-foreground-muted mb-6">Найдите подходящие товары в каталоге</p>
          <Link href="/catalog" className="btn-primary inline-flex items-center gap-2">
            Перейти в каталог <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.completed;
            return (
              <div key={order.id} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">Заказ #{order.id}</span>
                    <span className={`badge border text-xs ${status.className}`}>{status.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold gradient-text">{formatPrice(order.total_price)}</p>
                    <p className="text-xs text-foreground-muted">{formatDate(order.created_at)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-card-hover rounded-xl">
                      <Package className="w-8 h-8 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.product_id}`}
                          className="font-medium text-sm hover:text-primary transition-colors line-clamp-1">
                          {item.product?.title}
                        </Link>
                        <p className="text-xs text-foreground-muted">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex gap-2">
                        {item.product?.files?.filter((f) => !f.is_preview).map((file) => (
                          <button
                            key={file.id}
                            onClick={() => handleDownload(item.product_id, file.id)}
                            className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {file.file_name.split(".").pop()?.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {(data?.pages ?? 0) > 1 && (
            <Pagination page={page} pages={data!.pages} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  );
}
