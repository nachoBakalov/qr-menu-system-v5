# QR Menu System V5 🍽️

Пълна система за управление на QR менюта за ресторанти с React frontend и Node.js backend.

## 📋 Особености

- 🏪 **Client Management** - Управление на ресторанти и заведения
- 🍽️ **Menu Management** - Създаване и управление на менюта
- 📂 **Category Management** - Категоризация на продукти с подреждане
- 🥘 **MenuItem Management** - Детайлни продукти с цени, алергени, addons
- 🎨 **Template System** - Готови шаблони за различни типове заведения  
- 📱 **QR Code Generation** - Автоматично генериране на QR кодове
- 🌐 **Public API** - Публични endpoints за достъп без автентикация

## 🛠️ Технологии

### Backend
- **Node.js** + **Express** - REST API сървър
- **TypeScript** - Типизиран JavaScript
- **PostgreSQL** - Релационна база данни
- **Prisma ORM** - База данни ORM и миграции
- **JWT** - JSON Web Tokens за автентикация
- **Joi** - Валидация на входни данни
- **bcrypt** - Хеширане на пароли
- **QRCode** - Генериране на QR кодове

### Database Schema
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   clients   │────│    menus     │────│ categories  │
│             │    │              │    │             │
└─────────────┘    └──────────────┘    └─────────────┘
                           │                     │
                           │            ┌─────────────┐
                           └────────────│ menu_items  │
                                        │             │
                                        └─────────────┘
```

## 🚀 Инсталация и стартиране

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### Backend Setup

1. **Clone репозиторито**
```bash
git clone <repo-url>
cd QR_Code_Menu/V5/backend
```

2. **Инсталирай зависимости**
```bash
npm install
```

3. **Настрой базата данни**
```bash
# Копирай .env файла
cp .env.example .env

# Редактирай .env файла с твоите PostgreSQL настройки
DATABASE_URL="postgresql://username:password@localhost:5432/menu_app"
JWT_SECRET="your-jwt-secret-key"
NODE_ENV="development"
PORT=5000
```

4. **Прилагане на Prisma схемата**
```bash
npx prisma db push
npx prisma generate
```

5. **Стартирай сървъра**
```bash
npm run dev
```

Сървърът ще стартира на http://localhost:5000

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Client Management  
- `GET /api/clients` - Списък с клиенти (с pagination)
- `POST /api/clients` - Създаване на нов клиент
- `GET /api/clients/:id` - Детайли за клиент
- `PUT /api/clients/:id` - Актуализиране на клиент
- `DELETE /api/clients/:id` - Изтриване на клиент
- `GET /api/clients/slug/:slug` - Публичен достъп по slug

### Menu Management
- `GET /api/menus` - Списък с менюта
- `POST /api/menus` - Създаване на ново меню
- `GET /api/menus/:id` - Детайли за меню
- `PUT /api/menus/:id` - Актуализиране на меню
- `DELETE /api/menus/:id` - Изтриване на меню
- `POST /api/menus/:id/publish` - Публикуване на меню
- `POST /api/menus/:id/unpublish` - Скриване на меню

### Category Management
- `GET /api/categories` - Списък с категории
- `POST /api/categories` - Създаване на нова категория
- `GET /api/categories/:id` - Детайли за категория
- `PUT /api/categories/:id` - Актуализиране на категория  
- `DELETE /api/categories/:id` - Изтриване на категория
- `PUT /api/categories/:id/reorder` - Пренареждане на категории

### MenuItem Management
- `GET /api/menu-items` - Списък с продукти (с филтри)
- `POST /api/menu-items` - Създаване на нов продукт
- `GET /api/menu-items/:id` - Детайли за продукт
- `PUT /api/menu-items/:id` - Актуализиране на продукт
- `DELETE /api/menu-items/:id` - Изтриване на продукт
- `POST /api/menu-items/:id/toggle-availability` - Включване/изключване

### Template System
- `GET /api/templates` - Списък с шаблони
- `POST /api/templates` - Създаване на нов шаблон
- `GET /api/templates/:id` - Детайли за шаблон
- `PUT /api/templates/:id` - Актуализиране на шаблон
- `DELETE /api/templates/:id` - Изтриване на шаблон

### Public API (без автентикация)
- `GET /api/public/menu/:slug` - Пълно меню по client slug
- `GET /api/public/menu/:clientSlug/details` - Детайли за меню
- `GET /api/public/menu/:clientSlug/categories` - Категории на меню
- `GET /api/public/menu/:clientSlug/categories/:categoryId/items` - Продукти по категория

### QR Code System
- `POST /api/public/qr-code/:clientId/generate` - Генериране на QR код
- `GET /api/public/qr-code/:clientId` - Вземане на съществуващ QR код

## 💾 Database Models

### Client (Ресторант)
```typescript
{
  id: string
  name: string
  slug: string (unique)
  description?: string
  address?: string  
  phone?: string
  logo?: string
  slogan?: string
  socialMedia?: json
  active: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Menu
```typescript
{
  id: string
  name: string
  active: boolean
  published: boolean
  qrCode?: string
  clientId: string
  templateId?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Category
```typescript
{
  id: string
  name: string
  description?: string
  image?: string
  order: number
  active: boolean
  menuId: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### MenuItem
```typescript
{
  id: string
  name: string
  description?: string
  priceBGN: Decimal
  priceEUR: Decimal
  weight?: number
  weightUnit?: string
  image?: string
  tags: string[]
  allergens: string[]
  addons?: json
  available: boolean
  order: number
  categoryId: string
  menuId: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 🔧 Развитие

### Добавяне на нова функционалност
1. Създай Prisma модел в `prisma/schema.prisma`
2. Генерирай миграция: `npx prisma db push`
3. Създай controller в `src/controllers/`
4. Добави routes в `src/routes/`
5. Добави валидация в `src/utils/validation.ts`

### Testing
```bash
# Unit тестове
npm test

# E2E тестове  
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📱 QR Code Usage

Всеки ресторант получава уникален QR код, който при сканиране отваря:
`https://yourapp.com/menu/{restaurant-slug}`

QR кодовете се генерират автоматично и се съхраняват в `/uploads/qr-codes/`

## 🛡️ Сигурност

- JWT токени за автентикация
- bcrypt за хеширане на пароли  
- Joi валидация на всички входни данни
- Rate limiting за API endpoints
- CORS настройки
- Helmet за HTTP security headers

## 🚀 Deployment

### Производствени настройки
```bash
NODE_ENV=production
DATABASE_URL="postgresql://prod-connection"
JWT_SECRET="strong-production-secret"
PORT=3000
FRONTEND_URL="https://yourdomain.com"
```

### Docker (Опционално)
```bash
docker build -t qr-menu-backend .
docker run -p 3000:3000 qr-menu-backend
```

## 📄 Лиценз

MIT License - виж LICENSE файл за детайли.

---

Създадено с ❤️ за българските ресторанти 🇧🇬