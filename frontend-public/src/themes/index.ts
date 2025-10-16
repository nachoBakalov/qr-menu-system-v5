// Theme System Exports
export { default as ThemeProvider, useTheme, useThemeColors, useThemeTypography, useIsThemeActive } from './ThemeProvider';
export { default as ThemeManager, getThemeManager } from './ThemeManager';
export { themeRegistry } from './ThemeManager';

// Core Types
export type { 
  ThemeConfig, 
  ThemeContextType, 
  ThemeColors, 
  ThemeTypography, 
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeShadows,
  ThemeBreakpoints,
  ThemeZIndex,
  ThemeTransitions,
  ThemeRegistry
} from './core/types';

// Base Configuration
export { 
  baseSpacing, 
  baseBorderRadius, 
  baseShadows, 
  baseBreakpoints, 
  baseZIndex, 
  baseTransitions,
  baseTypography 
} from './core/base';

// Theme Configurations (за direct import ако е нужно)
export { universalTheme } from './universal/config';
export { burgerPizzaTheme } from './burger-pizza/config';  
export { restaurantTheme } from './restaurant/config';

/**
 * Helper за бързо създаване на нова тема
 * Използва се като template за нови теми
 */
import type { ThemeConfig } from './core/types';
import { universalTheme } from './universal/config';

export const createTheme = (overrides: Partial<ThemeConfig>): ThemeConfig => {
  return {
    ...universalTheme,
    ...overrides,
    colors: {
      ...universalTheme.colors,
      ...overrides.colors,
    },
    typography: {
      ...universalTheme.typography,
      ...overrides.typography,
    },
    cssVariables: {
      ...universalTheme.cssVariables,
      ...overrides.cssVariables,
    },
    components: {
      ...universalTheme.components,
      ...overrides.components,
    },
  };
};