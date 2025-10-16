import type { ThemeConfig } from '../core/types';
import { 
  baseSpacing, 
  baseBorderRadius, 
  baseShadows, 
  baseBreakpoints, 
  baseZIndex, 
  baseTransitions,
  baseTypography 
} from '../core/base';

/**
 * Universal Theme - неутрален, професионален дизайн
 * Подходящ за всички видове заведения
 */
export const universalTheme: ThemeConfig = {
  // Theme Meta
  name: 'universal',
  displayName: 'Универсален',
  description: 'Чист и професионален дизайн, подходящ за всички видове заведения',
  category: 'universal',
  
  // Colors
  colors: {
    // Primary Colors - неутрално синьо
    primary: '#3B82F6',        // Blue 500
    primaryHover: '#2563EB',   // Blue 600
    primaryLight: '#DBEAFE',   // Blue 100
    primaryDark: '#1D4ED8',    // Blue 700
    
    // Secondary Colors - неутрално зелено
    secondary: '#10B981',      // Emerald 500
    secondaryHover: '#059669', // Emerald 600
    secondaryLight: '#D1FAE5', // Emerald 100
    secondaryDark: '#047857',  // Emerald 700
    
    // Accent Colors - неутрално сиво
    accent: '#6B7280',         // Gray 500
    accentHover: '#4B5563',    // Gray 600
    
    // Background Colors
    background: '#FFFFFF',       // White
    backgroundSecondary: '#F9FAFB', // Gray 50
    surface: '#FFFFFF',         // White
    surfaceHover: '#F3F4F6',   // Gray 100
    
    // Text Colors
    text: '#111827',           // Gray 900
    textSecondary: '#6B7280',  // Gray 500
    textMuted: '#9CA3AF',      // Gray 400
    textInverse: '#FFFFFF',    // White
    
    // Border Colors
    border: '#E5E7EB',         // Gray 200
    borderLight: '#F3F4F6',    // Gray 100
    borderDark: '#D1D5DB',     // Gray 300
    
    // Status Colors
    success: '#10B981',        // Emerald 500
    warning: '#F59E0B',        // Amber 500
    error: '#EF4444',          // Red 500
    info: '#3B82F6',          // Blue 500
    
    // Special Colors
    headerBg: '#FFFFFF',       // White
    headerText: '#111827',     // Gray 900
    footerBg: '#F9FAFB',      // Gray 50
    footerText: '#6B7280',     // Gray 500
  },
  
  // Typography (с професионални шрифтове)
  typography: {
    ...baseTypography,
    headingFont: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    bodyFont: '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  
  // Design Tokens (използваме базовите стойности)
  spacing: baseSpacing,
  borderRadius: baseBorderRadius,
  shadows: baseShadows,
  breakpoints: baseBreakpoints,
  zIndex: baseZIndex,
  transitions: baseTransitions,
  
  // CSS Variables за Universal theme
  cssVariables: {
    // Container
    '--container-max-width': '1200px',
    '--container-padding': 'clamp(1rem, 4vw, 3rem)',
    
    // Header
    '--header-height': 'clamp(60px, 8vw, 80px)',
    '--header-shadow': '0 1px 3px rgba(0, 0, 0, 0.1)',
    
    // Hero Section
    '--hero-gradient': 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    '--hero-text-shadow': '0 2px 4px rgba(0, 0, 0, 0.2)',
    
    // Cards
    '--card-hover-transform': 'translateY(-4px)',
    '--card-transition': 'all 0.3s ease',
    
    // Animations
    '--animation-duration-fast': '150ms',
    '--animation-duration-normal': '300ms',
    '--animation-duration-slow': '500ms',
    '--animation-easing': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Component-specific styling
  components: {
    header: {
      '--header-backdrop-filter': 'blur(8px)',
      '--header-bg-opacity': '0.95',
    },
    
    hero: {
      '--hero-min-height': 'clamp(400px, 50vh, 600px)',
      '--hero-content-max-width': '600px',
    },
    
    categoryCard: {
      '--category-card-aspect-ratio': '4 / 3',
      '--category-card-border-width': '1px',
      '--category-card-hover-scale': '1.02',
    },
    
    menuItem: {
      '--menu-item-image-size': '80px',
      '--menu-item-padding': '1.5rem',
    },
    
    button: {
      '--button-border-radius': '0.5rem',
      '--button-font-weight': '500',
      '--button-min-height': '44px', // Touch-friendly
    },
  },
};

export default universalTheme;