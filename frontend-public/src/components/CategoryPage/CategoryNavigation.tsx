import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryNavigation.scss';

interface Category {
  id: number;
  name: string;
  image?: string;
  isActive: boolean;
  order: number;
  menuItemsCount?: number;
}

interface CategoryNavigationProps {
  categories: Category[];
  currentCategoryId: string;
  clientSlug: string;
}

const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  categories,
  currentCategoryId,
  clientSlug
}) => {
  const activeCategories = categories
    .filter(category => category.isActive)
    .sort((a, b) => a.order - b.order);

  if (activeCategories.length <= 1) {
    return null; // Don't show navigation if there's only one category or none
  }

  return (
    <div className="category-navigation">
      <div className="container">
        <div className="category-navigation__wrapper">
          <div className="category-navigation__scroll">
            <div className="category-navigation__tabs">
              {activeCategories.map((category) => {
                const isActive = category.id.toString() === currentCategoryId;
                
                return (
                  <Link
                    key={category.id}
                    to={`/menu/${clientSlug}/category/${category.id}`}
                    className={`category-nav-tab ${isActive ? 'category-nav-tab--active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {category.image && (
                      <span className="category-nav-tab__image">
                        <img src={category.image} alt="" />
                      </span>
                    )}
                    <span className="category-nav-tab__name">{category.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryNavigation;