"use client";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({ rating, max = 5, size = "md", interactive, onChange }: StarRatingProps) {
  const sizes = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-6 h-6" };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type={interactive ? "button" : undefined}
          onClick={() => interactive && onChange?.(i + 1)}
          className={cn(interactive && "cursor-pointer hover:scale-110 transition-transform")}
          disabled={!interactive}
        >
          <Star
            className={cn(s, i < Math.round(rating) ? "fill-warning text-warning" : "text-foreground-muted")}
          />
        </button>
      ))}
    </div>
  );
}
