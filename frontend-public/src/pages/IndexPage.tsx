import React from 'react';
import { Link } from 'react-router-dom';
import './IndexPage.scss';

const IndexPage: React.FC = () => {
  return (
    <div className="index-page">
      <div className="container">
        <div className="index-page__content">
          <h1 className="index-page__title">QR Menu System V5</h1>
          <p className="index-page__description">
            Добре дошли в новата система за QR менюта. Изберете меню за преглед:
          </p>
          
          <div className="demo-menus">
            <h2>Демо Менюта</h2>
            <div className="demo-menus__grid">
              <Link to="/menu/bellabonnita" className="demo-menu-card">
                <div className="demo-menu-card__icon">🍽️</div>
                <h3>Bella Bonnita</h3>
                <p>Ресторант меню от backend</p>
              </Link>
            </div>
          </div>
          
          <div className="info-section">
            <h3>За Разработчици</h3>
            <p>
              Използвайте URL формат: <code>/menu/&#123;clientSlug&#125;</code>
            </p>
            <p>
              Пример: <code>/menu/my-restaurant</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;