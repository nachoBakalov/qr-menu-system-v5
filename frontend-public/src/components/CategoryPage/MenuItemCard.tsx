import React from 'react';
import { Link } from 'react-router-dom';
import './MenuItemCard.scss';

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  image?: string;
  priceBGN: number;
  priceEUR?: number;
  weight?: number;
  weightUnit?: string;
  tags?: string;
  allergens?: string;
}

interface MenuItemCardProps {
  item: MenuItem;
  clientSlug: string;
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  className?: string;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  clientSlug,
  onImageError,
  className = ''
}) => {
  const parseStringList = (str?: string): string[] => {
    if (!str) return [];
    return str.split(',').map(s => s.trim()).filter(Boolean);
  };

  const tags = parseStringList(item.tags);
  const allergens = parseStringList(item.allergens);

  return (
    <div className={`menu-item-card touch-target ${className}`}>
      <Link 
        to={`/menu/${clientSlug}/item/${item.id}`}
        className="menu-item-card__link"
        aria-label={`Преглед на ${item.name}`}
      >
        {/* Item Image */}
        <div className="menu-item-card__image">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name}
              loading="lazy"
              onError={onImageError}
            />
          ) : (
            <div className="menu-item-card__placeholder">
              <span className="placeholder-icon">🍽️</span>
            </div>
          )}
        </div>

        {/* Item Info */}
        <div className="menu-item-card__info">
          <h3 className="menu-item-card__name">{item.name}</h3>
          
          {item.description && (
            <p className="menu-item-card__description">
              {item.description}
            </p>
          )}

          <div className="menu-item-card__footer">
            <div className="menu-item-card__prices">
              <span className="menu-item-card__price menu-item-card__price--primary">
                {item.priceBGN.toFixed(2)} лв
              </span>
              {item.priceEUR && (
                <span className="menu-item-card__price menu-item-card__price--secondary">
                  {item.priceEUR.toFixed(2)} €
                </span>
              )}
            </div>
            
            {item.weight && (
              <span className="menu-item-card__weight">
                {item.weight}{item.weightUnit || 'г'}
              </span>
            )}
          </div>

          {/* Tags and Allergens */}
          {/* <div className="menu-item-card__meta">
            {tags.length > 0 && (
              <div className="menu-item-card__tags">
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag tag--info">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {allergens.length > 0 && (
              <div className="menu-item-card__allergens">
                {allergens.slice(0, 2).map((allergen) => (
                  <span key={allergen} className="tag tag--warning" title={`Съдържа: ${allergen}`}>
                    ⚠️ {allergen}
                  </span>
                ))}
              </div>
            )}
          </div> */}
        </div>
      </Link>
    </div>
  );
};

export default MenuItemCard;