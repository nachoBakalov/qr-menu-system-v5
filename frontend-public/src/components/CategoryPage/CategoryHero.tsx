import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryHero.scss';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface CategoryHeroProps {
  title: string;
  description?: string;
  backgroundImage?: string;
  breadcrumbs: BreadcrumbItem[];
  currentPage: string;
  className?: string;
}

const CategoryHero: React.FC<CategoryHeroProps> = ({
  title,
  description,
  backgroundImage,
  breadcrumbs,
  currentPage,
  className = ''
}) => {
  return (
    <div 
      className={`category-hero ${className}`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
      }}
    >
      <div className="category-hero__overlay"></div>
      
      <div className="category-hero__content">
        <h1 className="category-hero__title">{title}</h1>
        
        {description && (
          <p className="category-hero__description">{description}</p>
        )}
      </div>

      {/* Breadcrumb - Bottom Left Position */}
      <nav className="breadcrumb breadcrumb--bottom-left">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="breadcrumb__separator" aria-hidden="true">›</span>
            )}
            <Link to={item.href} className="breadcrumb__link touch-target">
              {item.label}
            </Link>
          </React.Fragment>
        ))}
        <span className="breadcrumb__separator" aria-hidden="true">›</span>
        <span className="breadcrumb__current">{currentPage}</span>
      </nav>
    </div>
  );
};

export default CategoryHero;