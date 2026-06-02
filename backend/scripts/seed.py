"""Seed script — creates demo data."""
import asyncio
import random
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.product import Product, ProductTag
from app.models.order import Order, OrderItem, OrderStatus
from app.models.review import Review
from app.models.favorite import Favorite

engine = create_async_engine(settings.DATABASE_URL, echo=False)
Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

CATEGORIES = [
    {"title": "Telegram Боты", "slug": "telegram-bots", "icon": "Bot", "color": "#6366f1", "sort_order": 1,
     "description": "Готовые исходники Telegram-ботов"},
    {"title": "Mini Apps", "slug": "mini-apps", "icon": "Smartphone", "color": "#8b5cf6", "sort_order": 2,
     "description": "Telegram Mini Apps и WebApps"},
    {"title": "Шаблоны сайтов", "slug": "website-templates", "icon": "Layout", "color": "#06b6d4", "sort_order": 3,
     "description": "Готовые шаблоны для сайтов"},
    {"title": "UI Kits", "slug": "ui-kits", "icon": "Palette", "color": "#f59e0b", "sort_order": 4,
     "description": "Наборы UI-компонентов"},
    {"title": "SaaS Стартеры", "slug": "saas-starters", "icon": "Rocket", "color": "#22c55e", "sort_order": 5,
     "description": "Готовые SaaS-решения"},
    {"title": "API Проекты", "slug": "api-projects", "icon": "Code2", "color": "#ef4444", "sort_order": 6,
     "description": "FastAPI и REST API проекты"},
    {"title": "React Компоненты", "slug": "react-components", "icon": "Component", "color": "#3b82f6", "sort_order": 7,
     "description": "Готовые React-компоненты"},
    {"title": "Иконки", "slug": "icons", "icon": "Star", "color": "#ec4899", "sort_order": 8,
     "description": "Иконки и иконочные наборы"},
]

