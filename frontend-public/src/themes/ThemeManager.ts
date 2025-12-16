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
      const kebabKey = this.kebabCase(key);
      root.style.setProperty(`--color-${kebabKey}`, value);
    });
    
    // Добавя alias variables за backward compatibility
    if (theme.colors.primary) {
      root.style.setProperty('--primary-color', theme.colors.primary);
      root.style.setProperty('--primary-rgb', this.hexToRgb(theme.colors.primary));
    }
    if (theme.colors.primaryHover) {
      root.style.setProperty('--primary-color-hover', theme.colors.primaryHover);
    }
    if (theme.colors.secondary) {
      root.style.setProperty('--secondary-color', theme.colors.secondary);
      root.style.setProperty('--secondary-rgb', this.hexToRgb(theme.colors.secondary));
    }
    if (theme.colors.text) {
      root.style.setProperty('--text-color', theme.colors.text);
    }
    if (theme.colors.surface) {
      root.style.setProperty('--surface-color', theme.colors.surface);
    }
    if (theme.colors.border) {
      root.style.setProperty('--border-color', theme.colors.border);
    }
    if (theme.colors.background) {
      root.style.setProperty('--background-color', theme.colors.background);
    }
    
    // Interaction colors based on primary
    if (theme.colors.primary) {
      const rgb = this.hexToRgb(theme.colors.primary);
      root.style.setProperty('--hover-color', `rgba(${rgb}, 0.05)`);
      root.style.setProperty('--active-color', `rgba(${rgb}, 0.1)`);
      root.style.setProperty('--focus-color', theme.colors.primary);
    }
    
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
  
  /**
   * Utility function - преобразува HEX цвят към RGB стойности
   */
  private hexToRgb(hex: string): string {
    // Премахва # ако има
    hex = hex.replace('#', '');
    
    // Разширява short hex (#RGB към #RRGGBB)
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    
    // Парсва RGB стойностите
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  }
}

export default ThemeManager;

/**
 * Helper function за лесен достъп до ThemeManager
 */
export const getThemeManager = () => ThemeManager.getInstance();