import React from 'react';
import { useParams } from 'react-router-dom';

const CategoryPage: React.FC = () => {
  const { clientSlug, categoryId } = useParams();

  return (
    <div className="category-page">
      <div className="container">
        <h1>Category Page</h1>
        <p>Client: {clientSlug}</p>
        <p>Category ID: {categoryId}</p>
        <p>🚧 Под разработка - ще бъде създадена в следващата фаза</p>
      </div>
    </div>
  );
};

export default CategoryPage;