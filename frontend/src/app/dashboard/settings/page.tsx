"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Lock, User, Camera } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { usersApi } from "@/lib/api";
import toast from "react-hot-toast";

const profileSchema = z.object({
  full_name: z.string().min(2).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Введите текущий пароль"),
  new_password: z.string().min(8, "Минимум 8 символов"),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Пароли не совпадают",
  path: ["confirm_password"],
});

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user?.full_name || "", bio: user?.bio || "" },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });

  const profileMutation = useMutation({
    mutationFn: (data: any) => usersApi.update(data).then((r) => r.data),
    onSuccess: (updated) => { setUser(updated); toast.success("Профиль обновлён"); },
    onError: () => toast.error("Ошибка сохранения"),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      usersApi.changePassword(data),
    onSuccess: () => { toast.success("Пароль изменён"); passwordForm.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Ошибка"),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file).then((r) => r.data),
    onSuccess: (updated) => { setUser(updated); toast.success("Аватар обновлён"); },
    onError: () => toast.error("Ошибка загрузки"),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings className="w-6 h-6 text-primary" /> Настройки профиля
      </h1>

      {/* Avatar */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" /> Аватар
        </h2>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold border-2 border-primary/30 flex-shrink-0">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <label className="btn-secondary text-sm cursor-pointer inline-flex items-center gap-2">
              <Camera className="w-4 h-4" />
              {avatarMutation.isPending ? "Загрузка..." : "Загрузить фото"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) avatarMutation.mutate(file);
                }}
              />
            </label>
            <p className="text-xs text-foreground-muted mt-2">JPG, PNG. Максимум 5MB</p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <h2 className="font-semibold mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Основная информация
        </h2>
        <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Имя</label>
              <input {...profileForm.register("full_name")} className="input" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Username</label>
              <input value={user?.username || ""} disabled className="input opacity-60 cursor-not-allowed" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input value={user?.email || ""} disabled className="input opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">О себе</label>
            <textarea {...profileForm.register("bio")} rows={4} placeholder="Расскажите о себе..." className="input resize-none" />
          </div>
          <button type="submit" disabled={profileMutation.isPending} className="btn-primary">
            {profileMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card p-6">
        <h2 className="font-semibold mb-5 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" /> Смена пароля
        </h2>
        <form
          onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate({
            current_password: d.current_password,
            new_password: d.new_password,
          }))}
          className="space-y-4 max-w-md"
        >
          {[
            { name: "current_password", label: "Текущий пароль" },
            { name: "new_password", label: "Новый пароль" },
            { name: "confirm_password", label: "Повторите пароль" },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="text-sm font-medium mb-1.5 block">{label}</label>
              <input
                {...passwordForm.register(name as any)}
                type="password"
                placeholder="••••••••"
                className="input"
              />
              {passwordForm.formState.errors[name as keyof typeof passwordForm.formState.errors] && (
                <p className="text-danger text-xs mt-1">
                  {(passwordForm.formState.errors as any)[name]?.message}
                </p>
              )}
            </div>
          ))}
          <button type="submit" disabled={passwordMutation.isPending} className="btn-primary">
            {passwordMutation.isPending ? "Изменение..." : "Изменить пароль"}
          </button>
        </form>
      </div>
    </div>
  );
}
