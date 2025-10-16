import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  console.log('🔒 [ProtectedRoute] Attempting to use useAuth...');
  const { isAuthenticated, isLoading } = useAuth();
  console.log('✅ [ProtectedRoute] useAuth successful:', { isAuthenticated, isLoading });
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex--center" style={{ minHeight: '100vh' }}>
        <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;