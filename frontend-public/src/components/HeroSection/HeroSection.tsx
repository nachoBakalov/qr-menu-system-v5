import React from 'react';
import type { Menu } from '../../types';
import { useTheme } from '../../themes/ThemeProvider';
import { getDefaultImage, shouldUseDefaultImage } from '../../constants/defaultImages';
import './HeroSection.scss';

interface HeroSectionProps {
  menu: Menu;
}

const HeroSection: React.FC<HeroSectionProps> = ({ menu }) => {
  console.log('🎯 HeroSection rendering with menu:', menu?.title);
  
  const { currentTheme } = useTheme();
  
  // Определя background изображението - приоритет на client heroImage, после theme default
  const backgroundImage = menu.client?.heroImage || getDefaultImage(currentTheme as any, 'hero');
  
  return (
    <section 
      className="hero-section"
      style={{
        '--hero-bg-image': `url(${backgroundImage})`,
      } as React.CSSProperties}
    >
      <div className="container">
        <div className="hero-section__content">
          {(menu.restaurantLogo || menu.client?.logo) && (
            <div className="hero-section__logo">
              <img 
                src={menu.restaurantLogo || menu.client?.logo} 
                alt={menu.title} 
                className="hero-section__logo-image"
                loading="eager"
              />
            </div>
          )}
          
          <h1 className="hero-section__title">{menu.title}</h1>
          
          {menu.description && (
            <p className="hero-section__description">{menu.description}</p>
          )}
          
          {menu.contactInfo && (
            <div className="hero-section__contact">
              {menu.contactInfo.address && (
                <div className="hero-section__contact-item">
                  <span className="hero-section__contact-icon" aria-label="Адрес">📍</span>
                  <span>{menu.contactInfo.address}</span>
                </div>
              )}
              
              {menu.contactInfo.phone && (
                <div className="hero-section__contact-item">
                  <span className="hero-section__contact-icon" aria-label="Телефон">📞</span>
                  <a href={`tel:${menu.contactInfo.phone}`}>{menu.contactInfo.phone}</a>
                </div>
              )}
              
              {menu.contactInfo.workingHours && (
                <div className="hero-section__contact-item">
                  <span className="hero-section__contact-icon" aria-label="Работно време">🕒</span>
                  <span>{menu.contactInfo.workingHours}</span>
                </div>
              )}
              
              {menu.contactInfo.website && (
                <div className="hero-section__contact-item">
                  <span className="hero-section__contact-icon" aria-label="Уебсайт">🌐</span>
                  <a href={menu.contactInfo.website} target="_blank" rel="noopener noreferrer">
                    {menu.contactInfo.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;