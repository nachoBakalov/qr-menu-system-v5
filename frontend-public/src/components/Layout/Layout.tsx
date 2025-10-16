import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header';
import './Layout.scss';

const Layout: React.FC = () => {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;