# QR Menu System V5 - AI Agent Instructions

## Проектна Структура и Контекст

### Обща цел
Система за управление на QR менюта за ресторанти и заведения. Един главен админ създава клиенти (ресторанти), менюта за всеки ресторант, добавя категории и продукти, и генерира QR кодове. Системата поддържа различни теми/темплейти за визуализация на менютата.

### Архитектура (V5 - текуща версия)
```
V5/
├── backend/           # Node.js + Express + Prisma + PostgreSQL
├── frontend-admin/    # React + TypeScript + Vite (админ панел)
└── [бъдещо] frontend-public/  # Публичен преглед на менютата
```

**ВАЖНО**: V4 е legacy версия, използва се само за референция на UI дизайна. Всички нови промени се правят в V5.

## Статус на разработката

### Завършено ✅
- **Backend**: Пълно API (auth, clients, menus, categories, menuItems, templates, publicAPI)  
- **Database**: Prisma схема с всички отношения (Client→Menu→Categories→MenuItems + Template система)
- **Frontend Dashboard**: Работещ login, dashboard страница
- **Frontend Clients**: Пълно CRUD управление на клиенти  
- **Frontend Menus**: Основна функционалност, но току-що поправено за templates

### Завършено в тази сесия ✅
- **Frontend Menus**: Поправено зареждане и създаване на менюта с реални темплейти
- **Frontend Categories**: Пълно CRUD управление с клиент-side филтриране  
- **Frontend MenuItems**: Пълно CRUD управление с dual currency, изображения, тегло, тагове
- **Frontend QR Codes**: Пълна функционалност за генериране, преглед и download на QR кодове

### V5 Admin панел е завършен ✅
Всички основни административни функции са имплементирани и работят:
- Dashboard със статистики
- Clients (ресторанти) управление
- Menus управление с темплейти
- Categories управление с филтриране
- MenuItems с цени, изображения, тегло, тагове
- QR Codes генериране и управление

### Следващи стъпки (по приоритет) 🔄
1. **Frontend Public** - публичен интерфейс за показване на менютата (port 3000)
2. **Image Upload функционалност** - вместо URL-и за изображения  
3. **Production deployment** - setup за production среда
4. **Mobile оптимизации** - responsive дизайн за публичния frontend

## Backend API Структура

### Автентикация
- `POST /api/auth/login` - админ login (email/password)
- JWT token в localStorage за всички protected routes

### Основни ресурси
- `GET/POST/PUT/DELETE /api/clients` - ресторанти/заведения
- `GET/POST/PUT/DELETE /api/menus` - менюта (1 на клиент)  
- `GET/POST/PUT/DELETE /api/categories` - категории в менютата
- `GET/POST/PUT/DELETE /api/menu-items` - продукти в категориите
- `GET /api/templates` - темплейти за дизайн на менютата (само четене от frontend)

### Публично API (без auth)
- `GET /api/public/menu/:slug` - пълно меню за клиент по slug
- `GET /api/public/qr-code/:id` - генериране и get на QR код за клиент

### QR Code система
- `qrcode` пакет за генериране на QR изображения
- Статично съхранение в `/backend/uploads/qr-codes/`
- Dual endpoint structure: 
  - Admin: `/api/public/qr-code/:id` (с authentication)
  - Public: `/qr/:clientSlug` (без authentication за крайните потребители)

## Frontend Архитектура

### Технологии
- **React 18** + **TypeScript** + **Vite**
- **TanStack Query** (React Query) за API calls  
- **React Router** за навигация
- **Context API** за auth state

### Структура на файловете
```
src/
├── components/        # UI компоненти (Modal, MenuForm, etc.)
├── contexts/         # AuthContext за authentication
├── pages/           # Главни страници (DashboardPage, ClientsPage, etc.)  
├── services/        # API услуги (authService, clientService, etc.)
├── types/           # TypeScript типове (api.ts)
└── styles/          # CSS/SCSS файлове
```

### Типове и API
- Всички API отговори са обвити в `ApiResponse<T>` 
- List responses имат `data: T[]` и `pagination` поля
- Services връщат директно `response.data` от axios

**Пример структура:**
```typescript
// API отговор: { success: true, data: ClientListResponse }
// ClientListResponse: { data: Client[], pagination: {...} }  
// Frontend: clientsData.data.data = Client[]
```

