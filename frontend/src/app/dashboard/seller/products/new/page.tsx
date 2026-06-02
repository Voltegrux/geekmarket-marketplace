"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Plus, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { productsApi, categoriesApi } from "@/lib/api";
import type { Category } from "@/types";
import toast from "react-hot-toast";

const schema = z.object({
  title: z.string().min(3, "Минимум 3 символа").max(200),
  short_description: z.string().min(10, "Минимум 10 символов").max(500),
  description: z.string().min(50, "Минимум 50 символов"),
  price: z.number({ invalid_type_error: "Введите число" }).min(0, "Цена >= 0"),
  category_id: z.number({ invalid_type_error: "Выберите категорию" }),
  technologies: z.string().optional(),
  version: z.string().optional(),
  is_published: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [productFiles, setProductFiles] = useState<File[]>([]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list().then((r) => r.data as Category[]),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_published: true },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { data: product } = await productsApi.create({ ...data, tags });

      if (previewFile) {
        await productsApi.uploadFile(product.id, previewFile, true);
      }
      for (const file of productFiles) {
        await productsApi.uploadFile(product.id, file, false);
      }

      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Товар создан!");
      router.push("/dashboard/seller/products");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Ошибка создания товара");
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/seller/products" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Добавить товар</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold">Основная информация</h2>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Название *</label>
                <input {...register("title")} placeholder="Например: AI Telegram Бот на GPT-4" className="input" />
                {errors.title && <p className="text-danger text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Краткое описание *</label>
                <textarea {...register("short_description")} rows={2} placeholder="Одна-две фразы о товаре" className="input resize-none" />
                {errors.short_description && <p className="text-danger text-xs mt-1">{errors.short_description.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Полное описание *</label>
                <textarea {...register("description")} rows={8} placeholder="Подробное описание: что включает, как использовать, требования..." className="input resize-none" />
                {errors.description && <p className="text-danger text-xs mt-1">{errors.description.message}</p>}
              </div>
            </div>

            {/* Tech */}
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold">Технические детали</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Технологии</label>
                  <input {...register("technologies")} placeholder="Python, FastAPI, Docker" className="input" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Версия</label>
                  <input {...register("version")} placeholder="1.0.0" className="input" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Теги</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {tags.map((t) => (
                    <span key={t} className="badge bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      {t}
                      <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-danger">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="python, docker, telegram..."
                    className="input flex-1 text-sm"
                  />
                  <button type="button" onClick={addTag} className="btn-secondary px-4">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-foreground-muted mt-1">Максимум 10 тегов</p>
              </div>
            </div>

            {/* Files */}
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold">Файлы</h2>

              <div>
                <label className="text-sm font-medium mb-2 block">Превью (изображение)</label>
                <label className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/40 transition-colors">
                  <Upload className="w-6 h-6 text-foreground-muted" />
                  <span className="text-sm text-foreground-muted">
                    {previewFile ? previewFile.name : "Нажмите для загрузки (PNG, JPG)"}
                  </span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => setPreviewFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Файлы продукта</label>
                <label className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/40 transition-colors">
                  <Upload className="w-6 h-6 text-foreground-muted" />
                  <span className="text-sm text-foreground-muted text-center">
                    {productFiles.length > 0 ? `${productFiles.length} файл(ов) выбрано` : "ZIP, PDF, DOCX, FIG и другие (до 100MB)"}
                  </span>
                  <input type="file" multiple className="hidden"
                    onChange={(e) => setProductFiles(Array.from(e.target.files || []))} />
                </label>
                {productFiles.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {productFiles.map((f) => (
                      <li key={f.name} className="text-xs text-foreground-muted flex items-center gap-2">
                        <span className="badge bg-card border border-border">{f.name.split(".").pop()?.toUpperCase()}</span>
                        {f.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-5">
            <div className="card p-6 space-y-4 sticky top-20">
              <h2 className="font-semibold">Публикация</h2>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Категория *</label>
                <select {...register("category_id", { valueAsNumber: true })} className="input cursor-pointer">
                  <option value="">Выберите категорию</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-danger text-xs mt-1">{errors.category_id.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Цена (₽) *</label>
                <input
                  {...register("price", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  placeholder="2990"
                  className="input text-lg font-bold"
                />
                {errors.price && <p className="text-danger text-xs mt-1">{errors.price.message}</p>}
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Сразу опубликовать</span>
                <input type="checkbox" {...register("is_published")} className="w-4 h-4 accent-primary" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full shadow-glow"
              >
                {isSubmitting ? "Создание..." : "Создать товар"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
