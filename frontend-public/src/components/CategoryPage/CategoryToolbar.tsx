import React from 'react';
import './CategoryToolbar.scss';

export type SortOption = 'name' | 'price-asc' | 'price-desc' | 'order';

interface CategoryToolbarProps {
  itemsCount: number;
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  showMobileFilters: boolean;
  onToggleMobileFilters: () => void;
  className?: string;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'order', label: 'По ред' },
  { value: 'name', label: 'По име' },
  { value: 'price-asc', label: 'Цена: ниска към висока' },
  { value: 'price-desc', label: 'Цена: висока към ниска' }
];

const CategoryToolbar: React.FC<CategoryToolbarProps> = ({
  itemsCount,
  sortBy,
  onSortChange,
  showFilters,
  onToggleFilters,
  showMobileFilters,
  onToggleMobileFilters,
  className = ''
}) => {
  return (
    <>
      {/* Main Toolbar */}
      <div className={`category-toolbar ${className}`}>
        <div className="category-toolbar__left">
          <span className="items-count">
            {itemsCount} продукта
          </span>
        </div>
        
        <div className="category-toolbar__right">
          {/* Sort Dropdown - Desktop */}
          <select 
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="sort-select desktop-only"
            aria-label="Подреди продуктите"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Mobile Actions */}
          <div className="mobile-actions">
            <button
              onClick={onToggleMobileFilters}
              className={`mobile-button mobile-button--sort ${showMobileFilters ? 'mobile-button--active' : ''}`}
              aria-label="Покажи опции за сортиране"
            >
              ⇅ 
            </button>
            
            <button
              onClick={onToggleFilters}
              className={`mobile-button mobile-button--filter ${showFilters ? 'mobile-button--active' : ''}`}
              aria-label="Покажи филтри"
            >
              🔍
            </button>
          </div>

          {/* Desktop Filter Toggle */}
          <button
            onClick={onToggleFilters}
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
              onClick={onToggleMobileFilters}
              className="close-button"
              aria-label="Затвори панела за сортиране"
            >
              ✕
            </button>
          </div>
          <div className="mobile-sort-options">
            {SORT_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  onToggleMobileFilters();
                }}
                className={`sort-option ${sortBy === option.value ? 'sort-option--active' : ''}`}
              >
                {option.label}
                {sortBy === option.value && <span className="check-mark">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryToolbar;