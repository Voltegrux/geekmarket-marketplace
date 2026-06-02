"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { User, Mail, Calendar, Edit3, Check, Package, Heart, ShoppingBag } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { usersApi, ordersApi, favoritesApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { useState } from "react";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: ordersData } = useQuery({
    queryKey: ["orders-count"],
    queryFn: () => ordersApi.list({ per_page: 1 }).then((r) => r.data),
  });

  const { data: favsData } = useQuery({
    queryKey: ["favorites-count"],
    queryFn: () => favoritesApi.list({ per_page: 1 }).then((r) => r.data),
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { full_name: user?.full_name || "", bio: user?.bio || "" },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { full_name: string; bio: string }) => usersApi.update(data).then((r) => r.data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setIsEditing(false);
      toast.success("Профиль обновлён");
    },
    onError: () => toast.error("Ошибка сохранения"),
  });

  const stats = [
    { label: "Покупок", value: ordersData?.total ?? 0, icon: Package },
    { label: "Избранных", value: favsData?.total ?? 0, icon: Heart },
    { label: "Роль", value: user?.role === "buyer" ? "Покупатель" : user?.role === "seller" ? "Продавец" : "Админ", icon: ShoppingBag },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Мой профиль</h1>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-3xl border-2 border-primary/30 flex-shrink-0">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <form
                onSubmit={handleSubmit((d) => updateMutation.mutate(d))}
                className="space-y-3"
              >
                <div>
                  <label className="text-sm text-foreground-muted mb-1 block">Имя</label>
                  <input {...register("full_name")} className="input text-sm" />
                </div>
                <div>
                  <label className="text-sm text-foreground-muted mb-1 block">О себе</label>
                  <textarea {...register("bio")} rows={3} className="input text-sm resize-none" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={updateMutation.isPending} className="btn-primary text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
                  </button>
                  <button type="button" onClick={() => { setIsEditing(false); reset(); }} className="btn-secondary text-sm">
                    Отмена
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold">{user?.full_name || user?.username}</h2>
                  <button onClick={() => setIsEditing(true)} className="text-foreground-muted hover:text-primary transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-foreground-muted text-sm mb-1">@{user?.username}</p>
                <p className="text-foreground-muted text-sm flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {user?.email}
                </p>
                {user?.bio && <p className="text-sm mt-3 leading-relaxed">{user.bio}</p>}
                <p className="text-xs text-foreground-muted mt-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> На GeekMarket с {user?.created_at ? formatDate(user.created_at) : "—"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5 text-center">
            <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-foreground-muted mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