## Решени Проблеми

### 1. Template Error Fix ✅  
**Проблем**: "Темплейтът не е намерен" при създаване на меню
**Причина**: MenuForm използваше mock темплейти (id: 1,2) вместо реални от API
**Решение**: 
- Създаден `templateService` за зареждане от `/api/templates`
- Обновен `MenuForm` да използва реални темплейти от API
- Поправени типове за правилно извличане на данните

### 2. Menu Display Issue ✅
**Проблем**: Създадени менюта не се показваха веднага в списъка
**Причина**: API response структура не се обработваше правилно
**Решение**:
- Поправена обработка на API response в MenusPage
- Добавена правилна query invalidation след създаване/редактиране
- Client-side данни се обновяват веднага след операции

### 3. Categories Filtering Issue ✅
**Проблем**: Backend филтриране по menuId не работеше поради string/number conversion
**Причина**: Query параметри се подават като string, но backend очаква numbers
**Решение**:
- Внедрена client-side филтриране в CategoriesPage
- Зареждат се всички категории и се филтрират локално по избраното меню
- По-бърза и по-надеждна user experience

### 4. MenuItems Weight Unit Validation ✅
**Проблем**: "Валидационна грешка: weightUnit must be one of [g, ml]"
**Причина**: Frontend изпращаше български стойности ('гр', 'кг', 'мл', 'л') вместо английски
**Решение**:
- Променени select options да използват 'g' и 'ml' (backend expected values)
- Дефолтна стойност променена от 'гр' на 'g'
- В таблицата се показват българи названия: g→"гр", ml→"мл"

### 5. MenuItems Price Display TypeError ✅
**Проблем**: "item.priceBGN.toFixed is not a function"
**Причина**: Backend връща цените като strings, но .toFixed() работи само с numbers
**Решение**:
- Добавена Number() конверсия: `Number(item.priceBGN).toFixed(2)`
- Приложено за BGN и EUR цените в таблицата

### 6. MenuItems Image Field Implementation ✅
**Проблем**: Липсва поддръжка за изображения на продукти
**Решение**:
- Добавено image URL поле в MenuItemForm
- URL валидация за правилни image links
- Thumbnail preview в таблицата (50x50px)
- Error fallback при липсващи/невалидни изображения

### 7. QR Codes Authentication Context Issues ✅
**Проблем**: "useAuth must be used within an AuthProvider" грешки
**Причина**: Hot Module Replacement и context provider setup problems
**Решение**:
- Добавен debug logging в AuthContext.tsx
- Поправен App.tsx routing за QRCodesPage
- Корректен AuthProvider wrapper за всички protected компоненти

### 8. QR API Double URL Issues ✅
**Проблем**: API calls към `/api/api/public/qr-code/` (double /api)
**Причина**: Base URL `/api` се комбинираше погрешно с endpoint `/api/public`
**Решение**:
- Поправени API endpoints от `/api/public/qr-code` на `/public/qr-code`
- Корректна URL структура: `http://localhost:5000/api/public/qr-code/:id`

### 9. QR Image Display Path Problems ✅
**Проблем**: Изображения не се показваха поради undefined VITE_API_BASE_URL
**Решение**:
- Заменен undefined environment variable с hardcoded `http://localhost:5000`
- Пълни URL-и за статични файлове: `http://localhost:5000/uploads/qr-codes/filename.png`
- Добавен error handling за липсващи QR файлове

## Development Workflows

### Backend Development
```bash
cd V5/backend
npm run dev              # Dev server с hot reload  
npm run db-push         # Прилага schema промени
npx prisma studio       # Database GUI
npm run prisma:seed     # Зарежда началните данни (admin user + templates)
```

### Frontend Development  
```bash
cd V5/frontend-admin
npm run dev            # Vite dev server (обикновено на port 5173)
```

## Важни Конвенции

### Database Patterns
- **Slug-based public access**: Клиентите имат уникални slug-ове за публичен достъп
- **Dual currency**: Всички продукти имат priceBGN и priceEUR  
- **Order management**: Categories и MenuItems имат `order` поле за сортиране
- **One Menu per Client**: Всеки клиент има точно едно меню

