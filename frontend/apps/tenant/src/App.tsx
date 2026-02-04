import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, NavLink } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';
import type { RootState } from './store';
import { LoginPage } from './pages/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import RevenuePage from './pages/Revenue/RevenuePage';
import MenuPage from './pages/Menu/MenuPage';
import OrdersPage from './pages/Orders/OrdersPage';
import StaffPage from './pages/Staff/StaffPage';
import SettingsPage from './pages/Settings/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = React.useState<boolean | null>(null);

  useEffect(() => {
    // Check if tenant code is stored in localStorage
    const tenantCode = localStorage.getItem('tenant_code');
    const tenantId = localStorage.getItem('tenantId');
    
    if (!tenantCode || !tenantId) {
      navigate('/');
      setHasAccess(false);
    } else {
      setHasAccess(true);
    }
  }, [navigate]);

  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return hasAccess ? <>{children}</> : <Navigate to="/" />;
}

function TenantLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);
  const [tenantName, setTenantName] = React.useState('');

  React.useEffect(() => {
    const tenantDataStr = localStorage.getItem('tenant_data');
    if (tenantDataStr) {
      try {
        const tenantData = JSON.parse(tenantDataStr);
        setTenantName(tenantData.name || '');
      } catch (err) {
        console.error('Error parsing tenant_data:', err);
      }
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('tenant_code');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('tenant_data');
    window.location.href = '/';
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
            <div>
              <h1 className="text-2xl font-bold text-pos-primary">🏪 GAN-POS</h1>
              {tenantName && <p className="text-sm text-gray-600 mt-1">{tenantName}</p>}
            </div>
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
      <Route path="/" element={<LoginPage />} />
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
