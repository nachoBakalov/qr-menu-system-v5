import React from 'react';
import { useParams } from 'react-router-dom';

const MenuItemPage: React.FC = () => {
  const { clientSlug, itemId } = useParams();

  return (
    <div className="menu-item-page">
      <div className="container">
        <h1>Menu Item Page</h1>
        <p>Client: {clientSlug}</p>
        <p>Item ID: {itemId}</p>
        <p>🚧 Под разработка - ще бъде създадена в следващата фаза</p>
      </div>
    </div>
  );
};

export default MenuItemPage;