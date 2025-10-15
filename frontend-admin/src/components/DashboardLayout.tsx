import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Клиенти', href: '/clients', icon: '🏢' },
    { name: 'Менюта', href: '/menus', icon: '📋' },
    { name: 'Категории', href: '/categories', icon: '📁' },
    { name: 'Продукти', href: '/menu-items', icon: '🍽️' },
    { name: 'QR Кодове', href: '/qr-codes', icon: '📱' },
  ];

  const isCurrentPath = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className={`dashboard__sidebar ${sidebarOpen ? 'dashboard__sidebar--open' : ''}`}>
        {sidebarOpen && (
          <div 
            className="dashboard__sidebar-overlay" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
        
        <div className="dashboard__sidebar-header">
          <h1>QR Menu Admin</h1>
        </div>
        
        <nav className="dashboard__sidebar-nav">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={isCurrentPath(item.href) ? 'active' : ''}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="icon">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="dashboard__main">
        {/* Header */}
        <header className="dashboard__header">
          <button
            className="dashboard__header-menu"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>

          <div className="dashboard__header-user">
            <span className="user-name">
              Здравей, {user?.name}
            </span>
            <button
              onClick={logout}
              className="logout-btn"
              title="Изход"
            >
              <span className="sr-only">Изход</span>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="dashboard__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;