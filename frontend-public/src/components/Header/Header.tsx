import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Header.scss';

const Header: React.FC = () => {
  const { clientSlug } = useParams();
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (clientSlug) {
      navigate(`/menu/${clientSlug}`);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header__content">
          <button 
            className="header__back-btn" 
            onClick={handleBackClick}
            aria-label="Назад към менюто"
          >
            ←
          </button>
          
          <div className="header__title">
            QR Меню
          </div>
          
          <div className="header__spacer"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;