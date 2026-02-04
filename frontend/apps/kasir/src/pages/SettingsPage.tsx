import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAPIClient } from '@pos/api-client';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [showCashierInfo, setShowCashierInfo] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Yakin ingin logout?')) {
      const apiClient = getAPIClient();
      setLoading(true);
      try {
        await apiClient.logout();
        dispatch(logout());
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const SettingSection = ({
    title,
    items,
  }: {
    title: string;
    items: Array<{ label: string; value?: string; action?: () => void }>;
  }) => (
    <div className="card-lg mb-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center pb-3 border-b last:border-b-0">
            <span className="text-gray-700">{item.label}</span>
            {item.value && <span className="text-gray-900 font-medium">{item.value}</span>}
            {item.action && (
              <button onClick={item.action} className="text-pos-secondary hover:text-teal-700">
                →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-gradient-to-r from-pos-primary to-blue-700 border-b border-blue-800 sticky top-0 z-10 text-white">
        <div className="p-4 flex justify-between items-center">
          {/* Left: App Name */}
          <div className="flex items-center gap-4">
            <div>
              <div className="text-2xl font-bold">🎫 GAN-POS</div>
              <div className="text-sm text-blue-100">Mall Samarinda</div>
            </div>
          </div>

          {/* Center: Kasir Name (clickable for info) */}
          <button
            onClick={() => setShowCashierInfo(true)}
            className="text-center hover:bg-white hover:bg-opacity-10 px-6 py-2 rounded transition-colors"
          >
            <div className="text-sm text-blue-100">👤 Kasir</div>
            <div className="text-lg font-bold">{user?.name || 'Kasir'}</div>
          </button>

          {/* Right: Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/orders')}
              className="px-4 py-2 bg-white text-pos-primary rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              🛒 Order
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              📊 Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Cashier Info Modal */}
      {showCashierInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-pos-dark mb-6">Informasi Kasir</h2>
            
            {/* Shift Info Grid */}
            <div className="space-y-4">
              {/* Nama */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">👤 Nama Kasir</div>
                <div className="text-xl font-bold text-pos-dark">{user?.name || 'Demo Kasir'}</div>
              </div>

              {/* Email */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">📧 Email</div>
                <div className="font-semibold text-gray-700">{user?.email || 'demo@pos.local'}</div>
              </div>

              {/* Role */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">🎯 Posisi</div>
                <div className="font-semibold text-gray-700">{user?.role === 'admin' ? 'Admin' : 'Kasir'}</div>
              </div>

              {/* Jam Mulai */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">🕐 Mulai Shift</div>
                <div className="font-semibold text-gray-700">09:00</div>
              </div>

              {/* Durasi */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">⏱️ Durasi Kerja</div>
                <div className="font-semibold text-gray-700">5 jam 30 menit</div>
              </div>

              {/* Transaksi */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">📦 Total Transaksi</div>
                <div className="font-semibold text-gray-700">25 transaksi</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  if (window.confirm('Ganti kasir? Data akan disimpan.')) {
                    navigate('/login');
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                🔄 Ganti Kasir
              </button>
              <button
                onClick={() => setShowCashierInfo(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-pos-dark mb-8">Pengaturan</h1>

      {/* Profil */}
      <SettingSection
        title="Profil"
        items={[
          { label: 'Nama', value: user?.name },
          { label: 'Email', value: user?.email },
          { label: 'Role', value: user?.role === 'admin' ? 'Admin' : 'Kasir' },
          { label: 'Restoran', value: user?.restaurant_id },
        ]}
      />

      {/* Aplikasi */}
      <SettingSection
        title="Aplikasi"
        items={[
          { label: 'Versi', value: '1.0.0' },
          { label: 'Build', value: '2026.02.03' },
          {
            label: 'Tentang',
            action: () => alert('POS System v1.0.0\n\nPoint of Sale System untuk manajemen pesanan'),
          },
        ]}
      />

      {/* Keamanan */}
      <SettingSection
        title="Keamanan"
        items={[
          {
            label: 'Logout',
            action: handleLogout,
          },
        ]}
      />

      {/* Button Actions */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-outline flex-1"
        >
          Kembali
        </button>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
      </div>
    </div>
  );
}
