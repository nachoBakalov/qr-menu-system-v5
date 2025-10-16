
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import MenusPage from './pages/MenusPage';
import CategoriesPage from './pages/CategoriesPage';
import MenuItemsPage from './pages/MenuItemsPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="menus" element={<MenusPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="menu-items" element={<MenuItemsPage />} />
          <Route path="qr-codes" element={<div className="p-6">QR Codes Page - Coming Soon</div>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
