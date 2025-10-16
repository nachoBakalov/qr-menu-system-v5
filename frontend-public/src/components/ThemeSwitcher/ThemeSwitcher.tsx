import React from 'react';
import { useTheme } from '../../themes';
import './ThemeSwitcher.scss';

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, availableThemes, switchTheme, themeConfig, isLoading } = useTheme();

  if (isLoading) {
    return <div className="theme-switcher theme-switcher--loading">Зареждане...</div>;
  }

  return (
    <div className="theme-switcher">
      <h3 className="theme-switcher__title">Изберете тема</h3>
      
      <div className="theme-switcher__current">
        <strong>Текуща тема:</strong> {themeConfig?.displayName} ({currentTheme})
      </div>
      
      <div className="theme-switcher__buttons">
        {availableThemes.map((themeName) => (
          <button
            key={themeName}
            className={`theme-switcher__button ${currentTheme === themeName ? 'theme-switcher__button--active' : ''}`}
            onClick={() => switchTheme(themeName)}
            disabled={isLoading}
          >
            {themeName === 'universal' && '🌐 Универсален'}
            {themeName === 'burger-pizza' && '🍔 Бургер & Пица'}  
            {themeName === 'restaurant' && '🍷 Ресторант'}
          </button>
        ))}
      </div>

      <div className="theme-switcher__preview">
        <div className="preview-card">
          <div className="preview-card__header">
            <h4>Preview</h4>
          </div>
          <div className="preview-card__body">
            <p>Тестов текст с текущата тема</p>
            <button className="preview-button">Тестов бутон</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;