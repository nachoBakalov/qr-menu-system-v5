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

Този проект е за българския пазар - всички UI текстове и съобщения са на български език.