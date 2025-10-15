# Changelog

Всички важни промени в този проект ще бъдат документирани в този файл.

## [1.0.0] - 2025-10-15

### Добавено
- ✨ **Client Management System** - Пълно CRUD управление на ресторанти
  - Създаване, четене, актуализиране и изтриване на клиенти
  - Slug-базиран публичен достъп
  - Валидация и автентикация
  
- ✨ **Menu Management System** - Система за управление на менюта
  - CRUD операции за менюта
  - Publish/Unpublish функционалност
  - Template интеграция
  
- ✨ **Category Management System** - Управление на категории
  - Подреждане на категории с drag-and-drop логика
  - Изображения за категории
  - Активиране/деактивиране
  
- ✨ **MenuItem Management System** - Сложно управление на продукти
  - Двойни цени (BGN/EUR)
  - Тегла с мерни единици
  - Тагове за категоризация
  - Алергени система
  - Addon система за допълнения
  - Наличност toggle
  
- ✨ **Template System** - Шаблони за ресторанти
  - Предварително конфигурирани менюта
  - Различни типове заведения
  - Бърз старт за нови клиенти
  
- ✨ **Public API & QR Codes** - Публичен достъп
  - QR код генериране с qrcode библиотека
  - Публични endpoints без автентикация
  - Slug-базиран достъп до менюта
  
- 🔐 **Authentication System** - Сигурност
  - JWT токен система
  - bcrypt парола хеширане
  - Middleware защита за админ операции
  
- ✅ **Validation System** - Валидация на данни
  - Joi схеми за всички входни данни
  - Специализирани валидации за ID типове
  - Error handling middleware
  
- 🗄️ **Database Design** - PostgreSQL + Prisma
  - Релационна база данни структура
  - Auto-increment ID система
  - Оптимизирани заявки и индекси

### Техническа спецификация
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL с Prisma ORM
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **QR Generation**: qrcode библиотека
- **File Structure**: MVC архитектура

### API Endpoints
- 📊 Authentication: `/api/auth/*`
- 🏪 Clients: `/api/clients/*`
- 📋 Menus: `/api/menus/*`
- 📂 Categories: `/api/categories/*`
- 🥘 Menu Items: `/api/menu-items/*`
- 🎨 Templates: `/api/templates/*`
- 🌐 Public: `/api/public/*`

### Database Models
- `User` - Админ потребители
- `Client` - Ресторанти/заведения
- `Template` - Шаблони за менюта
- `Menu` - Менюта на ресторантите
- `Category` - Категории в менютата
- `MenuItem` - Продукти/ястия
- `TemplateCategory` - Категории в шаблоните
- `TemplateItem` - Продукти в шаблоните

### Особености
- 🌍 Двуезично ценоразписание (BGN/EUR)
- 📱 QR кодове за директен достъп
- 🔍 Филтриране и търсене в продукти
- 📊 Pagination за големи списъци
- 🎨 Template система за бърз старт
- 🛡️ Пълна сигурност с JWT
- 📝 Детайлна валидация на всички данни