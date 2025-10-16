import type { ThemeRegistry, ThemeConfig } from './core/types';

/**
 * Theme Registry - централизирано място за всички теми
 * Използва lazy loading за по-добри performance
 */
export const themeRegistry: ThemeRegistry = {
  'universal': () => import('./universal/config').then(m => m.universalTheme),
  'burger-pizza': () => import('./burger-pizza/config').then(m => m.burgerPizzaTheme),
  'restaurant': () => import('./restaurant/config').then(m => m.restaurantTheme),
};

/**
 * Theme Manager - utilities за работа с теми
 */
export class ThemeManager {
  private static instance: ThemeManager;
  private loadedThemes: Map<string, ThemeConfig> = new Map();
  
  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }
  
  /**
   * Получава списък с всички налични теми
   */
  getAvailableThemes(): string[] {
    return Object.keys(themeRegistry);
  }
  
  /**
   * Зарежда тема (с caching)
   */
  async loadTheme(themeName: string): Promise<ThemeConfig> {
    // Проверява cache
    if (this.loadedThemes.has(themeName)) {
      return this.loadedThemes.get(themeName)!;
    }
    
    // Проверява дали темата съществува
    if (!themeRegistry[themeName]) {
      throw new Error(`Theme "${themeName}" not found. Available themes: ${this.getAvailableThemes().join(', ')}`);
    }
    
    try {
      // Зарежда темата
      const theme = await themeRegistry[themeName]();
      
      // Запазва в cache
      this.loadedThemes.set(themeName, theme);
      
      console.log(`🎨 Theme "${theme.displayName}" loaded successfully`);
      return theme;
    } catch (error) {
      console.error(`❌ Failed to load theme "${themeName}":`, error);
      throw new Error(`Failed to load theme "${themeName}"`);
    }
  }
  
  /**
   * Прилага тема към DOM (CSS variables)
   */
  applyTheme(theme: ThemeConfig): void {
    const root = document.documentElement;
    
    // Прилага цветовете
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${this.kebabCase(key)}`, value);
    });
    
    // Прилага typography
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    
    Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value.toString());
    });
    
    // Прилага spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Прилага border radius
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });
    
    // Прилага shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Прилага custom CSS variables
    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Прилага component-specific variables
    if (theme.components) {
      Object.entries(theme.components).forEach(([, vars]) => {
        Object.entries(vars).forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });
      });
    }
    
    // Запазва темата в localStorage
    localStorage.setItem('selectedTheme', theme.name);
    
    console.log(`🎨 Theme "${theme.displayName}" applied to DOM`);
  }
  
  /**
   * Получава запазената тема от localStorage
   */
  getSavedTheme(): string | null {
    return localStorage.getItem('selectedTheme');
  }
  
  /**
   * Определя автоматично тема базирана на template
   */
  getThemeByTemplate(templateName: string): string {
    const templateThemeMap: Record<string, string> = {
      'burger-shop': 'burger-pizza',
      'pizza-place': 'burger-pizza', 
      'fast-food': 'burger-pizza',
      'fine-dining': 'restaurant',
      'wine-bar': 'restaurant',
      'bistro': 'restaurant',
      'cafe': 'universal',
      'bakery': 'universal',
      'default': 'universal',
    };
    
    return templateThemeMap[templateName] || 'universal';
  }
  
  /**
   * Utility function - преобразува camelCase към kebab-case
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }
}

export default ThemeManager;

/**
 * Helper function за лесен достъп до ThemeManager
 */
export const getThemeManager = () => ThemeManager.getInstance();