PRODUCTS_DATA = [
    # Telegram Bots
    {"title": "AI Telegram Бот на GPT-4", "short": "Умный бот с интеграцией ChatGPT для вашего канала",
     "desc": "Полноценный Telegram-бот с поддержкой ChatGPT-4. Включает: управление контекстом диалога, история разговоров, поддержка изображений, webhook и polling режимы, Docker-конфигурация, полная документация.",
     "price": 2990, "category": "telegram-bots", "tags": ["python", "aiogram", "openai", "docker"],
     "tech": "Python, aiogram 3.0, OpenAI API, PostgreSQL, Redis", "featured": True},
    {"title": "Бот для интернет-магазина", "short": "Telegram-бот с каталогом, корзиной и оплатой",
     "desc": "Готовый Telegram-бот для продаж. Каталог товаров, корзина, интеграция со Stripe и ЮKassa, уведомления, административная панель, статистика продаж.",
     "price": 4500, "category": "telegram-bots", "tags": ["python", "aiogram", "stripe", "payments"],
     "tech": "Python, aiogram, SQLite/PostgreSQL, Stripe API", "featured": True},
    {"title": "CRM-бот для менеджеров", "short": "Управление клиентами и сделками прямо в Telegram",
     "desc": "CRM-система в Telegram. Ведение клиентской базы, воронка продаж, напоминания, экспорт в Excel, командная работа с разграничением прав.",
     "price": 3500, "category": "telegram-bots", "tags": ["crm", "python", "business"],
     "tech": "Python, aiogram, SQLAlchemy, pandas"},
    {"title": "Бот-планировщик задач", "short": "GTD-система и трекер задач в Telegram",
     "desc": "Полноценный планировщик задач в Telegram. Создание задач, дедлайны, напоминания, категории, метки, статистика продуктивности, экспорт.",
     "price": 1990, "category": "telegram-bots", "tags": ["productivity", "tasks", "python"],
     "tech": "Python, aiogram, SQLite, APScheduler"},
    {"title": "Реферальный бот", "short": "Система рефералов с многоуровневой структурой",
     "desc": "Многоуровневая реферальная система в Telegram. Отслеживание приглашений, начисление бонусов, вывод средств, аналитика, интеграция с платёжными системами.",
     "price": 2500, "category": "telegram-bots", "tags": ["referral", "payments", "python"],
     "tech": "Python, aiogram, PostgreSQL, Redis"},

    # Mini Apps
    {"title": "Telegram Mini App — Маркетплейс", "short": "Полноценный магазин внутри Telegram",
     "desc": "Mini App для продажи цифровых и физических товаров внутри Telegram. Каталог, поиск, корзина, оплата Stars/крипто, личный кабинет, аналитика.",
     "price": 7900, "category": "mini-apps", "tags": ["react", "typescript", "telegram", "webapp"],
     "tech": "React, TypeScript, Tailwind CSS, Telegram Web App API", "featured": True},
    {"title": "Игровой Mini App", "short": "Кликер-игра с лидербордом и наградами",
     "desc": "Аддиктивная кликер-игра для Telegram. Персонажи, апгрейды, лидерборд, ежедневные задания, реферальная система, монетизация Stars.",
     "price": 5500, "category": "mini-apps", "tags": ["game", "react", "animations"],
     "tech": "React, Framer Motion, Telegram Stars API"},
    {"title": "Крипто-кошелёк Mini App", "short": "Управление TON/USDT прямо в Telegram",
     "desc": "Крипто-кошелёк для Telegram с поддержкой TON, USDT, NFT. История транзакций, QR-коды, мультиподпись, интеграция с TON Connect.",
     "price": 9900, "category": "mini-apps", "tags": ["crypto", "ton", "wallet"],
     "tech": "React, TON Connect, TonWeb, TypeScript", "featured": True},
    {"title": "Delivery Mini App", "short": "Приложение для доставки еды в Telegram",
     "desc": "Сервис доставки еды как Mini App. Меню ресторанов, корзина, отслеживание курьера на карте, история заказов, рейтинги.",
     "price": 6800, "category": "mini-apps", "tags": ["delivery", "maps", "react"],
     "tech": "React, Leaflet Maps, Telegram Web App"},

    # Website Templates
    {"title": "SaaS Landing — Dark Pro", "short": "Профессиональный лендинг для SaaS-продукта",
     "desc": "Современный лендинг для SaaS. Героя-блок, фичи, ценообразование, отзывы, FAQ, анимации на Framer Motion, адаптив, Tailwind CSS.",
     "price": 3200, "category": "website-templates", "tags": ["nextjs", "tailwind", "landing"],
     "tech": "Next.js 15, TypeScript, Tailwind CSS, Framer Motion", "featured": True},
    {"title": "Portfolio Template — Developer", "short": "Портфолио-сайт для разработчика",
     "desc": "Минималистичный тёмный портфолио. Анимированный хиро, раздел проектов с фильтрами, навыки, контакты. SEO-оптимизирован.",
     "price": 1500, "category": "website-templates", "tags": ["portfolio", "nextjs", "dark-theme"],
     "tech": "Next.js, TypeScript, Framer Motion"},
    {"title": "E-commerce Starter", "short": "Полноценный интернет-магазин на Next.js",
     "desc": "E-commerce шаблон с каталогом, фильтрами, корзиной, авторизацией, Stripe-оплатой, панелью управления.",
     "price": 8900, "category": "website-templates", "tags": ["ecommerce", "stripe", "nextjs"],
     "tech": "Next.js, Prisma, Stripe, NextAuth, PostgreSQL", "featured": True},
    {"title": "Agency Website", "short": "Сайт для digital-агентства",
     "desc": "Представительский сайт для агентства. Анимированный хиро, кейсы, команда, блог, форма заявки, карта офиса.",
     "price": 2200, "category": "website-templates", "tags": ["agency", "animations", "blog"],
     "tech": "Next.js, Framer Motion, Sanity CMS"},

    # UI Kits
    {"title": "Dashboard UI Kit — Dark", "short": "50+ компонентов для дашборда в тёмной теме",
     "desc": "Профессиональный UI-кит для административных панелей. 50+ компонентов: графики, таблицы, формы, навигация, карточки. Figma + React.",
     "price": 4900, "category": "ui-kits", "tags": ["figma", "react", "dashboard", "dark-theme"],
     "tech": "Figma, React, Recharts, Tailwind CSS", "featured": True},
    {"title": "Mobile App UI Kit", "short": "iOS/Android дизайн-система в Figma",
     "desc": "Полная дизайн-система для мобильных приложений. 200+ компонентов, 10 готовых экранов, тёмная и светлая темы, Auto Layout.",
     "price": 3800, "category": "ui-kits", "tags": ["figma", "mobile", "ios", "android"],
     "tech": "Figma, Auto Layout, Variables"},
    {"title": "SaaS Component Library", "short": "Библиотека React-компонентов для SaaS",
     "desc": "Готовая библиотека компонентов: аутентификация, биллинг, настройки, аналитика. Storybook, тесты, Tailwind.",
     "price": 6500, "category": "ui-kits", "tags": ["react", "components", "storybook"],
     "tech": "React, TypeScript, Tailwind CSS, Storybook"},

    # SaaS Starters
    {"title": "Next.js SaaS Boilerplate", "short": "Полный стартер для SaaS на Next.js",
     "desc": "Production-ready SaaS стартер. Авторизация (email, Google, GitHub), биллинг Stripe, командные аккаунты, дашборд, API, защита роутов, email-шаблоны.",
     "price": 12900, "category": "saas-starters", "tags": ["nextjs", "stripe", "auth", "saas"],
     "tech": "Next.js 15, NextAuth, Prisma, Stripe, PostgreSQL, Resend", "featured": True},
    {"title": "FastAPI SaaS Backend", "short": "Готовый backend для SaaS на FastAPI",
     "desc": "Полноценный SaaS-backend. JWT-авторизация, Stripe-биллинг, мультитенантность, rate limiting, S3-хранилище, Redis-кеш, документация.",
     "price": 9900, "category": "saas-starters", "tags": ["fastapi", "python", "stripe", "backend"],
     "tech": "FastAPI, SQLAlchemy, Stripe, Redis, MinIO", "featured": True},
    {"title": "AI SaaS Starter", "short": "SaaS стартер с AI-функциональностью",
     "desc": "SaaS с AI. Интеграция OpenAI, векторная БД Pinecone, RAG-система, кредитная система, биллинг по токенам.",
     "price": 14900, "category": "saas-starters", "tags": ["ai", "openai", "saas", "nextjs"],
     "tech": "Next.js, OpenAI, Pinecone, Stripe, PostgreSQL"},

    # API Projects
    {"title": "REST API Boilerplate — FastAPI", "short": "Production-ready API на FastAPI",
     "desc": "Чистая архитектура FastAPI. Repository pattern, Service layer, JWT auth, Rate limiting, Swagger docs, Docker, тесты pytest.",
     "price": 3900, "category": "api-projects", "tags": ["fastapi", "python", "api", "docker"],
     "tech": "FastAPI, SQLAlchemy 2.0, Alembic, Redis, Docker"},
    {"title": "GraphQL API — Strawberry", "short": "GraphQL API на Python с Strawberry",
     "desc": "GraphQL backend на FastAPI + Strawberry. Subscriptions, DataLoader, авторизация, пагинация, кеширование.",
     "price": 4500, "category": "api-projects", "tags": ["graphql", "python", "strawberry"],
     "tech": "FastAPI, Strawberry, SQLAlchemy, Redis"},
    {"title": "Webhook Service", "short": "Сервис обработки вебхуков с retry",
     "desc": "Надёжный webhook-сервис. Очереди, повторные попытки, подписи HMAC, логирование, дашборд мониторинга.",
     "price": 2800, "category": "api-projects", "tags": ["webhooks", "fastapi", "celery"],
     "tech": "FastAPI, Celery, Redis, PostgreSQL"},

    # React Components
    {"title": "Data Table Pro", "short": "Мощная таблица с сортировкой и фильтрами",
     "desc": "React-компонент таблицы. Сортировка, фильтрация, пагинация, поиск, экспорт CSV/Excel, выбор строк, виртуализация.",
     "price": 1800, "category": "react-components", "tags": ["react", "table", "typescript"],
     "tech": "React, TypeScript, TanStack Table, Tailwind"},
    {"title": "Rich Text Editor", "short": "WYSIWYG редактор на основе Tiptap",
     "desc": "Полнофункциональный редактор. Форматирование, списки, таблицы, изображения, ссылки, история, Markdown.",
     "price": 2100, "category": "react-components", "tags": ["editor", "tiptap", "react"],
     "tech": "React, Tiptap, TypeScript"},
    {"title": "Chart Component Pack", "short": "10 готовых графиков для дашборда",
     "desc": "Набор из 10 компонентов графиков. Линейные, столбчатые, круговые, тепловые карты, анимации, кастомизация.",
     "price": 1500, "category": "react-components", "tags": ["charts", "recharts", "react"],
     "tech": "React, Recharts, TypeScript, Tailwind"},

    # Icons
    {"title": "Dev Icon Pack — 500 SVG", "short": "500 иконок для разработчиков в SVG",
     "desc": "Набор из 500 уникальных SVG-иконок для IT-тематики. Языки программирования, фреймворки, инструменты, сервисы. SVG, PNG, Figma.",
     "price": 990, "category": "icons", "tags": ["icons", "svg", "figma"],
     "tech": "SVG, PNG, Figma"},
    {"title": "Crypto Icon Set", "short": "300 иконок криптовалют в цвете",
     "desc": "Цветные иконки всех популярных криптовалют и блокчейнов. 300 иконок, SVG + PNG, тёмный и светлый варианты.",
     "price": 790, "category": "icons", "tags": ["crypto", "icons", "blockchain"],
     "tech": "SVG, PNG"},
    {"title": "UI Icon Library — Outline", "short": "1000+ outline иконок для интерфейсов",
     "desc": "Большая библиотека outline-иконок. 1000+ иконок в 24px и 32px, React-компоненты, Figma-файл, поиск.",
     "price": 1200, "category": "icons", "tags": ["icons", "ui", "react", "figma"],
     "tech": "SVG, React, Figma", "featured": True},
]