### Code Patterns
```typescript
// Backend Controller pattern
const controllerFunction = asyncHandler(async (req: Request, res: Response) => {
  // Joi validation
  // Prisma operations  
  // Response: { success: true, data: result, message?: string }
});

// Frontend Service pattern  
const serviceFunction = async (params) => {
  const response = await apiClient.get<ResponseType>(`/endpoint`);
  return response.data; // Връща директно data частта
};
```

### UI/UX Patterns
- Modal dialogs за Create/Edit forms
- Pagination за списъци  
- Loading states за async операции
- Error handling с съобщения на български език

## Забележки за AI Agents

### Когато работиш с този проект:
1. **Винаги работи с V5**, V4 е само за референция
2. **Backend не се променя** - API-то е готово и работи
3. **Фокус върху frontend-admin** - довършване на останалите табове  
4. **Следвай съществуващите patterns** - погледни ClientsPage за референция
5. **Български език** в коментари и UI текстове
6. **TypeScript типове** - използвай съществуващите в `types/api.ts`

### За нови страници/компоненти:
- Копирай структурата от `ClientsPage.tsx`
- Използвай TanStack Query за API calls  
- Следвай naming convention: `EntityPage.tsx`, `EntityForm.tsx`
- Добави service в `services/` директорията
- Обнови `services/index.ts` експортите

## Внедрени Страници и Функционалности

### CategoriesPage.tsx ✅
**Функционалност**: Пълно CRUD управление на категории в менютата
**Ключови особености**:
- Client-side филтриране по избрано меню (заради backend parameter issues)
- Modal форма за създаване/редактиране  
- Drag & drop order management (order поле)
- Active/inactive toggle за категории
- Image URL поддръжка за категорийни икони
- Изтриване с потвърждение

**Patterns използвани**:
- TanStack Query за API state management
- useQuery за данни, useMutation за операции
- Client-side филтриране: `categories.filter(cat => cat.menuId === selectedMenu)`  
- Invalidation pattern: `queryClient.invalidateQueries({ queryKey: ['categories'] })`

### MenuItemsPage.tsx ✅
**Функционалност**: Пълно CRUD управление на продукти в менютата
**Ключови особености**:
- **Dual Currency**: BGN и EUR цени с автоматично форматиране
- **Weight Management**: Тегло + единица (g/ml само) с правилна backend validation
- **Image Support**: URL поле с thumbnail preview в таблицата (50x50px)
- **Tags & Allergens**: CSV input format ("tag1, tag2, tag3")  
- **Cascade Filtering**: Меню → Категории (клиент-side)
- **Availability Toggle**: Active/inactive продукти
- **Order Management**: Пореден номер за сортиране

**Advanced Form Features**:
- URL validation за image полето
- Number conversion за цени (backend връща strings)
- Conditional weight unit validation (само когато има тегло)
- Real-time category filtering based на избраното меню
- Error handling с български съобщения

**Table Features**:
- Thumbnail изображения с error fallback  
- Dual currency display: "12.50 лв / 6.25 €"
- Weight display: "500гр", "250мл"  
- Tags като colored chips
- Allergens със ⚠️ икона
- Toggle availability бутони
- Edit/Delete действия

### Технически Решения

**Client-Side Filtering Pattern** (използван в Categories и MenuItems):
```typescript
// Заместо backend филтриране което не работи надеждно
const filteredItems = selectedMenu 
  ? allItems.filter(item => item.menuId === selectedMenu)
  : allItems;
```

**Dual Currency Management**:
```typescript  
// BGN и EUR полета в една форма
priceBGN: number;
priceEUR: number;
// Display: {Number(item.priceBGN).toFixed(2)} лв
```

**Weight Validation Fix**:
```typescript
// Frontend изпраща само 'g' или 'ml' (backend requirements)
// UI показва 'гр' или 'мл' (user-friendly Bulgarian)
weightUnit: formData.weight > 0 ? formData.weightUnit : undefined
```

### CSS Enhancement
**Добавени стилове в `components.scss`:**
```scss
.table-image {
  .product-image {
    width: 50px; height: 50px;
    object-fit: cover; border-radius: 4px;
  }
  .no-image {
    /* Placeholder за липсващи изображения */
  }
}
```

