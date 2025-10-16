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

### Следващи стъпки (по приоритет) 🔄
1. **Тестване на Menus таб** - проверка дали template проблема е решен
2. **Categories управление** - CRUD интерфейс за категории 
3. **Menu Items управление** - CRUD интерфейс за продукти с цени BGN/EUR
4. **QR Codes генериране и управление** - визуализация на QR кодовете

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
- `POST /api/public/qr-code/:clientId/generate` - генериране на QR код

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

### Template Error Fix ✅  
**Проблем**: "Темплейтът не е намерен" при създаване на меню
**Причина**: MenuForm използваше mock темплейти (id: 1,2) вместо реални от API
**Решение**: 
- Създаден `templateService` за зареждане от `/api/templates`
- Обновен `MenuForm` да използва реални темплейти от API
- Поправени типове за правилно извличане на данните

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

### Текущ URL mapping:
- Dashboard: `/dashboard`  
- Clients: `/clients` ✅
- Menus: `/menus` ✅ (току-що поправено)
- Categories: `/categories` 🔄 (следващо)
- Menu Items: `/menu-items` 🔄  
- QR Codes: `/qr-codes` 🔄

Този проект е за българския пазар - всички UI текстове и съобщения са на български език.