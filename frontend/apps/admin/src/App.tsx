import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@pos/utils';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TenantsPage from './pages/TenantsPage';
import MenuManagementPage from './pages/MenuManagementPage';
import OrdersPage from './pages/OrdersPage';
import StaffPage from './pages/StaffPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FinancePage from './pages/FinancePage';
import SettingsPage from './pages/SettingsPage';
import SecurityPage from './pages/SecurityPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function Sidebar({ currentPath }: { currentPath: string }) {
  const navItems = [
    { path: '/', label: '📊 Dashboard', icon: 'dashboard' },
    { path: '/tenants', label: '🏢 Tenants', icon: 'tenants' },
    { path: '/menu', label: '🍔 Menu', icon: 'menu' },
    { path: '/orders', label: '📋 Orders', icon: 'orders' },
    { path: '/staff', label: '👥 Staff', icon: 'staff' },
    { path: '/analytics', label: '📈 Analytics', icon: 'analytics' },
    { path: '/finance', label: '💰 Finance', icon: 'finance' },
    { path: '/settings', label: '⚙️ Settings', icon: 'settings' },
    { path: '/security', label: '🔒 Security', icon: 'security' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen">
      <nav className="py-6 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`block px-6 py-3 text-sm font-medium transition duration-200 ${
              currentPath === item.path
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

function LayoutWithNav({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const [currentPath, setCurrentPath] = React.useState('/');

  React.useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Nav */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 shadow-sm z-10">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📊</div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Logged in as</p>
                <p className="font-semibold text-slate-900">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition duration-200 shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex flex-1">
        <Sidebar currentPath={currentPath} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LayoutWithNav>
                  <Dashboard />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenants"
            element={
              <ProtectedRoute>
                <LayoutWithNav>
                  <TenantsPage />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <LayoutWithNav>
                  <MenuManagementPage />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <LayoutWithNav>
                  <OrdersPage />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <LayoutWithNav>
                  <StaffPage />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <LayoutWithNav>
                  <AnalyticsPage />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <LayoutWithNav>
                  <FinancePage />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <LayoutWithNav>
                  <SettingsPage />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/security"
            element={
              <ProtectedRoute>
                <LayoutWithNav>
                  <SecurityPage />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
