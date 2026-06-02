import axios from "axios";
import { DEMO_MODE, demoApi } from "./demo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api";

export const api = axios.create({
  baseURL: `${API_URL}/v1`,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    DEMO_MODE ? demoApi.auth.blocked() : api.post("/auth/login", { email, password }),
  register: (email: string, username: string, password: string, full_name?: string) =>
    DEMO_MODE ? demoApi.auth.blocked() : api.post("/auth/register", { email, username, password, full_name }),
  refresh: (refresh_token: string) =>
    api.post("/auth/refresh", { refresh_token }),
};

// Users
export const usersApi = {
  me: () => api.get("/users/me"),
  update: (data: Record<string, unknown>) => api.patch("/users/me", data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post("/users/me/password", data),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/users/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Products
export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    DEMO_MODE ? demoApi.products.list(params) : api.get("/products/", { params }),
  get: (id: number) =>
    DEMO_MODE ? demoApi.products.get(id) : api.get(`/products/${id}`),
  popular: (limit = 8) =>
    DEMO_MODE ? demoApi.products.popular(limit) : api.get("/products/popular", { params: { limit } }),
  featured: () =>
    DEMO_MODE ? demoApi.products.featured() : api.get("/products/featured"),
  create: (data: Record<string, unknown>) => api.post("/products/", data),
  update: (id: number, data: Record<string, unknown>) =>
    api.patch(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  myProducts: (params?: Record<string, unknown>) =>
    api.get("/products/seller/my", { params }),
  uploadFile: (id: number, file: File, isPreview = false) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/products/${id}/files?is_preview=${isPreview}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  downloadFile: (productId: number, fileId: number) =>
    api.get(`/products/${productId}/files/${fileId}/download`),
};

// Categories
export const categoriesApi = {
  list: () => (DEMO_MODE ? demoApi.categories.list() : api.get("/categories/")),
  get: (slug: string) =>
    DEMO_MODE ? demoApi.categories.get(slug) : api.get(`/categories/${slug}`),
};

// Orders
export const ordersApi = {
  create: (product_ids: number[]) => api.post("/orders/", { product_ids }),
  list: (params?: Record<string, unknown>) => api.get("/orders/", { params }),
  get: (id: number) => api.get(`/orders/${id}`),
};

// Reviews
export const reviewsApi = {
  getForProduct: (productId: number, params?: Record<string, unknown>) =>
    DEMO_MODE ? demoApi.reviews.getForProduct(productId) : api.get(`/reviews/product/${productId}`, { params }),
  create: (productId: number, data: { rating: number; comment?: string }) =>
    api.post(`/reviews/product/${productId}`, data),
  delete: (id: number) => api.delete(`/reviews/${id}`),
};

// Favorites
export const favoritesApi = {
  list: (params?: Record<string, unknown>) =>
    api.get("/favorites/", { params }),
  add: (productId: number) => api.post(`/favorites/${productId}`),
  remove: (productId: number) => api.delete(`/favorites/${productId}`),
};

// Notifications
export const notificationsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get("/notifications/", { params }),
  unreadCount: () => api.get("/notifications/unread-count"),
  markRead: (id: number) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post("/notifications/read-all"),
};

// Seller
export const sellerApi = {
  stats: () => api.get("/seller/stats"),
  topProducts: () => api.get("/seller/top-products"),
};

// Admin
export const adminApi = {
  stats: () => api.get("/admin/stats"),
  users: (params?: Record<string, unknown>) =>
    api.get("/admin/users", { params }),
  updateUserRole: (id: number, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),
  toggleUserActive: (id: number) =>
    api.patch(`/admin/users/${id}/toggle-active`),
  products: (params?: Record<string, unknown>) =>
    api.get("/admin/products", { params }),
  toggleFeatured: (id: number) =>
    api.patch(`/admin/products/${id}/toggle-featured`),
  deleteReview: (id: number) => api.delete(`/admin/reviews/${id}`),
};