### QRCodesPage.tsx ✅
**Функционалност**: Пълно управление на QR кодове за всички клиенти
**Ключови особености**:
- **Grid Layout**: Карти за всеки клиент с QR информация
- **QR генериране**: Динамично генериране на QR кодове с qrcode npm пакет  
- **Image Display**: Показване на генерирани QR изображения (200x200px)
- **Download Function**: Директно свалиане на QR файлове
- **Client Filtering**: Възможност за филтриране по клиенти
- **Status Management**: Показване на статус - генериран/не е генериран
- **Regenerate Option**: Възможност за регенериране на съществуващи QR кодове

**Техническа имплементация**:
- `qrService.ts` за API комуникация с QR endpoints
- TanStack Query за async state management
- Mutation handling за generate/regenerate операции
- Error boundaries за невалидни QR изображения
- Authentication protected operations with JWT tokens

**QR Code File Management**:
- Статично съхранение: `/backend/uploads/qr-codes/qr-{clientId}.png`
- Публични URL-и: `http://localhost:5000/uploads/qr-codes/`
- QR съдържание: `http://localhost:3000/menu/{client.slug}` (бъдещия public frontend)

**CSS стилизация**: `_qr-codes.scss`
- Responsive grid layout (350px min column width)
- Card design с hover ефекти
- QR изображения с border-radius и shadow
- Status badges с цветно кодиране
- Button стайлинг за actions (генериране, download, регенериране)

### Authentication & Context Management ✅
**Решени проблеми с AuthProvider**:
- Debug logging в AuthContext за проследяване на token flow
- Корректно обвиване на App компонента в AuthProvider
- Protected routes with useAuth hook validation
- JWT token автоматично инжектиране в API calls

### API Services Architecture ✅
**qrService.ts структура**:
```typescript
export const qrService = {
  generateQRCode: async (clientId: number) => {
    // POST /api/public/qr-code/:id с authentication
  },
  getQRCode: async (clientId: number) => {
    // GET /api/public/qr-code/:id за проверка на съществуване
  }
};
```

**Error Handling Patterns**:
- API error response handling с български съобщения
- File existence validation за QR изображения
- Network error recovery със retry механизъм
- Loading states за всички async операции

### Текущ URL mapping:
- Dashboard: `/dashboard` ✅  
- Clients: `/clients` ✅
- Menus: `/menus` ✅ 
- Categories: `/categories` ✅
- Menu Items: `/menu-items` ✅  
- QR Codes: `/qr-codes` ✅

### Проект завършен за админ панел ✅
V5 админ панелът е напълно функционален с всички CRUD операции, QR код генериране, и пълна административна функционалност за управление на QR меню системата.

---

## 🚀 V5 PUBLIC FRONTEND ПЛАН 

### 🎯 Обща концепция
**Mobile First QR Menu System** - публичен интерфейс за крайни потребители, достъпен чрез QR кода на ресторанта

### Архитектура
```
V5/
├── backend/           # ✅ Готов (Node.js + Express + Prisma + PostgreSQL)
├── frontend-admin/    # ✅ Готов (React + TypeScript + Vite на port 5173)
└── frontend-public/   # 🆕 Ще създадем (React + TypeScript + Vite на port 3000)
    ├── public/           # Static assets, PWA manifest
    ├── src/
    │   ├── components/   # Reusable UI компоненти
    │   │   ├── Header/
    │   │   ├── HeroSection/
    │   │   ├── CategoryCard/
    │   │   ├── MenuItem/
    │   │   ├── PriceFilter/
    │   │   └── ui/       # Base компоненти (Button, Modal, etc.)
    │   ├── pages/        # Главни страници
    │   │   ├── HomePage.tsx
    │   │   ├── CategoryPage.tsx
    │   │   ├── MenuItemPage.tsx
    │   │   └── ErrorPage.tsx
    │   ├── services/     # API интеграция с V5 backend
    │   │   ├── menuService.ts
    │   │   └── apiClient.ts
    │   ├── themes/       # Theme система
    │   │   ├── burger-pizza/
    │   │   ├── restaurant/
    │   │   ├── universal/
    │   │   └── ThemeProvider.tsx
    │   ├── types/        # TypeScript типове
    │   ├── utils/        # Helper функции
    │   └── styles/       # Global CSS/SCSS
    └── package.json
```

