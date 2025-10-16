import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import IndexPage from '../pages/IndexPage.tsx';
import HomePage from '../pages/HomePage.tsx';
import CategoryPage from '../pages/CategoryPage.tsx';
import MenuItemPage from '../pages/MenuItemPage.tsx';
import ErrorPage from '../pages/ErrorPage.tsx';
import Layout from '../components/Layout';

// Router конфигурация за публичния frontend
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <IndexPage />,
      },
      {
        path: 'menu/:clientSlug',
        element: <HomePage />,
      },
      {
        path: 'menu/:clientSlug/category/:categoryId',
        element: <CategoryPage />,
      },
      {
        path: 'menu/:clientSlug/item/:itemId',
        element: <MenuItemPage />,
      },
    ],
  },
  {
    path: '/404',
    element: <ErrorPage />,
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;