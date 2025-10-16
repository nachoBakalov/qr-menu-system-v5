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
 * Burger & Pizza Theme - енергичен, casual дизайн
 * Подходящ за fast food заведения, бургер къщи, пицарии
 */
export const burgerPizzaTheme: ThemeConfig = {
  // Theme Meta
  name: 'burger-pizza',
  displayName: 'Бургер & Пица',
  description: 'Енергичен и забавен дизайн за fast food заведения',
  category: 'fast-food',
  
  // Colors (червено-жълта палитра)
  colors: {
    // Primary Colors - червено (класически fast food)
    primary: '#DC2626',        // Red 600
    primaryHover: '#B91C1C',   // Red 700  
    primaryLight: '#FEE2E2',   // Red 100
    primaryDark: '#991B1B',    // Red 800
    
    // Secondary Colors - жълто (McDonald's style)
    secondary: '#FBBF24',      // Amber 400
    secondaryHover: '#F59E0B', // Amber 500
    secondaryLight: '#FEF3C7', // Amber 100
    secondaryDark: '#D97706',  // Amber 600
    
    // Accent Colors - тъмно кафяво
    accent: '#92400E',         // Amber 800
    accentHover: '#78350F',    // Amber 900
    
    // Background Colors
    background: '#FFFBEB',     // Amber 50 (топло бяло)
    backgroundSecondary: '#FEF3C7', // Amber 100
    surface: '#FFFFFF',        // Pure white
    surfaceHover: '#FEF3C7',   // Amber 100
    
    // Text Colors
    text: '#1F2937',          // Gray 800 (по-меко черно)
    textSecondary: '#374151', // Gray 700
    textMuted: '#6B7280',     // Gray 500
    textInverse: '#FFFFFF',   // White
    
    // Border Colors
    border: '#FDE68A',        // Amber 200
    borderLight: '#FEF3C7',   // Amber 100
    borderDark: '#F59E0B',    // Amber 500
    
    // Status Colors
    success: '#10B981',       // Green 500
    warning: '#F59E0B',       // Amber 500
    error: '#DC2626',         // Red 600
    info: '#3B82F6',         // Blue 500
    
    // Special Colors
    headerBg: '#DC2626',      // Red primary
    headerText: '#FFFFFF',    // White
    footerBg: '#1F2937',     // Dark gray
    footerText: '#D1D5DB',   // Light gray
  },
  
  // Typography (с по-playful шрифтове)
  typography: {
    ...baseTypography,
    headingFont: '"Nunito", "Comic Neue", "SF Pro Display", -apple-system, sans-serif',
    bodyFont: '"Open Sans", "SF Pro Text", -apple-system, sans-serif',
    
    // Overriding font weights за по-bold look
    fontWeight: {
      ...baseTypography.fontWeight,
      normal: 500,  // Medium instead of normal
      medium: 600,  // Semibold instead of medium
      bold: 800,    // Extrabold instead of bold
    },
  },
  
  // Design Tokens
  spacing: baseSpacing,
  
  // По-закръглени border radius-и за fun look
  borderRadius: {
    ...baseBorderRadius,
    base: '0.5rem',   // 8px instead of 4px
    md: '0.75rem',    // 12px instead of 6px
    lg: '1rem',       // 16px instead of 8px
    xl: '1.5rem',     // 24px instead of 12px
    '2xl': '2rem',    // 32px instead of 16px
  },
  
  // По-драматични shadows
  shadows: {
    ...baseShadows,
    base: '0 4px 6px -1px rgba(220, 38, 38, 0.1), 0 2px 4px -1px rgba(220, 38, 38, 0.06)',
    md: '0 10px 15px -3px rgba(220, 38, 38, 0.1), 0 4px 6px -2px rgba(220, 38, 38, 0.05)',
    lg: '0 20px 25px -5px rgba(220, 38, 38, 0.1), 0 10px 10px -5px rgba(220, 38, 38, 0.04)',
  },
  
  breakpoints: baseBreakpoints,
  zIndex: baseZIndex,
  
  // По-бързи анимации за energetic feel
  transitions: {
    ...baseTransitions,
    all: 'all 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bouncy
    default: 'all 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    transform: 'transform 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // CSS Variables за Burger/Pizza theme
  cssVariables: {
    // Container
    '--container-max-width': '1200px',
    '--container-padding': 'clamp(1rem, 4vw, 2.5rem)',
    
    // RGB Values за overlay effects
    '--color-primary-rgb': '220, 38, 38',
    '--color-primary-dark-rgb': '153, 27, 27',
    
    // Header
    '--header-height': 'clamp(70px, 10vw, 90px)', // По-висок header
    '--header-shadow': '0 4px 12px rgba(220, 38, 38, 0.2)',
    
    // Hero Section (енергичен градиент)
    '--hero-gradient': 'linear-gradient(135deg, #DC2626 0%, #FBBF24 50%, #DC2626 100%)',
    '--hero-text-shadow': '0 3px 6px rgba(0, 0, 0, 0.3)',
    
    // Cards (по-playful анимации)
    '--card-hover-transform': 'translateY(-8px) scale(1.02)',
    '--card-transition': 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    
    // Animations (по-бързо и по-енергично)
    '--animation-duration-fast': '100ms',
    '--animation-duration-normal': '200ms',
    '--animation-duration-slow': '350ms',
    '--animation-easing': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    
    // Pattern backgrounds
    '--pattern-dots': 'radial-gradient(circle at 2px 2px, rgba(251, 191, 36, 0.1) 1px, transparent 0)',
    '--pattern-size': '20px 20px',
  },
  
  // Component-specific styling
  components: {
    header: {
      '--header-backdrop-filter': 'none', // По-solid header
      '--header-bg-opacity': '1',
      '--header-border-bottom': '4px solid #FBBF24',
    },
    
    hero: {
      '--hero-min-height': 'clamp(500px, 60vh, 700px)', // По-висока hero секция
      '--hero-content-max-width': '700px',
      '--hero-pattern': 'var(--pattern-dots)',
      '--hero-pattern-size': 'var(--pattern-size)',
    },
    
    categoryCard: {
      '--category-card-aspect-ratio': '1 / 1', // Square cards
      '--category-card-border-width': '3px',
      '--category-card-hover-scale': '1.08', // По-драматичен hover
      '--category-card-border-color': 'var(--secondary)',
    },
    
    menuItem: {
      '--menu-item-image-size': '100px', // По-големи изображения
      '--menu-item-padding': '2rem',
      '--menu-item-border-radius': '1rem',
    },
    
    button: {
      '--button-border-radius': '2rem', // Pill buttons
      '--button-font-weight': '700',    // Bold text
      '--button-min-height': '48px',    // По-големи бутони
      '--button-text-transform': 'uppercase',
      '--button-letter-spacing': '0.05em',
    },
  },
};

export default burgerPizzaTheme;