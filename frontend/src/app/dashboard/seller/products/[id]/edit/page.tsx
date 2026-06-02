"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Plus, X, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { productsApi, categoriesApi } from "@/lib/api";
import type { Category, Product } from "@/types";
import toast from "react-hot-toast";

const schema = z.object({
  title: z.string().min(3).max(200).optional(),
  short_description: z.string().min(10).max(500).optional(),
  description: z.string().min(50).optional(),
  price: z.number().min(0).optional(),
  category_id: z.number().optional(),
  technologies: z.string().optional(),
  version: z.string().optional(),
  is_published: z.boolean().optional(),
});

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-edit", id],
    queryFn: () => productsApi.get(Number(id)).then((r) => r.data as Product),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list().then((r) => r.data as Category[]),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        short_description: product.short_description,
        description: product.description,
        price: product.price,
        category_id: product.category.id,
        technologies: product.technologies || "",
        version: product.version || "",
        is_published: product.is_published,
      });
      setTags(product.tags.map((t) => t.tag));
    }
  }, [product, reset]);

  const onSubmit = async (data: any) => {
    try {
      await productsApi.update(Number(id), { ...data, tags });
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      toast.success("Товар обновлён");
      router.push("/dashboard/seller/products");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Ошибка");
    }
  };

  if (isLoading) return <div className="animate-pulse space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-24" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/seller/products" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Редактировать товар</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Название</label>
            <input {...register("title")} className="input" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Краткое описание</label>
            <textarea {...register("short_description")} rows={2} className="input resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Полное описание</label>
            <textarea {...register("description")} rows={8} className="input resize-none" />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Цена (₽)</label>
              <input {...register("price", { valueAsNumber: true })} type="number" min="0" className="input" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Категория</label>
              <select {...register("category_id", { valueAsNumber: true })} className="input cursor-pointer">
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Версия</label>
              <input {...register("version")} className="input" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Технологии</label>
            <input {...register("technologies")} placeholder="Python, React, Docker..." className="input" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Теги</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {tags.map((t) => (
                <span key={t} className="badge bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                  {t}
                  <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-danger"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const t = tagInput.trim(); if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); } } }}
                placeholder="Добавить тег..." className="input flex-1 text-sm" />
              <button type="button" onClick={() => { const t = tagInput.trim(); if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); } }} className="btn-secondary px-4">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Опубликован</span>
            <input type="checkbox" {...register("is_published")} className="w-4 h-4 accent-primary" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
          </button>
          <Link href="/dashboard/seller/products" className="btn-secondary">Отмена</Link>
        </div>
      </form>
    </div>
  );
}
