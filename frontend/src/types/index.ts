export type UserRole = "buyer" | "seller" | "admin";
export type OrderStatus = "pending" | "completed" | "refunded" | "cancelled";

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

export interface ProductTag {
  id: number;
  tag: string;
}

export interface ProductFile {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  is_preview: boolean;
}

export interface Product {
  id: number;
  title: string;
  short_description: string;
  description: string;
  price: number;
  preview_url: string | null;
  rating: number;
  reviews_count: number;
  sales_count: number;
  views_count: number;
  technologies: string | null;
  version: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  seller: User;
  category: Category;
  tags: ProductTag[];
  files: ProductFile[];
  is_favorited: boolean;
  is_purchased: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  price: number;
  product: Product;
}

export interface Order {
  id: number;
  user_id: number;
  total_price: number;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: User;
}

export interface ReviewsResponse {
  items: Review[];
  total: number;
  page: number;
  per_page: number;
  stats: {
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<number, number>;
  };
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface SellerStats {
  total_revenue: number;
  total_sales: number;
  total_products: number;
  sales_by_day: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
}
