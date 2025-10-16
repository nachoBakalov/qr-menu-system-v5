import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ThemeConfig, ThemeContextType } from './core/types';
import { getThemeManager } from './ThemeManager';

/**
 * Theme Context за React компоненти
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  autoDetectFromTemplate?: string; // Template name за auto-detection
}

/**
 * Theme Provider Component
 * Осигурява theme context на цялото приложение
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'universal',
  autoDetectFromTemplate,
}) => {
  const [currentTheme, setCurrentTheme] = useState<string>('');
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const themeManager = getThemeManager();
  
  /**
   * Инициализира темите при mount
   */
  useEffect(() => {
    const initializeThemes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Получава списъка с теми
        const themes = themeManager.getAvailableThemes();
        setAvailableThemes(themes);
        
        // Определя коя тема да зареди
        let themeToLoad = defaultTheme;
        
        // 1. Auto-detect от template
        if (autoDetectFromTemplate) {
          themeToLoad = themeManager.getThemeByTemplate(autoDetectFromTemplate);
          console.log(`🎨 Auto-detected theme "${themeToLoad}" from template "${autoDetectFromTemplate}"`);
        }
        
        // 2. Запазена тема от localStorage
        const savedTheme = themeManager.getSavedTheme();
        if (savedTheme && themes.includes(savedTheme)) {
          themeToLoad = savedTheme;
          console.log(`🎨 Using saved theme "${themeToLoad}" from localStorage`);
        }
        
        // Зарежда и прилага темата
        await loadAndApplyTheme(themeToLoad);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize themes';
        console.error('❌ Theme initialization error:', errorMessage);
        setError(errorMessage);
        
        // Fallback към universal theme
        try {
          await loadAndApplyTheme('universal');
        } catch (fallbackErr) {
          console.error('❌ Fallback theme failed:', fallbackErr);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeThemes();
  }, [defaultTheme, autoDetectFromTemplate]);
  
  /**
   * Зарежда и прилага тема
   */
  const loadAndApplyTheme = async (themeName: string) => {
    try {
      const theme = await themeManager.loadTheme(themeName);
      themeManager.applyTheme(theme);
      
      setCurrentTheme(themeName);
      setThemeConfig(theme);
      setError(null);
      
      console.log(`✅ Theme "${theme.displayName}" loaded and applied`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to load theme "${themeName}"`;
      setError(errorMessage);
      throw err;
    }
  };
  
  /**
   * Превключва тема (за runtime switching)
   */
  const switchTheme = useCallback(async (themeName: string) => {
    if (themeName === currentTheme) {
      return; // Същата тема
    }
    
    if (!availableThemes.includes(themeName)) {
      const error = `Theme "${themeName}" not available. Available: ${availableThemes.join(', ')}`;
      setError(error);
      throw new Error(error);
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await loadAndApplyTheme(themeName);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to switch to theme "${themeName}"`;
      console.error('❌ Theme switching error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentTheme, availableThemes]);
  
  /**
   * Context value
   */
  const contextValue: ThemeContextType = {
    currentTheme,
    themeConfig: themeConfig!,
    availableThemes,
    switchTheme,
    isLoading,
    error,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook за използване на theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Hook за лесен достъп до theme colors
 */
export const useThemeColors = () => {
  const { themeConfig } = useTheme();
  return themeConfig?.colors;
};

/**
 * Hook за лесен достъп до theme typography
 */
export const useThemeTypography = () => {
  const { themeConfig } = useTheme();
  return themeConfig?.typography;
};

/**
 * Hook за проверка дали дадена тема е активна
 */
export const useIsThemeActive = (themeName: string) => {
  const { currentTheme } = useTheme();
  return currentTheme === themeName;
};

export default ThemeProvider;