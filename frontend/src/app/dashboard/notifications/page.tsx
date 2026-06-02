"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Package, Star, ShoppingBag } from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { Pagination } from "@/components/ui/Pagination";
import { formatRelativeDate } from "@/lib/utils";
import type { Notification } from "@/types";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const typeIcons: Record<string, React.ElementType> = {
  purchase: ShoppingBag,
  review: Star,
  order: Package,
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => notificationsApi.list({ page, per_page: 20 }).then((r) => r.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      toast.success("Все уведомления прочитаны");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  const notifications: Notification[] = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" /> Уведомления
        </h1>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={() => markAllMutation.mutate()}
            className="btn-ghost text-sm flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" /> Прочитать все
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 h-16" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Уведомлений нет</h3>
          <p className="text-foreground-muted">Здесь будут появляться важные события</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <button
                key={n.id}
                onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                className={cn(
                  "card p-4 flex items-start gap-4 w-full text-left transition-all",
                  !n.is_read && "border-primary/30 bg-primary/5"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                  n.is_read ? "bg-card-hover" : "bg-primary/10"
                )}>
                  <Icon className={cn("w-4 h-4", n.is_read ? "text-foreground-muted" : "text-primary")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("font-medium text-sm", !n.is_read && "text-foreground")}>{n.title}</p>
                    <span className="text-xs text-foreground-muted flex-shrink-0">{formatRelativeDate(n.created_at)}</span>
                  </div>
                  <p className="text-sm text-foreground-muted mt-0.5 line-clamp-2">{n.message}</p>
                </div>
                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {(data?.pages ?? 0) > 1 && (
        <Pagination page={page} pages={data!.pages} onPageChange={setPage} />
      )}
    </div>
  );
}
