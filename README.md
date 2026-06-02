# GeekMarket — Маркетплейс цифровых продуктов

Production-ready маркетплейс для продажи цифровых продуктов: Telegram-боты, Mini Apps, UI Kits, SaaS-стартеры, шаблоны и многое другое.

---

## Скриншоты интерфейса

| Главная страница | Каталог | Карточка товара |
|---|---|---|
| Hero с анимацией, категории, популярные товары | Фильтры, сортировка, поиск, пагинация | Галерея, описание, отзывы, скачивание |

| Корзина | Кабинет продавца | Админ-панель |
|---|---|---|
| Управление товарами, оформление | Статистика, графики Recharts | CRUD пользователей, товары, отзывы |

---

## Архитектура проекта

```
geekmarket/
├── frontend/          # Next.js 15 (App Router)
│   └── src/
│       ├── app/       # Страницы и layout'ы
│       ├── components/# Переиспользуемые компоненты
│       ├── lib/       # API-клиент, утилиты
│       ├── stores/    # Zustand (auth, cart)
│       └── types/     # TypeScript-типы
├── backend/           # FastAPI
│   └── app/
│       ├── api/       # REST-роутеры v1
│       ├── core/      # Конфигурация, БД, безопасность
│       ├── models/    # SQLAlchemy 2.0 модели
│       ├── schemas/   # Pydantic v2 схемы
│       ├── repositories/ # Паттерн Repository
│       └── services/  # Бизнес-логика (Service Layer)
├── nginx/             # Reverse proxy конфиг
└── docker-compose.yml # Оркестрация контейнеров
```

### Паттерны архитектуры

```
HTTP Request
    ↓
API Router (FastAPI)
    ↓
Service Layer (бизнес-логика, валидация)
    ↓
Repository Layer (абстракция над БД)
    ↓
SQLAlchemy Models → PostgreSQL
```

---

## ER-диаграмма базы данных

```
users
 ├── id (PK)
 ├── email (UNIQUE)
 ├── username (UNIQUE)
 ├── password_hash
 ├── role: buyer | seller | admin
 ├── full_name, bio, avatar_url
 └── is_active, is_verified, created_at

categories
 ├── id (PK)
 ├── title, slug (UNIQUE)
 ├── description, icon, color
 └── sort_order

products
 ├── id (PK)
 ├── seller_id → users.id
 ├── category_id → categories.id
 ├── title, short_description, description
 ├── price, preview_url
 ├── rating, reviews_count, sales_count, views_count
 ├── technologies, version
 ├── is_published, is_featured
 └── search_vector (TSVECTOR для FTS)

product_files
 ├── id (PK)
 ├── product_id → products.id
 ├── file_url, file_name, file_type
 └── file_size, is_preview

product_tags
 ├── id (PK)
 ├── product_id → products.id
 └── tag

orders
 ├── id (PK)
 ├── user_id → users.id
 ├── total_price
 └── status: pending | completed | refunded | cancelled

order_items
 ├── id (PK)
 ├── order_id → orders.id
 ├── product_id → products.id
 └── price

reviews
 ├── id (PK)
 ├── user_id → users.id
 ├── product_id → products.id
 ├── rating (1-5)
 └── comment

favorites
 ├── id (PK)
 ├── user_id → users.id
 └── product_id → products.id

notifications
 ├── id (PK)
 ├── user_id → users.id
 ├── title, message, type
 └── is_read
```

---

## API

### Аутентификация

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/v1/auth/register` | Регистрация |
| POST | `/v1/auth/login` | Вход (JWT) |
| POST | `/v1/auth/refresh` | Обновление токенов |

### Продукты

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| GET | `/v1/products/` | Каталог с фильтрами | Все |
| GET | `/v1/products/popular` | Популярные | Все |
| GET | `/v1/products/featured` | Топ-товары | Все |
| GET | `/v1/products/{id}` | Карточка товара | Все |
| POST | `/v1/products/` | Создать товар | Продавец |
| PATCH | `/v1/products/{id}` | Обновить товар | Продавец |
| DELETE | `/v1/products/{id}` | Удалить товар | Продавец |
| POST | `/v1/products/{id}/files` | Загрузить файл | Продавец |
| GET | `/v1/products/{id}/files/{file_id}/download` | Скачать файл | Покупатель |

### Пользователи

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/v1/users/me` | Мой профиль |
| PATCH | `/v1/users/me` | Обновить профиль |
| POST | `/v1/users/me/avatar` | Загрузить аватар |
| POST | `/v1/users/me/password` | Сменить пароль |

### Заказы, Отзывы, Избранное

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/v1/orders/` | Оформить заказ |
| GET | `/v1/orders/` | Мои заказы |
| GET | `/v1/reviews/product/{id}` | Отзывы к товару |
| POST | `/v1/reviews/product/{id}` | Оставить отзыв |
| GET | `/v1/favorites/` | Избранное |
| POST | `/v1/favorites/{product_id}` | В избранное |

### Продавец / Аналитика

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/v1/seller/stats` | Статистика продаж |
| GET | `/v1/seller/top-products` | Топ товаров |