### 🎨 Theme System (3 дизайна)

#### 1. **Burger & Pizza Theme** (базиран на V4 референция)
- **Цветова схема**: `#E53E3E` (червено), `#FFC107` (жълто), `#2D3748` (тъмно)
- **Typography**: Bold, playful шрифтове (Inter Bold, Open Sans)
- **Визуален стил**: Casual, fun, енергични градиенти, дебели border-radius
- **Animations**: Bouncy, quick transitions
- **Target**: Fast food заведения, бургер къщи, пицарии

#### 2. **Restaurant Theme** (елегантен)
- **Цветова схема**: `#1A365D` (тъмно синьо), `#D69E2E` (злато), `#F7FAFC` (кремаво)
- **Typography**: Serif шрифтове (Playfair Display, Lora), изчистени линии
- **Визуален стил**: Minimal, sophisticated, тихи анимации, тънки линии
- **Animations**: Smooth, elegant transitions
- **Target**: Fine dining ресторанти, винарии, луксозни заведения

#### 3. **Universal Theme** (универсален)
- **Цветова схема**: `#4A5568` (сив), `#38A169` (зелен), `#FFFFFF` (бял)
- **Typography**: Clean sans-serif (Inter, Source Sans Pro)
- **Визуален стил**: Balanced, адаптивен, професионален, средни закръгления
- **Animations**: Standard easing, professional feel
- **Target**: Всички останали видове заведения (кафенета, сладкарници, etc.)

### 📱 Mobile First Strategy

#### Breakpoints
```scss
// Mobile First CSS Variables
:root {
  /* Mobile (320px+) - Default */
  --container-padding: 1rem;
  --header-height: 60px;
  --grid-columns: 1;
  --card-size: 100%;
}

@media (min-width: 480px) {
  /* Large Mobile */
  :root {
    --grid-columns: 2;
    --card-size: calc(50% - 0.5rem);
  }
}

@media (min-width: 768px) {
  /* Tablet */
  :root {
    --container-padding: 2rem;
    --grid-columns: 3;
    --header-height: 70px;
  }
}

@media (min-width: 1024px) {
  /* Desktop */
  :root {
    --container-padding: 3rem;
    --grid-columns: 4;
    --header-height: 80px;
  }
}
```

#### Mobile First Features
- **Touch-first интерфейс**: 44px+ бутони, swipe gestures
- **Thumb-friendly навигация**: Bottom navigation на mobile
- **Progressive image loading**: Lazy loading с placeholder
- **Offline-ready**: Service Worker за caching
- **Fast loading**: Code splitting, под 100ms initial load

### 🛣️ Routing Structure

```typescript
// Public Routes (no authentication needed)
/menu/:clientSlug                    # Начална страница на ресторанта
/menu/:clientSlug/category/:categoryId   # Категория с продукти
/menu/:clientSlug/item/:itemId          # Детайли за продукт
/404                                # Error страница
/offline                            # Offline fallback

// URL Examples:
// /menu/burger-house
// /menu/burger-house/category/2
// /menu/burger-house/item/15
```

### 📄 Page Detailed Breakdown

#### HomePage (`/menu/:clientSlug`)
**Layout Structure:**
```
┌─────────────────────────┐
│       Header            │ ← Logo + navigation
├─────────────────────────┤
│     HeroSection         │ ← Restaurant info
│  - Logo + Name          │
│  - Description          │
│  - Contact Info         │
├─────────────────────────┤
│   "Нашето Меню"        │ ← Section title
├─────────────────────────┤
│   CategoriesGrid        │ ← All categories
│  [Cat1] [Cat2] [Cat3]   │
│  [Cat4] [Cat5] [Cat6]   │
├─────────────────────────┤
│   PromoSection?         │ ← Optional promos
└─────────────────────────┘
```

**Компоненти:**
- `Header` - responsive меню, logo, back button
- `HeroSection` - ресторант лого, име, описание, адрес, телефон
- `CategoriesGrid` - grid layout с category карти
- `PromoSection` - специални оферти (ако има в data)

**API Calls:**
- `GET /api/public/menu/:slug` - цялата меню информация

**Features:**
- Theme автоматично detection по menu template
- Smooth scroll към секции
- Category hover ефекти
- Loading skeleton за всички секции

