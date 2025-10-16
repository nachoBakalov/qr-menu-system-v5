import { publicApiClient } from './apiClient';
import type { PublicMenuResponse } from '../types/publicApi';
import { convertPublicToMenu } from '../types/publicApi';
import type { Menu } from '../types';

export const menuService = {
  /**
   * Получава пълна меню информация по client slug
   * @param slug - уникален slug на клиента
   * @returns Promise с меню данни
   */
  getMenuBySlug: async (slug: string): Promise<Menu> => {
    try {
      console.log(`🍽️ Зареждане на меню за клиент: ${slug}`);
      
      const response = await publicApiClient.get<PublicMenuResponse>(`/menu/${slug}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Грешка при зареждане на менюто');
      }
      
      console.log(`✅ Меню заредено успешно:`, {
        menuTitle: response.data.data.menu.name,
        categoriesCount: response.data.data.menu.categories?.length || 0,
        clientName: response.data.data.client?.name,
      });
      
      // Конвертираме публичния API отговор към legacy Menu формат
      return convertPublicToMenu(response.data.data);
    } catch (error) {
      console.error('❌ Грешка при зареждане на меню:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Неуспешно зареждане на менюто. Моля, опитайте отново.');
    }
  },

  /**
   * Получава конкретна категория с продукти
   * @param slug - client slug  
   * @param categoryId - ID на категорията
   * @returns Promise с категория данни
   */
  getCategoryItems: async (slug: string, categoryId: number) => {
    try {
      const menu = await menuService.getMenuBySlug(slug);
      const category = menu.categories.find(cat => cat.id === categoryId);
      
      if (!category) {
        throw new Error('Категорията не е намерена');
      }
      
      console.log(`📂 Категория заредена:`, {
        categoryName: category.name,
        itemsCount: category.menuItems?.length || 0,
      });
      
      return category;
    } catch (error) {
      console.error('❌ Грешка при зареждане на категория:', error);
      throw error;
    }
  },

  /**
   * Получава конкретен продукт
   * @param slug - client slug
   * @param itemId - ID на продукта
   * @returns Promise с продукт данни
   */
  getMenuItem: async (slug: string, itemId: number) => {
    try {
      const menu = await menuService.getMenuBySlug(slug);
      
      // Търси продукта във всички категории
      for (const category of menu.categories) {
        const item = category.menuItems.find(item => item.id === itemId);
        if (item) {
          console.log(`🍔 Продукт зареден:`, {
            itemName: item.name,
            categoryName: category.name,
            price: `${item.priceBGN} лв / ${item.priceEUR} €`,
          });
          return item;
        }
      }
      
      throw new Error('Продуктът не е намерен');
    } catch (error) {
      console.error('❌ Грешка при зареждане на продукт:', error);
      throw error;
    }
  }
};

export default menuService;