// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Menu Types (базирани на V5 backend schema)
export interface Client {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Menu {
  id: number;
  clientId: number;
  templateId: number;
  title: string;
  description?: string;
  restaurantLogo?: string;
  contactInfo?: ContactInfo;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  client: Client;
  template: Template;
  categories: Category[];
}

export interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  workingHours?: string;
}

export interface Template {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  previewImage?: string;
  themeConfig?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  menuId: number;
  name: string;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  menuItems: MenuItem[];
}

export interface MenuItem {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  image?: string;
  priceBGN: number;
  priceEUR: number;
  weight?: number;
  weightUnit?: 'g' | 'ml';
  tags?: string;
  allergens?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

// Public API Response Types
export interface PublicMenuResponse {
  success: boolean;
  data: Menu;
  message?: string;
}

// Component Props Types
export interface MenuContextType {
  menu: Menu | null;
  isLoading: boolean;
  error: string | null;
}

// Theme Types
export type ThemeName = 'burger-pizza' | 'restaurant' | 'universal';

export interface ThemeConfig {
  name: ThemeName;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    sizes: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
      small: string;
    };
    weights: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface ThemeContextType {
  currentTheme: ThemeName;
  themeConfig: ThemeConfig;
  switchTheme: (theme: ThemeName) => void;
}