import React, { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { menuService } from '../services';
import { useTheme } from '../themes/ThemeProvider';
import { getDefaultImage } from '../constants/defaultImages';
import { 
  CategoryHero, 
  CategoryToolbar, 
  PriceRangeFilter, 
  MenuItemCard, 
  EmptyState,
  type PriceRange,
  type SortOption
} from '../components/CategoryPage';
import './CategoryPage.scss';

interface CategoryFilters {
  priceRange: PriceRange;
  allergens: string[];
  tags: string[];
  sortBy: SortOption;
}

const CategoryPage: React.FC = () => {
  const { clientSlug, categoryId } = useParams<{ clientSlug: string; categoryId: string }>();
  const { currentTheme } = useTheme();

  // State for filters and sorting
  const [filters, setFilters] = useState<CategoryFilters>({
    priceRange: { min: 0, max: 100 },
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
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
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
      <CategoryHero
        title={category.name}
        description={category.description}
        backgroundImage={categoryImage}
        breadcrumbs={[
          { label: menu.title, href: `/menu/${clientSlug}` }
        ]}
        currentPage={category.name}
      />

      {/* Main Content */}
      <div className="category-content">
        <div className="container">
          {/* Toolbar */}
          <CategoryToolbar
            itemsCount={filteredItems.length}
            sortBy={filters.sortBy}
            onSortChange={(sortBy) => setFilters(prev => ({ ...prev, sortBy }))}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            showMobileFilters={showMobileFilters}
            onToggleMobileFilters={() => setShowMobileFilters(!showMobileFilters)}
          />

          {/* Filter Panel */}
          {showFilters && (
            <div className="filter-panel">
              <h3>Филтри</h3>
              
              {/* Price Range Filter */}
              <div className="filter-group">
                <label className="filter-label">Ценови диапазон</label>
                <PriceRangeFilter
                  priceRange={filters.priceRange}
                  onPriceRangeChange={(range) => setFilters(prev => ({
                    ...prev,
                    priceRange: range
                  }))}
                />
              </div>

              {/* Clear Filters Button */}
              <div className="filter-actions">
                <button
                  onClick={() => setFilters({
                    priceRange: { min: 0, max: 100 },
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
              <MenuItemCard
                key={item.id}
                item={item}
                clientSlug={clientSlug!}
                onImageError={(e) => {
                  // Fallback to default image if item image fails
                  const defaultImage = getDefaultImage(currentTheme as any, 'menuItem');
                  (e.target as HTMLImageElement).src = defaultImage;
                }}
              />
            ))}
          </div>

          {/* Empty States */}
          {filteredItems.length === 0 && category?.menuItems && category.menuItems.length > 0 && (
            <EmptyState
              type="no-results"
              title="Няма продукти"
              message="Няма продукти, отговарящи на избраните филтри."
              actionLabel="Изчисти филтрите"
              onAction={() => setFilters({
                priceRange: { min: 0, max: 100 },
                allergens: [],
                tags: [],
                sortBy: 'order'
              })}
            />
          )}
          
          {/* No Items in Category */}
          {category?.menuItems && category.menuItems.length === 0 && (
            <EmptyState
              type="no-items"
              title="Празна категория"
              message="Тази категория все още няма добавени продукти."
              actionLabel="Върни се към менюто"
              actionHref={`/menu/${clientSlug}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;