#### CategoryPage (`/menu/:clientSlug/category/:categoryId`)
**Layout Structure:**
```
┌─────────────────────────┐
│       Header            │ ← Back button + category name
├─────────────────────────┤
│    CategoryHero         │ ← Category info + image
├─────────────────────────┤
│   CategorySlider        │ ← Horizontal category nav
├─────────────────────────┤
│    PriceFilter          │ ← Price range slider
├─────────────────────────┤
│   MenuItemsGrid         │ ← Filtered products
│  [Item1] [Item2]        │
│  [Item3] [Item4]        │
├─────────────────────────┤
│   BackToTop             │ ← Floating button
└─────────────────────────┘
```

**Компоненти:**
- `CategoryHero` - име, описание, cover image
- `CategorySlider` - swipeable категории за бърза навигация  
- `PriceFilter` - dual range slider за min/max цена
- `MenuItemsGrid` - responsive grid с продукти
- `BackToTop` - smooth scroll нагоре

**Features:**
- Client-side филтриране по цени
- Infinite scroll или load more
- Quick add to favorites (localStorage)
- Swipe navigation между категории
- Pull-to-refresh на mobile

#### MenuItemPage (`/menu/:clientSlug/item/:itemId`)
**Layout Structure:**
```
┌─────────────────────────┐
│       Header            │ ← Back button + item name
├─────────────────────────┤
│     ItemImage           │ ← Large product image
├─────────────────────────┤
│    ItemDetails          │ ← Name, description, price
├─────────────────────────┤
│   NutritionalInfo       │ ← Weight, tags, allergens
├─────────────────────────┤
│   RelatedItems          │ ← Other items from category
├─────────────────────────┤
│   ShareSection          │ ← Social sharing
└─────────────────────────┘
```

**Компоненти:**
- `ItemImage` - zoom gallery, lazy loading
- `ItemDetails` - име, описание, dual currency цени
- `AllergenWarning` - алергени с иконки и предупреждения
- `NutritionalInfo` - тегло, калории, тагове
- `RelatedItems` - carousel с други продукти
- `ShareSection` - социално споделяне + QR генериране

**Features:**
- Image zoom/pinch на mobile и desktop
- Социално споделяне (Facebook, WhatsApp, копиране на линк)
- QR код генериране за директен линк
- Breadcrumb навигация
- Related products carousel

### 🔧 Technical Implementation

#### Frontend Technologies Stack
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0", 
    "react-router-dom": "^6.8.0",
    "@tanstack/react-query": "^4.24.0",
    "axios": "^1.3.0",
    "framer-motion": "^9.0.0",
    "react-intersection-observer": "^9.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^4.9.0",
    "vite": "^4.1.0",
    "sass": "^1.58.0",
    "@vitejs/plugin-react": "^3.1.0"
  }
}
```

#### API Integration Strategy
```typescript
// services/apiClient.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const publicApiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/public`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// services/menuService.ts
export const menuService = {
  getMenuBySlug: async (slug: string) => {
    const response = await publicApiClient.get<MenuResponse>(`/menu/${slug}`);
    return response.data;
  }
};
```

#### Theme System Implementation
```typescript
// themes/ThemeProvider.tsx
interface ThemeContextType {
  currentTheme: 'burger-pizza' | 'restaurant' | 'universal';
  switchTheme: (theme: string) => void;
  themeConfig: ThemeConfig;
}

