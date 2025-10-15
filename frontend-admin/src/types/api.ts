// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp?: string;
  stack?: string;
  details?: {
    statusCode: number;
    isOperational: boolean;
  };
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

// Client Types
export interface Client {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  logo?: string;
  slogan?: string;
  socialMedia?: Record<string, any>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  menu?: Menu;
}

export interface CreateClientRequest {
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  logo?: string;
  slogan?: string;
  socialMedia?: Record<string, any>;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  active?: boolean;
}

export interface ClientListResponse {
  data: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Menu Types
export interface Menu {
  id: number;
  name: string;
  active: boolean;
  published: boolean;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
  clientId: number;
  templateId?: number;
  client?: {
    id: number;
    name: string;
  };
  template?: {
    id: number;
    name: string;
  };
  categories?: Category[];
}

export interface CreateMenuRequest {
  name: string;
  clientId: number;
  templateId?: number;
}

export interface UpdateMenuRequest {
  name?: string;
  templateId?: number;
  active?: boolean;
  published?: boolean;
}

// Extended Menu Types for Management
export interface MenuWithRelations extends Menu {
  client: {
    id: number;
    name: string;
    slug: string;
  };
  template?: {
    id: number;
    name: string;
    config: Record<string, any>;
  };
  _count?: {
    categories: number;
    items: number;
  };
}

export interface MenuListResponse {
  menus: MenuWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Template Types
export interface Template {
  id: number;
  name: string;
  description?: string;
  config: Record<string, any>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  menuId: number;
  menu?: {
    id: number;
    name: string;
    client?: {
      id: number;
      name: string;
    };
  };
  _count?: {
    items: number;
  };
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: string;
  order?: number;
  menuId: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  active?: boolean;
}

// Menu Item Types
export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  priceBGN: number;
  priceEUR: number;
  weight?: number;
  weightUnit?: string;
  image?: string;
  tags: string[];
  allergens: string[];
  addons?: Record<string, any>;
  available: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  menuId: number;
  category?: {
    id: number;
    name: string;
  };
  menu?: {
    id: number;
    name: string;
  };
}

export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  priceBGN: number;
  priceEUR: number;
  weight?: number;
  weightUnit?: string;
  image?: string;
  tags?: string[];
  allergens?: string[];
  addons?: Record<string, any>;
  order?: number;
  categoryId: number;
  menuId: number;
}

export interface UpdateMenuItemRequest extends Partial<CreateMenuItemRequest> {
  available?: boolean;
}

// QR Code Types
export interface QRCodeData {
  qrCodeUrl: string;
  menuUrl: string;
  client: {
    name: string;
    slug: string;
  };
}