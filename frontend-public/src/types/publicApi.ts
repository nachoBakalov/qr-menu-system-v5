// API Response Types които съвпадат точно с V5 backend
export interface PublicApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PublicClient {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  logo?: string;
  slogan?: string;
  socialMedia?: Record<string, any>;
}

export interface PublicMenu {
  name: string;
  active: boolean;
  published: boolean;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
  id: number;
  clientId: number;
  templateId?: number;
  categories: PublicCategory[];
}

export interface PublicCategory {
  name: string;
  description?: string;
  image?: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  id: number;
  menuId: number;
  items: PublicMenuItem[];
}

export interface PublicMenuItem {
  name: string;
  description?: string;
  priceBGN: string; // API връща като string
  priceEUR: string; // API връща като string
  weight?: number;
  weightUnit?: string;
  image?: string;
  tags: string[];
  allergens: string[];
  addons: any[];
  available: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  id: number;
  categoryId: number;
  menuId: number;
}

export interface PublicMenuData {
  client: PublicClient;
  menu: PublicMenu;
}

export type PublicMenuResponse = PublicApiResponse<PublicMenuData>;

// Legacy типове за съвместимост
export interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  workingHours?: string;
}

// Конвертиране от Public API към legacy Menu формат за съвместимост
export const convertPublicToMenu = (publicData: PublicMenuData): Menu => {
  return {
    id: publicData.menu.id,
    clientId: publicData.menu.clientId,
    templateId: publicData.menu.templateId || 0,
    title: publicData.menu.name,
    description: publicData.client.description,
    restaurantLogo: publicData.client.logo,
    contactInfo: {
      address: publicData.client.address,
      phone: publicData.client.phone,
      email: undefined,
      website: undefined,
    },
    isActive: publicData.menu.active,
    createdAt: publicData.menu.createdAt,
    updatedAt: publicData.menu.updatedAt,
    client: {
      id: publicData.menu.clientId,
      name: publicData.client.name,
      slug: '', // не е налично в публичния API
      email: '', // не е налично в публичния API
      phone: publicData.client.phone,
      address: publicData.client.address,
      logo: publicData.client.logo,
      description: publicData.client.description,
      isActive: publicData.menu.active,
      createdAt: publicData.menu.createdAt,
      updatedAt: publicData.menu.updatedAt,
    },
    template: {
      id: publicData.menu.templateId || 0,
      name: '',
      displayName: '',
      description: undefined,
      previewImage: undefined,
      themeConfig: undefined,
      isActive: true,
      createdAt: publicData.menu.createdAt,
      updatedAt: publicData.menu.updatedAt,
    },
    categories: publicData.menu.categories.map(cat => ({
      id: cat.id,
      menuId: cat.menuId,
      name: cat.name,
      description: cat.description,
      image: cat.image,
      order: cat.order,
      isActive: cat.active,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      menuItems: cat.items.map(item => ({
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        image: item.image,
        priceBGN: parseFloat(item.priceBGN),
        priceEUR: parseFloat(item.priceEUR),
        weight: item.weight,
        weightUnit: item.weightUnit as 'g' | 'ml' | undefined,
        tags: item.tags.join(', '),
        allergens: item.allergens.join(', '),
        order: item.order,
        isActive: item.available,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        category: {} as Category, // празен обект за избягване на циркулярна референция
      })),
    })),
  };
};

// Import на старите типове за съвместимост
import type { Menu, Category } from './index';

// Поддръжка на старите типове
export * from './index';