REVIEW_TEXTS = [
    "Отличный продукт, всё работает из коробки! Документация чёткая.",
    "Купил неделю назад — уже в продакшне. Код чистый, архитектура продуманная.",
    "За эти деньги — просто огонь. Рекомендую всем.",
    "Поддержка ответила быстро, помогла с настройкой. 5 из 5!",
    "Использую в коммерческом проекте. Всё работает стабильно.",
    "Отличная основа для старта. Сэкономил несколько недель разработки.",
    "Хороший код, следует современным практикам. Docker-конфиг настроен правильно.",
    "Немного пришлось допиливать под свой стек, но основа крепкая.",
    "Шикарно! Всё, что нужно, уже сделано.",
    "Купил для клиентского проекта. Заказчик доволен, я тоже.",
]


async def seed():
    async with Session() as db:
        from sqlalchemy import select

        # Check if already seeded
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded, skipping.")
            return

        # Create categories
        cats = {}
        for cat_data in CATEGORIES:
            cat = Category(**cat_data)
            db.add(cat)
            await db.flush()
            cats[cat_data["slug"]] = cat
        print(f"Created {len(cats)} categories")

        # Create users
        admin = User(
            email="admin@geekmarket.dev",
            username="admin",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            full_name="Administrator",
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        await db.flush()

        sellers = []
        for i in range(1, 6):
            seller = User(
                email=f"seller{i}@geekmarket.dev",
                username=f"seller{i}",
                password_hash=get_password_hash("seller123"),
                role=UserRole.SELLER,
                full_name=f"Seller {i}",
                bio=f"Professional developer with {5 + i} years of experience",
                is_active=True,
                is_verified=True,
            )
            db.add(seller)
            await db.flush()
            sellers.append(seller)

        buyers = []
        for i in range(1, 16):
            buyer = User(
                email=f"user{i}@example.com",
                username=f"user{i}",
                password_hash=get_password_hash("user123"),
                role=UserRole.BUYER,
                full_name=f"User {i}",
                is_active=True,
                is_verified=True,
            )
            db.add(buyer)
            await db.flush()
            buyers.append(buyer)

        print(f"Created {1 + len(sellers) + len(buyers)} users")

        # Create products
        products = []
        for idx, p_data in enumerate(PRODUCTS_DATA):
            seller = sellers[idx % len(sellers)]
            category = cats[p_data["category"]]
            product = Product(
                seller_id=seller.id,
                category_id=category.id,
                title=p_data["title"],
                short_description=p_data["short"],
                description=p_data["desc"],
                price=p_data["price"],
                technologies=p_data.get("tech"),
                is_featured=p_data.get("featured", False),
                sales_count=random.randint(5, 200),
                views_count=random.randint(100, 5000),
                rating=round(random.uniform(3.5, 5.0), 2),
                is_published=True,
            )
            db.add(product)
            await db.flush()

            for tag in p_data.get("tags", []):
                db.add(ProductTag(product_id=product.id, tag=tag))

            products.append(product)

        await db.flush()
        print(f"Created {len(products)} products")

        # Create orders and reviews (distribute 100 reviews across products)
        review_count = 0
        purchased_pairs: set = set()

        # Each buyer purchases 3-7 random products
        for buyer in buyers:
            num_products = random.randint(3, 7)
            chosen = random.sample(products, min(num_products, len(products)))
            total = sum(float(p.price) for p in chosen)
            order = Order(user_id=buyer.id, total_price=total, status=OrderStatus.COMPLETED)
            db.add(order)
            await db.flush()

            for product in chosen:
                item = OrderItem(order_id=order.id, product_id=product.id, price=float(product.price))
                db.add(item)
                purchased_pairs.add((buyer.id, product.id))

        await db.flush()

        # Create up to 100 reviews from purchased pairs
        pairs_list = list(purchased_pairs)
        random.shuffle(pairs_list)
        for buyer_id, product_id in pairs_list[:100]:
            rating = random.randint(3, 5)
            comment = random.choice(REVIEW_TEXTS)
            review = Review(
                user_id=buyer_id,
                product_id=product_id,
                rating=rating,
                comment=comment,
            )
            db.add(review)
            review_count += 1

        await db.flush()
        print(f"Created {review_count} reviews")

        # Update product ratings
        from sqlalchemy import func as sqlfunc
        for product in products:
            result = await db.execute(
                select(sqlfunc.avg(Review.rating), sqlfunc.count(Review.id))
                .where(Review.product_id == product.id)
            )
            avg, count = result.one()
            if avg:
                product.rating = round(float(avg), 2)
                product.reviews_count = count

            # Update search vector (plain text for SQLite compatibility)
            product.search_vector = f"{product.title} {product.short_description} {product.description}"

        # Add some favorites
        for buyer in buyers[:5]:
            for product in random.sample(products, 5):
                fav = Favorite(user_id=buyer.id, product_id=product.id)
                db.add(fav)

        await db.commit()
        print("Seed completed successfully!")
        print("\nTest credentials:")
        print("  Admin:  admin@geekmarket.dev / admin123")
        print("  Seller: seller1@geekmarket.dev / seller123")
        print("  Buyer:  user1@example.com / user123")


if __name__ == "__main__":
    asyncio.run(seed())
