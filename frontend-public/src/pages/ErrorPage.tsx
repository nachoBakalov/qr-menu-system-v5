import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';

interface RouteError {
  statusText?: string;
  message?: string;
  status?: number;
}

const ErrorPage: React.FC = () => {
  const error = useRouteError() as RouteError;
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="error-page">
      <div className="container">
        <div className="error-content">
          <h1>😔 Упс!</h1>
          <h2>Нещо се обърка</h2>
          
          <p>
            {error?.statusText || error?.message || 'Възникна неочаквана грешка'}
          </p>
          
          <button 
            onClick={handleGoHome}
            className="error-button"
          >
            Обратно към началото
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;