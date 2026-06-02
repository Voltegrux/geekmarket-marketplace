"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { authApi, usersApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import toast from "react-hot-toast";

const schema = z.object({
  full_name: z.string().min(2, "Минимум 2 символа"),
  username: z.string().min(3, "Минимум 3 символа").max(50).regex(/^[a-zA-Z0-9_]+$/, "Только латиница, цифры и _"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Пароли не совпадают",
  path: ["confirm_password"],
});
type FormData = z.infer<typeof schema>;

const perks = [
  "Мгновенный доступ к файлам после покупки",
  "Возможность стать продавцом",
  "Избранное и история покупок",
  "Уведомления о новинках",
];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { data: tokens } = await authApi.register(data.email, data.username, data.password, data.full_name);
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      const { data: user } = await usersApi.me();
      setAuth(user, tokens.access_token, tokens.refresh_token);
      toast.success("Аккаунт создан!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Ошибка регистрации");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left */}
        <div className="hidden md:block">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <span className="font-mono text-primary font-bold text-xs leading-none">&gt;_</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">
              Geek<span className="text-primary">Market</span>
            </span>
          </Link>
          <h2 className="font-display text-3xl font-bold mb-4">
            Присоединяйтесь к сообществу разработчиков
          </h2>
          <p className="text-foreground-muted mb-8 leading-relaxed">
            Тысячи разработчиков уже используют GeekMarket для монетизации своих продуктов и покупки готовых решений.
          </p>
          <ul className="space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-foreground-muted">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right */}
        <div>
          <div className="text-center mb-6 md:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 justify-center">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <span className="font-mono text-primary font-bold text-xs leading-none">&gt;_</span>
              </div>
              <span className="font-display font-bold text-lg text-foreground tracking-tight">
                Geek<span className="text-primary">Market</span>
              </span>
            </Link>
          </div>

          <div className="card p-8">
            <h1 className="font-display text-2xl font-bold mb-6">Создать аккаунт</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Имя</label>
                <input {...register("full_name")} type="text" placeholder="Иван Иванов" className="input" />
                {errors.full_name && <p className="text-danger text-xs mt-1">{errors.full_name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Username</label>
                <input {...register("username")} type="text" placeholder="ivan_dev" className="input" />
                {errors.username && <p className="text-danger text-xs mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input {...register("email")} type="email" placeholder="ivan@example.com" className="input" />
                {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Пароль</label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Минимум 8 символов"
                    className="input pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Повторите пароль</label>
                <input {...register("confirm_password")} type="password" placeholder="••••••••" className="input" />
                {errors.confirm_password && <p className="text-danger text-xs mt-1">{errors.confirm_password.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-2 shadow-glow mt-2">
                {isSubmitting ? "Создание аккаунта..." : <>Зарегистрироваться <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-sm text-foreground-muted mt-5">
              Уже есть аккаунт?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">Войти</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
