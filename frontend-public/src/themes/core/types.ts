/**
 * Base Theme Interface - всички теми трябва да имплементират тази структура
 * Това гарантира консистентност при добавяне на нови теми
 */

export interface ThemeColors {
  // Primary Colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary Colors
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Accent Colors
  accent: string;
  accentHover: string;
  
  // Background Colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceHover: string;
  
  // Text Colors
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // Border Colors
  border: string;
  borderLight: string;
  borderDark: string;
  
  // Status Colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Special Colors (за header, footer, etc.)
  headerBg: string;
  headerText: string;
  footerBg: string;
  footerText: string;
}

export interface ThemeTypography {
  // Font Families
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  
  // Font Sizes (използваме clamp() за responsive)
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  
  // Font Weights
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  
  // Line Heights
  lineHeight: {
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  
  // Letter Spacing
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

export interface ThemeSpacing {
  // Base spacing scale
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface ThemeBreakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ThemeZIndex {
  auto: string;
  0: string;
  10: string;
  20: string;
  30: string;
  40: string;
  50: string;
  dropdown: string;
  sticky: string;
  fixed: string;
  modal: string;
  popover: string;
  tooltip: string;
  toast: string;
}

export interface ThemeTransitions {
  none: string;
  all: string;
  default: string;
  colors: string;
  opacity: string;
  shadow: string;
  transform: string;
}

/**
 * Complete Theme Configuration Interface
 */
export interface ThemeConfig {
  // Theme Meta Information
  name: string;
  displayName: string;
  description: string;
  category: 'restaurant' | 'fast-food' | 'universal' | 'custom';
  
  // Theme Design Tokens
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  breakpoints: ThemeBreakpoints;
  zIndex: ThemeZIndex;
  transitions: ThemeTransitions;
  
  // Theme-specific CSS Variables (за custom properties)
  cssVariables: Record<string, string>;
  
  // Component-specific overrides (за специфични компоненти)
  components?: {
    header?: Record<string, string>;
    hero?: Record<string, string>;
    categoryCard?: Record<string, string>;
    menuItem?: Record<string, string>;
    button?: Record<string, string>;
    // Можем да добавяме нови компоненти тук
  };
}

/**
 * Theme Provider Context Type
 */
export interface ThemeContextType {
  currentTheme: string;
  themeConfig: ThemeConfig;
  availableThemes: string[];
  switchTheme: (themeName: string) => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Theme Registry - за динамично зареждане на теми
 */
export interface ThemeRegistry {
  [themeName: string]: () => Promise<ThemeConfig>;
}

// Export all types for use in other modules