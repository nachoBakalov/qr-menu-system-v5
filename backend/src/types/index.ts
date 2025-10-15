/**
 * Основни типове за QR Menu приложението
 * Тези типове са базирани на Prisma схемата и се използват във всички части на приложението
 */

// Базови енумерации
export enum Role {
  ADMIN = 'ADMIN'
}

// Интерфейси за базата данни (базирани на Prisma модели)
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;           // Име на ресторанта
  slug: string;           // URL slug - пример: burger-king
  description?: string;   // Описание на ресторанта
  address?: string;       // Адрес
  phone?: string;         // Телефон
  logo?: string;          // URL към лого
  slogan?: string;        // Слоган
  socialMedia?: {         // Социални мрежи
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  active: boolean;
  menu?: Menu;           // Връзка с менюто
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  name: string;          // Име на темата
  description?: string;
  config: {              // Конфигурация на темата
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    layout: 'grid' | 'list' | 'cards';
  };
  preview?: string;      // URL към превю
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Menu {
  id: string;
  name: string;          // Име на менюто
  clientId: string;
  client?: Client;
  templateId: string;
  template?: Template;
  categories?: Category[];
  items?: MenuItem[];
  active: boolean;
  published: boolean;    // Дали е публикувано
  qrCode?: string;      // URL към QR код
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;          // Име на категорията (Бургери, Пици и т.н.)
  description?: string;
  image?: string;        // URL към изображение
  order: number;         // За подредба
  active: boolean;
  menuId: string;
  menu?: Menu;
  items?: MenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;          // Име на продукта
  description?: string;  // Описание
  categoryId: string;
  category?: Category;
  menuId: string;
  menu?: Menu;
  priceBGN: number;      // Цена в лева
  priceEUR: number;      // Цена в евро
  weight?: number;       // Тегло в грамове
  weightUnit?: string;   // g или ml
  image?: string;        // URL към изображение
  tags: string[];        // местно, веган, вегетарианско и т.н.
  allergens: string[];   // алергени
  addons?: Addon[];      // добавки
  available: boolean;    // налично или не
  order: number;         // за подредба
  createdAt: Date;
  updatedAt: Date;
}

// Допълнителни интерфейси
export interface Addon {
  name: string;
  price: number;         // цена на добавката
}

// DTO (Data Transfer Object) интерфейси за API заявки
export interface CreateClientDto {
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  logo?: string;
  slogan?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    website?: string;
  };
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
  active?: boolean;
}

export interface CreateMenuDto {
  name: string;
  clientId: string;
  templateId: string;
}

export interface UpdateMenuDto {
  name?: string;
  templateId?: string;
  active?: boolean;
  published?: boolean;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  image?: string;
  order?: number;
  menuId: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  active?: boolean;
}

export interface CreateMenuItemDto {
  name: string;
  description?: string;
  categoryId: string;
  menuId: string;
  priceBGN: number;
  priceEUR: number;
  weight?: number;
  weightUnit?: string;
  image?: string;
  tags?: string[];
  allergens?: string[];
  addons?: Addon[];
  order?: number;
}

export interface UpdateMenuItemDto extends Partial<CreateMenuItemDto> {
  available?: boolean;
}

// API Response типове
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth типове
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}