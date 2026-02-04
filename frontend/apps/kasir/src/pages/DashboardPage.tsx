import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAPIClient } from '@pos/api-client';
import type { RootState, AppDispatch } from '../store';
import type { RevenueSummary } from '@pos/types';
import { formatCurrency, formatDate } from '@pos/utils';

export function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [dailySummary, setDailySummary] = useState<RevenueSummary | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrder: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCashierInfo, setShowCashierInfo] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const apiClient = getAPIClient();
    try {
      // Mock data for demo
      const today = new Date().toISOString().split('T')[0];
      setDailySummary({
        date: today,
        total_orders: 25,
        total_amount: 750000,
        cash_amount: 500000,
        card_amount: 200000,
        e_wallet_amount: 50000,
        bank_transfer_amount: 0,
        discount_amount: 50000,
        average_order_value: 30000,
      });

      setStats({
        totalOrders: 25,
        totalRevenue: 750000,
        averageOrder: 30000,
        pendingOrders: 5,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
    <div className="card-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <p className="text-2xl font-bold text-pos-dark">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
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
              onClick={() => navigate('/settings')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              ⚙️ Pengaturan
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
      
      <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pos-dark mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Selamat datang, <span className="font-semibold">{user?.name || 'User'}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Pesanan" value={stats.totalOrders.toString()} icon="📦" />
        <StatCard
          label="Total Pendapatan"
          value={formatCurrency(stats.totalRevenue, 'IDR')}
          icon="💰"
        />
        <StatCard
          label="Rata-rata Pesanan"
          value={formatCurrency(stats.averageOrder, 'IDR')}
          icon="📊"
        />
        <StatCard label="Pesanan Pending" value={stats.pendingOrders.toString()} icon="⏳" />
      </div>

      {/* Daily Summary */}
      {dailySummary && (
        <div className="card-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Ringkasan Hari Ini</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Pesanan</p>
              <p className="text-2xl font-bold">{dailySummary.total_orders}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Pendapatan</p>
              <p className="text-2xl font-bold text-pos-primary">
                {formatCurrency(dailySummary.total_amount, 'IDR')}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Tunai</p>
              <p className="text-2xl font-bold">{formatCurrency(dailySummary.cash_amount, 'IDR')}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Kartu/Digital</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  dailySummary.card_amount + dailySummary.e_wallet_amount,
                  'IDR'
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/orders')}
          className="card-lg text-center hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-4xl mb-2">➕</div>
          <h3 className="font-semibold">Pesanan Baru</h3>
          <p className="text-sm text-gray-600 mt-1">Buat pesanan baru</p>
        </div>
        <div className="card-lg text-center opacity-50 cursor-not-allowed">
          <div className="text-4xl mb-2">📋</div>
          <h3 className="font-semibold">Riwayat</h3>
          <p className="text-sm text-gray-600 mt-1">Lihat riwayat pesanan</p>
        </div>
        <div
          onClick={() => navigate('/settings')}
          className="card-lg text-center hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-4xl mb-2">⚙️</div>
          <h3 className="font-semibold">Pengaturan</h3>
          <p className="text-sm text-gray-600 mt-1">Kelola pengaturan</p>
        </div>
      </div>
      </div>
    </div>
  );
}
