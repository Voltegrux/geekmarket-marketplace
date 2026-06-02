"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";
import { UserCheck, UserX, Shield } from "lucide-react";
import type { User } from "@/types";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = { buyer: "Покупатель", seller: "Продавец", admin: "Администратор" };
const roleColors: Record<string, string> = {
  buyer: "bg-card text-foreground-muted border-border",
  seller: "bg-primary/10 text-primary border-primary/30",
  admin: "bg-danger/10 text-danger border-danger/30",
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => adminApi.users({ page, per_page: 20 }).then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleUserActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Статус пользователя обновлён");
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Роль обновлена");
    },
  });

  const users: User[] = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <span className="text-foreground-muted text-sm">{data?.total ?? 0} пользователей</span>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Пользователь</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Роль</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Статус</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Дата</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="p-4"><div className="h-6 bg-card-hover rounded animate-pulse" /></td></tr>
                ))
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-card-hover/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.username}</p>
                        <p className="text-xs text-foreground-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => roleMutation.mutate({ id: user.id, role: e.target.value })}
                      className={cn("badge border cursor-pointer bg-transparent", roleColors[user.role])}
                    >
                      <option value="buyer">Покупатель</option>
                      <option value="seller">Продавец</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={cn("badge border text-xs", user.is_active
                      ? "bg-success/10 text-success border-success/30"
                      : "bg-danger/10 text-danger border-danger/30"
                    )}>
                      {user.is_active ? "Активен" : "Заблокирован"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-foreground-muted">{formatDate(user.created_at)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleMutation.mutate(user.id)}
                      className={cn(
                        "p-2 rounded-xl transition-colors",
                        user.is_active
                          ? "hover:bg-danger/10 text-foreground-muted hover:text-danger"
                          : "hover:bg-success/10 text-foreground-muted hover:text-success"
                      )}
                      title={user.is_active ? "Заблокировать" : "Разблокировать"}
                    >
                      {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(data?.pages ?? 0) > 1 && (
        <Pagination page={page} pages={data!.pages} onPageChange={setPage} />
      )}
    </div>
  );
}
