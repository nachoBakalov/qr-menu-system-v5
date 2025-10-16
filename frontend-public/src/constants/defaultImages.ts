/**
 * Default images and assets for themes
 */

export const DEFAULT_IMAGES = {
  'burger-pizza': {
    hero: 'https://images.unsplash.com/photo-1693323898254-2a9775ffa443?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1925',
    category: 'https://images.unsplash.com/photo-1693323898254-2a9775ffa443?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=800',
    menuItem: 'https://images.unsplash.com/photo-1693323898254-2a9775ffa443?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=400',
  },
  
  restaurant: {
    hero: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1925',
    category: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=800',
    menuItem: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=400',
  },
  
  universal: {
    hero: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1925',
    category: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=800',
    menuItem: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=400',
  },
} as const;

export type ThemeName = keyof typeof DEFAULT_IMAGES;
export type ImageType = keyof typeof DEFAULT_IMAGES[ThemeName];

/**
 * Получава default изображение за дадена тема и тип
 * @param theme - име на темата
 * @param type - тип изображение (hero, category, menuItem)
 * @returns URL на default изображението
 */
export const getDefaultImage = (theme: ThemeName, type: ImageType): string => {
  return DEFAULT_IMAGES[theme][type];
};

/**
 * Проверява дали дадено изображение трябва да бъде заменено с default
 * @param imageUrl - URL на изображението за проверка
 * @returns true ако трябва да се използва default изображение
 */
export const shouldUseDefaultImage = (imageUrl?: string | null): boolean => {
  return !imageUrl || imageUrl.trim() === '';
};