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
 * Restaurant Theme - елегантен, sophisticated дизайн
 * Подходящ за fine dining ресторанти, винарии, луксозни заведения
 */
export const restaurantTheme: ThemeConfig = {
  // Theme Meta
  name: 'restaurant',
  displayName: 'Ресторант',
  description: 'Елегантен и изискан дизайн за fine dining заведения',
  category: 'restaurant',
  
  // Colors (тъмносиньо-златиста палитра)
  colors: {
    // Primary Colors - дълбоко синьо (navy)
    primary: '#1E40AF',       // Blue 800
    primaryHover: '#1D4ED8',  // Blue 700
    primaryLight: '#DBEAFE',  // Blue 100
    primaryDark: '#1E3A8A',   // Blue 900
    
    // Secondary Colors - луксозно злато
    secondary: '#D97706',     // Amber 600
    secondaryHover: '#B45309', // Amber 700
    secondaryLight: '#FEF3C7', // Amber 100
    secondaryDark: '#92400E',  // Amber 800
    
    // Accent Colors - тъмно сиво
    accent: '#374151',        // Gray 700
    accentHover: '#1F2937',   // Gray 800
    
    // Background Colors (кремави тонове)
    background: '#FFFEF7',    // Custom warm white
    backgroundSecondary: '#FEF7ED', // Orange 50
    surface: '#FFFFFF',       // Pure white
    surfaceHover: '#FEF7ED',  // Orange 50
    
    // Text Colors
    text: '#111827',          // Gray 900
    textSecondary: '#374151', // Gray 700
    textMuted: '#6B7280',     // Gray 500
    textInverse: '#FFFFFF',   // White
    
    // Border Colors (златисти)
    border: '#FDE68A',        // Amber 200
    borderLight: '#FEF3C7',   // Amber 100
    borderDark: '#F59E0B',    // Amber 500
    
    // Status Colors
    success: '#059669',       // Emerald 600
    warning: '#D97706',       // Amber 600
    error: '#DC2626',         // Red 600
    info: '#1E40AF',          // Blue 800
    
    // Special Colors
    headerBg: '#1E3A8A',      // Deep blue
    headerText: '#FFFFFF',    // White
    footerBg: '#111827',      // Very dark gray
    footerText: '#D97706',    // Gold accent
  },
  
  // Typography (с elegant serif шрифтове)
  typography: {
    ...baseTypography,
    headingFont: '"Playfair Display", "Crimson Text", Georgia, serif',
    bodyFont: '"Source Sans Pro", "SF Pro Text", -apple-system, sans-serif',
    
    // Refined font weights
    fontWeight: {
      ...baseTypography.fontWeight,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 700, // Not too heavy for elegance
    },
    
    // Elegant letter spacing
    letterSpacing: {
      ...baseTypography.letterSpacing,
      normal: '0.01em',  // Slightly spaced
      wide: '0.05em',
      wider: '0.1em',
      widest: '0.2em',
    },
  },
  
  // Design Tokens
  spacing: baseSpacing,
  
  // Refined border radius (не прекалено закръглени)
  borderRadius: {
    ...baseBorderRadius,
    sm: '0.25rem',    // 4px
    base: '0.375rem', // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.25rem', // 20px
  },
  
  // Subtle, elegant shadows
  shadows: {
    none: 'none',
    sm: '0 1px 3px 0 rgba(30, 64, 175, 0.1)',
    base: '0 2px 6px 0 rgba(30, 64, 175, 0.1), 0 1px 3px 0 rgba(30, 64, 175, 0.08)',
    md: '0 8px 16px -4px rgba(30, 64, 175, 0.1), 0 4px 8px -2px rgba(30, 64, 175, 0.08)',
    lg: '0 16px 32px -8px rgba(30, 64, 175, 0.1), 0 8px 16px -4px rgba(30, 64, 175, 0.08)',
    xl: '0 24px 48px -12px rgba(30, 64, 175, 0.1), 0 12px 24px -6px rgba(30, 64, 175, 0.08)',
    '2xl': '0 32px 64px -16px rgba(30, 64, 175, 0.15)',
    inner: 'inset 0 2px 4px 0 rgba(30, 64, 175, 0.08)',
  },
  
  breakpoints: baseBreakpoints,
  zIndex: baseZIndex,
  
  // Smooth, elegant transitions
  transitions: {
    none: 'none',
    all: 'all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth
    default: 'all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    colors: 'color 300ms ease, background-color 300ms ease, border-color 300ms ease',
    opacity: 'opacity 300ms ease',
    shadow: 'box-shadow 400ms ease',
    transform: 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  
  // CSS Variables за Restaurant theme
  cssVariables: {
    // Container
    '--container-max-width': '1400px', // По-широк за elegant spacing
    '--container-padding': 'clamp(2rem, 6vw, 4rem)',
    
    // Header
    '--header-height': 'clamp(80px, 12vw, 100px)', // По-висок elegant header
    '--header-shadow': '0 4px 16px rgba(30, 58, 138, 0.15)',
    
    // Hero Section (sophisticated gradient)
    '--hero-gradient': 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 25%, #D97706 75%, #B45309 100%)',
    '--hero-text-shadow': '0 4px 8px rgba(0, 0, 0, 0.25)',
    
    // Cards (subtle hover effects)
    '--card-hover-transform': 'translateY(-2px)',
    '--card-transition': 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    
    // Animations (slower, more elegant)
    '--animation-duration-fast': '200ms',
    '--animation-duration-normal': '400ms',
    '--animation-duration-slow': '600ms',
    '--animation-easing': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    
    // Elegant patterns
    '--pattern-lines': 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(217, 119, 6, 0.05) 2px, rgba(217, 119, 6, 0.05) 4px)',
    '--pattern-size': '40px 40px',
  },
  
  // Component-specific styling
  components: {
    header: {
      '--header-backdrop-filter': 'blur(12px)', // Elegant blur
      '--header-bg-opacity': '0.9',
      '--header-border-bottom': '1px solid rgba(217, 119, 6, 0.3)',
    },
    
    hero: {
      '--hero-min-height': 'clamp(600px, 70vh, 800px)', // Impressive height
      '--hero-content-max-width': '800px',
      '--hero-pattern': 'var(--pattern-lines)',
      '--hero-pattern-size': 'var(--pattern-size)',
    },
    
    categoryCard: {
      '--category-card-aspect-ratio': '5 / 4', // Elegant proportions
      '--category-card-border-width': '1px',
      '--category-card-hover-scale': '1.01', // Subtle scaling
      '--category-card-border-color': 'rgba(217, 119, 6, 0.2)',
    },
    
    menuItem: {
      '--menu-item-image-size': '120px', // Larger, showcase images
      '--menu-item-padding': '2.5rem',
      '--menu-item-border-radius': '0.75rem',
    },
    
    button: {
      '--button-border-radius': '0.5rem', // Not too rounded
      '--button-font-weight': '600',      // Semibold
      '--button-min-height': '48px',
      '--button-text-transform': 'none',   // Natural case
      '--button-letter-spacing': '0.025em', // Subtle spacing
    },
  },
};

export default restaurantTheme;