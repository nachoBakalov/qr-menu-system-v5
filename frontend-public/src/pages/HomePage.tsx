import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { menuService } from '../services';
import { DEFAULT_CATEGORY_IMAGE } from '../constants/defaultImages';
import HeroSection from '../components/HeroSection';
import './HomePage.scss';

const HomePage: React.FC = () => {
  const { clientSlug } = useParams<{ clientSlug: string }>();

  const { 
    data: menu, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['menu', clientSlug],
    queryFn: () => menuService.getMenuBySlug(clientSlug!),
    enabled: !!clientSlug,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Log menu data for debugging
  React.useEffect(() => {
    console.log('🔍 HomePage state:', { isLoading, error: error?.message, hasMenu: !!menu, clientSlug });
    if (menu) {
      console.log('🍽️ Menu loaded:', {
        title: menu.title,
        template: menu.template?.name,
        categories: menu.categories?.length,
        client: menu.client?.name
      });
    }
  }, [menu, isLoading, error, clientSlug]);

  if (isLoading) {
    return (
      <div className="home-page">
        <div className="container">
          <div className="loading">
            <div className="loading__spinner"></div>
            <p className="loading__text">Зареждане на менюто...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="home-page">
        <div className="container">
          <div className="error">
            <h1 className="error__title">Грешка</h1>
            <p className="error__message">{error instanceof Error ? error.message : 'Менюто не може да бъде заредено'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <HeroSection menu={menu} />

      {/* Menu Categories */}
      <section className="menu-section">
        <div className="container">
          <h2 className="menu-section__title">Нашето Меню</h2>
          
          <div className="categories-grid grid-responsive grid-2-mobile-lg grid-3 grid-4">
            {menu.categories
              .filter(category => category.isActive)
              .sort((a, b) => a.order - b.order)
              .map((category) => {
                const backgroundImage = category.image || DEFAULT_CATEGORY_IMAGE;
                return (
                  <Link 
                    key={category.id} 
                    to={`/menu/${clientSlug}/category/${category.id}`}
                    className="category-card touch-target"
                    style={{
                      backgroundImage: `url(${backgroundImage})`
                    }}
                    aria-label={`Преглед на категория ${category.name}`}
                  >
                    <div className="category-card__overlay"></div>
                    <div className="category-card__content">
                      <h3 className="category-card__title">{category.name}</h3>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;