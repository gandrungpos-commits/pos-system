import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, NavLink } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';
import type { RootState } from './store';
import { useAuth } from '@pos/utils';
import { LoginPage } from './pages/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import RevenuePage from './pages/Revenue/RevenuePage';
import MenuPage from './pages/Menu/MenuPage';
import OrdersPage from './pages/Orders/OrdersPage';
import StaffPage from './pages/Staff/StaffPage';
import SettingsPage from './pages/Settings/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pos-primary border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function TenantLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [showMenu, setShowMenu] = React.useState(false);
  
  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-3xl hover:opacity-70 transition"
              title="Go to Dashboard"
            >
              📊
            </button>
            <h1 className="text-2xl font-bold text-pos-primary">🏪 GAN-POS Tenant</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Quick Access Buttons */}
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => navigate('/orders')}
                className="px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-100 transition"
                title="Orders"
              >
                📋 Orders
              </button>
              <button
                onClick={() => navigate('/menu')}
                className="px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-100 transition"
                title="Menu Management"
              >
                🍽️ Menu
              </button>
              <button
                onClick={() => navigate('/staff')}
                className="px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-100 transition"
                title="Staff Management"
              >
                👥 Staff
              </button>
              <button
                onClick={() => navigate('/revenue')}
                className="px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-100 transition"
                title="Revenue Reports"
              >
                📈 Revenue
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-100 transition"
                title="Settings"
              >
                ⚙️ Settings
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="relative md:hidden">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                ☰ Menu
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => { navigate('/dashboard'); setShowMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    📊 Dashboard
                  </button>
                  <button
                    onClick={() => { navigate('/orders'); setShowMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    📋 Orders
                  </button>
                  <button
                    onClick={() => { navigate('/menu'); setShowMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    🍽️ Menu
                  </button>
                  <button
                    onClick={() => { navigate('/staff'); setShowMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    👥 Staff
                  </button>
                  <button
                    onClick={() => { navigate('/revenue'); setShowMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    📈 Revenue
                  </button>
                  <button
                    onClick={() => { navigate('/settings'); setShowMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    ⚙️ Settings
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Full-width content */}
      <main className="p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <TenantLayout>
              <OrdersPage />
            </TenantLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <TenantLayout>
              <DashboardPage />
            </TenantLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/menu"
        element={
          <ProtectedRoute>
            <TenantLayout>
              <MenuPage />
            </TenantLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <TenantLayout>
              <StaffPage />
            </TenantLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/revenue"
        element={
          <ProtectedRoute>
            <TenantLayout>
              <RevenuePage />
            </TenantLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <TenantLayout>
              <SettingsPage />
            </TenantLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/orders" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppRoutes />
      </Router>
    </Provider>
  );
}