// themes/burger-pizza/config.ts
export const burgerPizzaTheme: ThemeConfig = {
  name: 'burger-pizza',
  colors: {
    primary: '#E53E3E',
    secondary: '#FFC107', 
    accent: '#2D3748',
    background: '#FFFFFF',
    surface: '#F7FAFC',
    text: '#2D3748'
  },
  typography: {
    headingFont: '"Inter", "Helvetica Neue", sans-serif',
    bodyFont: '"Open Sans", "Arial", sans-serif',
    sizes: {
      h1: 'clamp(2rem, 5vw, 3rem)',
      h2: 'clamp(1.5rem, 4vw, 2.25rem)',
      body: '1rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem', 
    md: '1rem',
    lg: '2rem',
    xl: '3rem'
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '50%'
  }
};
```

### 🚀 Implementation Roadmap

#### Phase 1: Project Setup & Architecture ⚡ (1-2 дни)
**Tasks:**
1. **Vite + React + TypeScript setup**
   - Създаване на `V5/frontend-public/` директория
   - Package.json с всички dependencies
   - Vite config за development и production
   - TypeScript config с strict mode

2. **Base Architecture**
   - Folder structure създаване
   - Router setup с React Router 6
   - API client configuration 
   - Environment variables setup

3. **Base Components**
   - Header компонент със responsive навигация
   - Layout wrapper компонент
   - Loading и Error boundary компоненти

**Deliverable**: Работещ скелет с routing и API connection

#### Phase 2: Theme System Development 🎨 (2-3 дни) 
**Tasks:**
1. **Theme Infrastructure**
   - CSS Variables система за всички themes
   - ThemeProvider context с динамично switching
   - Base component стилизация

2. **Burger/Pizza Theme** (първи theme за testing)
   - Цветова схема и typography
   - Component styles за всички UI елементи
   - Mobile responsive rules

3. **Theme Detection Logic**
   - Автоматично theme selection по menu template
   - Local storage за user preferences
   - Fallback към universal theme

**Deliverable**: Работеща theme система с първия theme

#### Phase 3: Core Pages Development 📄 (3-4 дни)
**Tasks:**
1. **HomePage Implementation**  
   - HeroSection с restaurant информация
   - CategoriesGrid с responsive layout
   - API интеграция за menu data loading

2. **CategoryPage Implementation**
   - Category hero и продукти grid
   - Price filtering functionality
   - Category navigation slider  

3. **MenuItemPage Implementation**
   - Product detail view с изображения
   - Allergen и nutritional информация
   - Related products секция

**Deliverable**: Всички основни страници с functionality

#### Phase 4: Mobile Optimization & UX 📱 (2-3 дни)
**Tasks:**
1. **Touch Interactions**
   - Swipe gestures за navigation
   - Touch-friendly бутони и inputs
   - Pull-to-refresh functionality

2. **Performance Optimization**  
   - Image lazy loading с intersection observer
   - Code splitting по страници
   - Bundle size optimization под 500kb

3. **Progressive Web App Features**
   - Service Worker за caching
   - Offline page и functionality  
   - Add to Home Screen support

**Deliverable**: Напълно оптимизиран mobile experience

#### Phase 5: Additional Themes & Polish 🎭 (3-4 дни)
**Tasks:**
1. **Restaurant Theme Development**
   - Елегантна цветова схема  
   - Serif typography и sophisticated анимации
   - Fine dining focused UI patterns

2. **Universal Theme Development**
   - Неутрална цветова палитра
   - Flexible компонент система
   - Wide compatibility дизайн

3. **Cross-Theme Testing**
   - Theme switching без visual glitches
   - Consistent component behavior
   - Responsive design за всички themes

**Deliverable**: Три напълно функционални themes

#### Phase 6: Testing & Deployment 🧪 (2-3 дни)  
**Tasks:**
1. **Browser Compatibility**
   - Testing на Chrome, Safari, Firefox, Edge
   - Mobile browser testing (iOS Safari, Chrome Mobile)
   - Performance testing на различни устройства

2. **SEO & Meta Optimization**
   - Dynamic meta tags за всяка страница
   - Open Graph tags за social sharing
   - Structured data за restaurants

3. **Production Build & Deployment**
   - Production Vite config
   - Static hosting setup (Netlify/Vercel)
   - Domain configuration и SSL

**Deliverable**: Production-ready публичен frontend

### 📊 Technical Requirements

#### Performance Targets
- **Initial Page Load**: под 2 секунди на 3G
- **Bundle Size**: под 500kb gzipped
- **Lighthouse Score**: 90+ за всички метрики
- **Core Web Vitals**: Green за LCP, FID, CLS

#### Browser Support  
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Progressive Enhancement**: Graceful degradation за стари браузъри

#### Accessibility
- **WCAG 2.1 AA compliance**
- **Screen reader support**
- **Keyboard navigation**
- **High contrast mode support**

---

**ВАЖНО**: V4 папката служи САМО за UI референция. Всички нови файлове се създават в V5/frontend-public/. Backend API endpoints от V5/backend/ се използват без промени.

Този проект е за българския пазар - всички UI текстове и съобщения са на български език.