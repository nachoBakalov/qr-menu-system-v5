import React, { useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { menuService } from '../services';
import { useTheme } from '../themes/ThemeProvider';
import { getDefaultImage } from '../constants/defaultImages';
import './CategoryPage.scss';

interface CategoryFilters {
  priceRange: [number, number];
  allergens: string[];
  tags: string[];
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'order';
}

const CategoryPage: React.FC = () => {
  const { clientSlug, categoryId } = useParams<{ clientSlug: string; categoryId: string }>();
  const { currentTheme } = useTheme();

  // State for filters and sorting
  const [filters, setFilters] = useState<CategoryFilters>({
    priceRange: [0, 100],
    allergens: [],
    tags: [],
    sortBy: 'order'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  // Find the current category
  const category = useMemo(() => {
    if (!menu?.categories || !categoryId) return null;
    return menu.categories.find(cat => cat.id.toString() === categoryId);
  }, [menu, categoryId]);

  // Filter and sort menu items
  const filteredItems = useMemo(() => {
    if (!category?.menuItems) return [];

    let items = category.menuItems.filter(item => item.isActive);

    // Apply filters
    if (filters.allergens.length > 0) {
      items = items.filter(item => {
        if (!item.allergens) return true;
        const itemAllergens = item.allergens.split(',').map(a => a.trim());
        return !filters.allergens.some(allergen => 
          itemAllergens.includes(allergen)
        );
      });
    }

    if (filters.tags.length > 0) {
      items = items.filter(item => {
        if (!item.tags) return false;
        const itemTags = item.tags.split(',').map(t => t.trim());
        return filters.tags.some(tag => itemTags.includes(tag));
      });
    }

    // Price range filter
    items = items.filter(item => {
      const price = item.priceBGN;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Apply sorting
    switch (filters.sortBy) {
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name, 'bg'));
        break;
      case 'price-asc':
        items.sort((a, b) => a.priceBGN - b.priceBGN);
        break;
      case 'price-desc':
        items.sort((a, b) => b.priceBGN - a.priceBGN);
        break;
      case 'order':
      default:
        items.sort((a, b) => a.order - b.order);
        break;
    }

    return items;
  }, [category?.menuItems, filters]);

  // Loading state
  if (isLoading) {
    return (
      <div className="category-page">
        <div className="category-page__loading">
          <div className="loading__spinner"></div>
          <p>Зареждане на категорията...</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !menu || !category) {
    return <Navigate to={`/menu/${clientSlug}`} replace />;
  }

  const categoryImage = category.image || getDefaultImage(currentTheme as any, 'category');

  return (
    <div className="category-page">
      {/* Hero Section */}
      <div 
        className="category-hero"
        style={{
          backgroundImage: `url(${categoryImage})`
        }}
      >
        <div className="category-hero__overlay"></div>
        <div className="category-hero__content">
          {/* Category Title */}
          <h1 className="category-hero__title">{category.name}</h1>
          
          {/* Category Description */}
          {category.description && (
            <p className="category-hero__description">{category.description}</p>
          )}
        </div>

        {/* Breadcrumb - Bottom Left Position */}
        <nav className="breadcrumb breadcrumb--bottom-left">
          <Link to={`/menu/${clientSlug}`} className="breadcrumb__link touch-target">
            {menu.title}
          </Link>
          <span className="breadcrumb__separator" aria-hidden="true">›</span>
          <span className="breadcrumb__current">{category.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="category-content">
        <div className="container">
          {/* Mobile Toolbar */}
          <div className="category-toolbar">
            <div className="category-toolbar__left">
              <span className="items-count">
                {filteredItems.length} продукта
              </span>
            </div>
            
            <div className="category-toolbar__right">
              {/* Sort Dropdown - Desktop */}
              <select 
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  sortBy: e.target.value as CategoryFilters['sortBy']
                }))}
                className="sort-select desktop-only"
                aria-label="Подреди продуктите"
              >
                <option value="order">По ред</option>
                <option value="name">По име</option>
                <option value="price-asc">Цена: ниска към висока</option>
                <option value="price-desc">Цена: висока към ниска</option>
              </select>

              {/* Mobile Actions */}
              <div className="mobile-actions">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className={`mobile-button mobile-button--sort ${showMobileFilters ? 'mobile-button--active' : ''}`}
                  aria-label="Покажи опции за сортиране"
                >
                  ⇅ 
                </button>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`mobile-button mobile-button--filter ${showFilters ? 'mobile-button--active' : ''}`}
                  aria-label="Покажи филтри"
                >
                  🔍
                </button>
              </div>

              {/* Desktop Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`filter-toggle desktop-only ${showFilters ? 'filter-toggle--active' : ''}`}
                aria-label="Покажи/скрий филтри"
              >
                🔍 Филтри
              </button>
            </div>
          </div>

          {/* Mobile Sort Panel */}
          {showMobileFilters && (
            <div className="mobile-sort-panel">
              <div className="mobile-sort-panel__header">
                <h3>Подреди по:</h3>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="close-button"
                  aria-label="Затвори панела за сортиране"
                >
                  ✕
                </button>
              </div>
              <div className="mobile-sort-options">
                {[
                  { value: 'order', label: 'По ред' },
                  { value: 'name', label: 'По име' },
                  { value: 'price-asc', label: 'Цена: ниска към висока' },
                  { value: 'price-desc', label: 'Цена: висока към ниска' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, sortBy: option.value as CategoryFilters['sortBy'] }));
                      setShowMobileFilters(false);
                    }}
                    className={`sort-option ${filters.sortBy === option.value ? 'sort-option--active' : ''}`}
                  >
                    {option.label}
                    {filters.sortBy === option.value && <span className="check-mark">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter Panel */}
          {showFilters && (
            <div className="filter-panel">
              <h3>Филтри</h3>
              
              {/* Price Range Filter */}
              <div className="filter-group">
                <label className="filter-label">Ценови диапазон</label>
                <div className="price-range-filter">
                  <div className="price-range-inputs">
                    <div className="price-input-group">
                      <label htmlFor="minPrice" className="sr-only">Минимална цена</label>
                      <input
                        id="minPrice"
                        type="number"
                        min="0"
                        max="999"
                        step="0.50"
                        value={filters.priceRange[0]}
                        onChange={(e) => {
                          const minPrice = Math.max(0, parseFloat(e.target.value) || 0);
                          setFilters(prev => ({
                            ...prev,
                            priceRange: [minPrice, Math.max(minPrice, prev.priceRange[1])]
                          }));
                        }}
                        className="price-input"
                        placeholder="От"
                      />
                      <span className="price-currency">лв</span>
                    </div>
                    
                    <span className="price-separator">до</span>
                    
                    <div className="price-input-group">
                      <label htmlFor="maxPrice" className="sr-only">Максимална цена</label>
                      <input
                        id="maxPrice"
                        type="number"
                        min="0"
                        max="999"
                        step="0.50"
                        value={filters.priceRange[1]}
                        onChange={(e) => {
                          const maxPrice = Math.max(0, parseFloat(e.target.value) || 0);
                          setFilters(prev => ({
                            ...prev,
                            priceRange: [Math.min(prev.priceRange[0], maxPrice), maxPrice]
                          }));
                        }}
                        className="price-input"
                        placeholder="До"
                      />
                      <span className="price-currency">лв</span>
                    </div>
                  </div>
                  
                  <div className="price-range-display">
                    <span className="price-range-text">
                      {filters.priceRange[0].toFixed(2)} лв - {filters.priceRange[1].toFixed(2)} лв
                    </span>
                  </div>
                  
                  {/* Quick Price Ranges */}
                  <div className="price-quick-filters">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, 10] }))}
                      className={`price-quick-btn ${filters.priceRange[0] === 0 && filters.priceRange[1] === 10 ? 'price-quick-btn--active' : ''}`}
                    >
                      До 10 лв
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, priceRange: [10, 20] }))}
                      className={`price-quick-btn ${filters.priceRange[0] === 10 && filters.priceRange[1] === 20 ? 'price-quick-btn--active' : ''}`}
                    >
                      10-20 лв
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, priceRange: [20, 50] }))}
                      className={`price-quick-btn ${filters.priceRange[0] === 20 && filters.priceRange[1] === 50 ? 'price-quick-btn--active' : ''}`}
                    >
                      20-50 лв
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, priceRange: [50, 999] }))}
                      className={`price-quick-btn ${filters.priceRange[0] === 50 && filters.priceRange[1] === 999 ? 'price-quick-btn--active' : ''}`}
                    >
                      Над 50 лв
                    </button>
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="filter-actions">
                <button
                  onClick={() => setFilters({
                    priceRange: [0, 100],
                    allergens: [],
                    tags: [],
                    sortBy: 'order'
                  })}
                  className="btn btn--outline btn--sm"
                >
                  Изчисти филтрите
                </button>
              </div>
            </div>
          )}

          {/* Menu Items Grid - Mobile First */}
          <div className="menu-items-grid grid-responsive grid-2-mobile-lg grid-3 grid-auto-desktop">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu-item-card touch-target">
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
                        onError={(e) => {
                          // Fallback to default image if item image fails
                          const defaultImage = getDefaultImage(currentTheme as any, 'menuItem');
                          (e.target as HTMLImageElement).src = defaultImage;
                        }}
                      />
                    ) : (
                      <img 
                        src={getDefaultImage(currentTheme as any, 'menuItem')} 
                        alt={item.name}
                        loading="lazy"
                      />
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
                    <div className="menu-item-card__meta">
                      {item.tags && (
                        <div className="menu-item-card__tags">
                          {item.tags.split(',').map(tag => tag.trim()).slice(0, 3).map((tag: string) => (
                            <span key={tag} className="tag tag--info">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {item.allergens && (
                        <div className="menu-item-card__allergens">
                          {item.allergens.split(',').map(allergen => allergen.trim()).slice(0, 2).map((allergen: string) => (
                            <span key={allergen} className="tag tag--warning" title={`Съдържа: ${allergen}`}>
                              ⚠️ {allergen}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && category?.menuItems && category.menuItems.length > 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">🔍</div>
              <h3>Няма продукти</h3>
              <p>Няма продукти, отговарящи на избраните филтри.</p>
              <button 
                onClick={() => setFilters({
                  priceRange: [0, 100],
                  allergens: [],
                  tags: [],
                  sortBy: 'order'
                })}
                className="btn btn--secondary"
              >
                Изчисти филтрите
              </button>
            </div>
          )}
          
          {/* No Items in Category */}
          {category?.menuItems && category.menuItems.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">🍽️</div>
              <h3>Празна категория</h3>
              <p>Тази категория все още няма добавени продукти.</p>
              <Link to={`/menu/${clientSlug}`} className="btn btn--secondary">
                Върни се към менюто
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;