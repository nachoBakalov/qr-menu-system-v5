import React, { useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { menuService } from '../services';
import { useTheme } from '../themes/ThemeProvider';
import { getDefaultImage } from '../constants/defaultImages';
import './MenuItemPage.scss';

const MenuItemPage: React.FC = () => {
  const { clientSlug, itemId } = useParams<{ 
    clientSlug: string; 
    itemId: string; 
  }>();
  const { currentTheme } = useTheme();
  
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  // Fetch menu data
  const { 
    data: menu, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['menu', clientSlug],
    queryFn: () => menuService.getMenuBySlug(clientSlug!),
    enabled: !!clientSlug,
    retry: 2,
  });

  // Find the current item and its category
  const { item, category } = useMemo(() => {
    if (!menu?.categories || !itemId) return { item: null, category: null };
    
    for (const cat of menu.categories) {
      const foundItem = cat.menuItems?.find(item => item.id.toString() === itemId);
      if (foundItem) {
        return { item: foundItem, category: cat };
      }
    }
    
    return { item: null, category: null };
  }, [menu, itemId]);

  // Get related items from the same category
  const relatedItems = useMemo(() => {
    if (!category?.menuItems || !item) return [];
    
    return category.menuItems
      .filter(relatedItem => 
        relatedItem.id !== item.id && 
        relatedItem.isActive
      )
      .slice(0, 4); // Show max 4 related items
  }, [category, item]);

  // Share functionality
  const handleShare = async () => {
    const url = window.location.href;
    const title = `${item?.name} - ${menu?.title}`;
    
    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title,
          text: item?.description,
          url,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        setShareMessage('Линкът е копиран в буфера!');
        setTimeout(() => setShareMessage(null), 3000);
      }
    } catch (error) {
      console.log('Share failed:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="menu-item-page">
        <div className="menu-item-page__loading">
          <div className="loading__spinner"></div>
          <p className="loading__text">Зареждане на продукта...</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !menu || !item || !category) {
    return <Navigate to={`/menu/${clientSlug}`} replace />;
  }

  const itemImage = item.image || getDefaultImage(currentTheme as any, 'menuItem');

  return (
    <div className="menu-item-page">
      {/* SEO Meta Info */}
      <div style={{ display: 'none' }}>
        <h1>{item.name}</h1>
        <meta name="description" content={item.description || `${item.name} - ${menu.title}`} />
      </div>

      {/* Hero Image Section - Mobile First */}
      <div className="item-hero">
        <div className="item-hero__image-container">
          <img 
            src={itemImage}
            alt={`${item.name} - ${category.name}`}
            className="item-hero__image img-responsive"
            loading="eager"
            onError={(e) => {
              const defaultImage = getDefaultImage(currentTheme as any, 'menuItem');
              (e.target as HTMLImageElement).src = defaultImage;
            }}
          />
          <div className="item-hero__overlay"></div>
        </div>
        
        {/* Breadcrumb Navigation - Mobile Optimized */}
        <div className="item-hero__content">
          <nav className="breadcrumb" aria-label="Навигация">
            <Link 
              to={`/menu/${clientSlug}`} 
              className="breadcrumb__link touch-target"
              aria-label="Назад към основното меню"
            >
              {menu.title}
            </Link>
            <span className="breadcrumb__separator" aria-hidden="true">›</span>
            <Link 
              to={`/menu/${clientSlug}/category/${category.id}`} 
              className="breadcrumb__link touch-target"
              aria-label={`Назад към категория ${category.name}`}
            >
              {category.name}
            </Link>
            <span className="breadcrumb__separator" aria-hidden="true">›</span>
            <span className="breadcrumb__current">{item.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="item-content">
        <div className="container">
          {/* Back Button - Mobile Friendly */}
          <div className="back-navigation">
            <Link 
              to={`/menu/${clientSlug}/category/${category.id}`}
              className="btn btn--back touch-target"
              aria-label={`Назад към категория ${category.name}`}
            >
              ← Назад към {category.name}
            </Link>
          </div>

          <div className="item-details">
            {/* Product Header - Mobile Responsive */}
            <div className="item-header">
              <div className="item-header__main">
                <h1 className="item-header__title">{item.name}</h1>
                
                {/* Price Section - Mobile First */}
                <div className="item-header__prices">
                  <span className="price price--primary">
                    {item.priceBGN.toFixed(2)} лв
                  </span>
                  {item.priceEUR && (
                    <span className="price price--secondary">
                      {item.priceEUR.toFixed(2)} €
                    </span>
                  )}
                </div>
              </div>
              
              {/* Share Button - Touch Optimized */}
              <div className="item-header__actions">
                <button 
                  onClick={handleShare}
                  className="btn btn--outline btn--share touch-target"
                  aria-label="Споделете този продукт"
                >
                  <span className="btn__icon" aria-hidden="true">📤</span>
                  <span className="btn__text">Споделяне</span>
                </button>
              </div>
            </div>

            {/* Share Message */}
            {shareMessage && (
              <div className="share-message">
                ✅ {shareMessage}
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className="item-description">
                <h2 className="section-title">Описание</h2>
                <p className="description-text">{item.description}</p>
              </div>
            )}

            {/* Meta Information */}
            <div className="item-meta">
              <div className="meta-grid">
                {/* Weight */}
                {item.weight && (
                  <div className="meta-item">
                    <span className="meta-item__label">Тегло</span>
                    <span className="meta-item__value">
                      {item.weight}{item.weightUnit || 'г'}
                    </span>
                  </div>
                )}

                {/* Availability */}
                <div className="meta-item">
                  <span className="meta-item__label">Наличност</span>
                  <span className={`meta-item__value ${item.isActive ? 'available' : 'unavailable'}`}>
                    {item.isActive ? '✅ Налично' : '❌ Не е налично'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags and Allergens */}
            <div className="item-attributes">
              {/* Tags */}
              {item.tags && (
                <div className="attribute-section">
                  <h3 className="attribute-title">Особености</h3>
                  <div className="tags-list">
                    {item.tags.split(',').map(tag => tag.trim()).map((tag: string) => (
                      <span key={tag} className="tag tag--info">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergens */}
              {item.allergens && (
                <div className="attribute-section">
                  <h3 className="attribute-title">⚠️ Алергени</h3>
                  <div className="allergens-list">
                    {item.allergens.split(',').map(allergen => allergen.trim()).map((allergen: string) => (
                      <span key={allergen} className="tag tag--warning">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Related Items - Mobile Grid */}
            {relatedItems.length > 0 && (
              <div className="related-items">
                <h2 className="section-title">Други продукти от {category.name}</h2>
                <div className="related-items-grid grid-responsive grid-2-mobile-lg grid-3 grid-4">
                  {relatedItems.map((relatedItem) => (
                    <Link
                      key={relatedItem.id}
                      to={`/menu/${clientSlug}/item/${relatedItem.id}`}
                      className="related-item-card touch-target"
                      aria-label={`Преглед на ${relatedItem.name}`}
                    >
                      <div className="related-item-card__image aspect-ratio aspect-photo">
                        <img 
                          src={relatedItem.image || getDefaultImage(currentTheme as any, 'menuItem')}
                          alt={relatedItem.name}
                          loading="lazy"
                          className="img-responsive"
                          onError={(e) => {
                            const defaultImage = getDefaultImage(currentTheme as any, 'menuItem');
                            (e.target as HTMLImageElement).src = defaultImage;
                          }}
                        />
                      </div>
                      <div className="related-item-card__content">
                        <h4 className="related-item-card__title">{relatedItem.name}</h4>
                        <p className="related-item-card__price">
                          {relatedItem.priceBGN.toFixed(2)} лв
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemPage;