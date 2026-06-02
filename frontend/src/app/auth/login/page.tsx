"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight, Info } from "lucide-react";
import { authApi, usersApi } from "@/lib/api";
import { DEMO_MODE } from "@/lib/demo";
import { useAuthStore } from "@/stores/auth";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { data: tokens } = await authApi.login(data.email, data.password);
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      const { data: user } = await usersApi.me();
      setAuth(user, tokens.access_token, tokens.refresh_token);
      toast.success("Добро пожаловать!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Неверный email или пароль");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <span className="font-mono text-primary font-bold text-xs leading-none">&gt;_</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">
              Geek<span className="text-primary">Market</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl font-bold mb-2">Добро пожаловать!</h1>
          <p className="text-foreground-muted">Войдите в свой аккаунт</p>
        </div>

        <div className="card p-8">
          {DEMO_MODE && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/8 border border-primary/20 text-sm">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-foreground-muted leading-relaxed">
                Это демо-версия портфолио. Данные статичны, авторизация отключена —
                просто посмотрите <span className="text-primary">каталог</span> и страницы товаров.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="input"
                autoComplete="email"
              />
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Пароль</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 shadow-glow"
            >
              {isSubmitting ? "Вход..." : <>Войти <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 p-4 bg-card-hover rounded-xl border border-border text-sm">
            <p className="text-foreground-muted mb-2 font-medium">Тестовые аккаунты:</p>
            <div className="space-y-1 text-xs text-foreground-muted font-mono">
              <p>admin@geekmarket.dev / admin123</p>
              <p>seller1@geekmarket.dev / seller123</p>
              <p>user1@example.com / user123</p>
            </div>
          </div>

          <p className="text-center text-sm text-foreground-muted mt-6">
            Нет аккаунта?{" "}
            <Link href="/auth/register" className="text-primary hover:underline font-medium">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