### Администратор

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/v1/admin/stats` | Статистика платформы |
| GET | `/v1/admin/users` | Все пользователи |
| PATCH | `/v1/admin/users/{id}/role` | Изменить роль |
| PATCH | `/v1/admin/users/{id}/toggle-active` | Блокировка |
| PATCH | `/v1/admin/products/{id}/toggle-featured` | Топ-товар |

Полная Swagger-документация: `http://localhost/api/docs`

---

## Технологический стек

### Backend
- **FastAPI** — async Python web framework
- **SQLAlchemy 2.0** — ORM с поддержкой async
- **Alembic** — миграции БД
- **PostgreSQL** — основная БД + Full Text Search
- **Redis** — кеширование, refresh tokens
- **MinIO** — S3-совместимое хранилище файлов
- **Passlib + bcrypt** — хеширование паролей
- **python-jose** — JWT токены
- **slowapi** — rate limiting

### Frontend
- **Next.js 15** — App Router, SSR/CSR
- **TypeScript** — статическая типизация
- **Tailwind CSS** — утилитарный CSS
- **Shadcn UI** — компоненты
- **TanStack Query v5** — Server State управление
- **Zustand** — Client State (auth, cart)
- **React Hook Form + Zod** — формы и валидация
- **Recharts** — графики аналитики
- **Framer Motion** — анимации
- **react-hot-toast** — уведомления

### Инфраструктура
- **Docker + Docker Compose** — контейнеризация
- **Nginx** — reverse proxy, gzip, SSL

---

## Быстрый старт

### Требования
- Docker 24+
- Docker Compose v2

### Запуск

```bash
# 1. Клонировать и перейти в директорию
git clone <repo-url> geekmarket
cd geekmarket

# 2. Скопировать переменные окружения
cp .env.example .env

# 3. Запустить все сервисы одной командой
docker compose up -d

# 4. Подождать ~30 секунд (БД + миграции + seed)
# Проверить логи:
docker compose logs -f backend
```

После запуска:
| Сервис | URL |
|--------|-----|
| **Веб-приложение** | http://localhost |
| **API Swagger** | http://localhost/api/docs |
| **MinIO Console** | http://localhost:9001 |

### Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@geekmarket.dev | admin123 |
| Продавец | seller1@geekmarket.dev | seller123 |
| Покупатель | user1@example.com | user123 |

---

## Переменные окружения

```env
# База данных
POSTGRES_USER=geekmarket
POSTGRES_PASSWORD=geekmarket_secret
POSTGRES_DB=geekmarket

# Redis
REDIS_PASSWORD=redis_secret

# MinIO (S3)
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin_secret
MINIO_BUCKET=geekmarket

# Безопасность (обязательно сменить в production!)
SECRET_KEY=your-super-secret-key-min-32-chars

# Frontend
NEXT_PUBLIC_API_URL=http://localhost/api

# SMTP (опционально)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=your_app_password
```

---

## Локальная разработка

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Запуск БД через Docker
docker compose up -d postgres redis minio

# Применить миграции
alembic upgrade head

# Запустить seed
python scripts/seed.py

# Запуск сервера
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Скопировать env
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Запустить dev-сервер
npm run dev
```

---

## Контейнеры Docker

| Контейнер | Порт | Описание |
|-----------|------|----------|
| `geekmarket_nginx` | 80, 443 | Reverse proxy |
| `geekmarket_frontend` | 3000 | Next.js app |
| `geekmarket_backend` | 8000 | FastAPI app |
| `geekmarket_postgres` | 5432 | База данных |
| `geekmarket_redis` | 6379 | Кеш |
| `geekmarket_minio` | 9000, 9001 | Файловое хранилище |

### Полезные команды

```bash
# Просмотр логов
docker compose logs -f backend
docker compose logs -f frontend

# Перезапуск сервиса
docker compose restart backend

# Подключиться к БД
docker compose exec postgres psql -U geekmarket

# Запустить seed заново
docker compose exec backend python scripts/seed.py

# Остановить всё
docker compose down

# Полная очистка (включая volumes!)
docker compose down -v
```

---

## Безопасность

- **JWT Auth** — Access Token (30 мин) + Refresh Token (30 дней) с ротацией
- **bcrypt** — хеширование паролей
- **Rate Limiting** — 60 запросов/минуту (slowapi)
- **CORS** — настроен только для разрешённых origin
- **SQL Injection** — защита через ORM (SQLAlchemy)
- **XSS** — Content-Security-Policy в Nginx
- **Presigned URLs** — файлы доступны по временным ссылкам (1 час)
- **Role-based access** — Buyer / Seller / Admin

---

## Seed данные

После запуска автоматически создаются:
- **1 администратор**
- **5 продавцов**
- **15 покупателей**
- **28 товаров** в 8 категориях
- **100+ отзывов** с рейтингами
- **Заказы** для всех покупателей
- **Избранное** для нескольких покупателей
