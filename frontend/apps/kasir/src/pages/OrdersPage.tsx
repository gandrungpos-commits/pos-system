import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAPIClient } from '@pos/api-client';
import type { RootState, AppDispatch } from '../store';
import { setMenuItems, setLoading as setMenuLoading } from '../store/menuSlice';
import { MenuGrid } from '../components/MenuGrid';
import { OrderCart } from '../components/OrderCart';
import { PaymentForm } from '../components/PaymentForm';
import { QRScanner } from '../components/QRScanner';

export function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedItems } = useSelector((state: RootState) => state.orders);
  const { items } = useSelector((state: RootState) => state.menu);
  const [activeTab, setActiveTab] = useState<'order' | 'payment' | 'scan'>('order');
  const [showPayment, setShowPayment] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [lastPaymentResult, setLastPaymentResult] = useState<any>(null);
  const [showCashierInfo, setShowCashierInfo] = useState(false);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    const apiClient = getAPIClient();
    dispatch(setMenuLoading(true));
    try {
      // Mock data for now
      const mockItems = [
        {
          id: '1',
          restaurant_id: 'rest-1',
          name: 'Nasi Goreng',
          description: 'Nasi goreng spesial',
          price: 25000,
          category: 'makanan',
          image_url: undefined,
          is_available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      dispatch(setMenuItems(mockItems));
    } catch (error) {
      console.error('Failed to load menu:', error);
    }
  };

  if (showPayment) {
    return (
      <div className="p-8">
        <button
          onClick={() => setShowPayment(false)}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Kembali
        </button>
        <PaymentForm
          amount={paymentAmount}
          onSuccess={(payment) => {
            console.log('Payment successful:', payment);
            setLastPaymentResult(payment);
            setShowPayment(false);
            setActiveTab('payment');
          }}
          onCancel={() => setShowPayment(false)}
        />
      </div>
    );
  }

  // Tab: Order
  const orderTab = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Header Bar */}
      <div className="lg:col-span-3 flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-pos-dark">Pesanan Baru</h1>
        <button
          onClick={() => setShowQRScanner(true)}
          className="btn-secondary"
        >
          📱 Scan Meja
        </button>
      </div>

      {/* Menu Grid */}
      <div className="lg:col-span-2">
        <MenuGrid />
      </div>

      {/* Order Cart */}
      <div className="lg:col-span-1">
        <OrderCart />
      </div>

      {/* QR Scanner */}
      {showQRScanner && (
        <QRScanner
          onScan={(result) => {
            console.log('Scanned:', result);
            setShowQRScanner(false);
          }}
        />
      )}
    </div>
  );

  // Tab: Payment
  const paymentTab = (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Method Selection */}
        <div className="card-lg">
          <h2 className="text-2xl font-bold mb-6">Metode Pembayaran</h2>
          <div className="space-y-3">
            {[
              { id: 'cash', label: 'Tunai', icon: '💵' },
              { id: 'card', label: 'Kartu Kredit', icon: '💳' },
              { id: 'e_wallet', label: 'E-Wallet', icon: '📱' },
              { id: 'bank', label: 'Transfer Bank', icon: '🏦' },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => {
                  setPaymentAmount(350000); // Example amount
                  setShowPayment(true);
                }}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-pos-primary hover:bg-pos-primary hover:bg-opacity-5 transition-all text-left"
              >
                <div className="text-2xl mb-2">{method.icon}</div>
                <div className="font-semibold">{method.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div className="card-lg">
          <h2 className="text-2xl font-bold mb-6">Pembayaran Terakhir</h2>
          {lastPaymentResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-xl font-bold text-green-600">✓ Berhasil</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Metode</p>
                <p className="font-semibold">{lastPaymentResult.method}</p>
              </div>
              {lastPaymentResult.reference && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Nomor Referensi</p>
                  <p className="font-mono text-sm">{lastPaymentResult.reference}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">💳</p>
              <p>Belum ada pembayaran</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Tab: QRIS/Payment Scan
  const scanTab = (
    <div className="max-w-2xl mx-auto">
      <div className="card-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Scan QRIS/Payment</h2>
        <div className="space-y-6">
          {/* QRIS Scanner Placeholder */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Scan QRIS Code</h3>
            <p className="text-gray-600 mb-6">
              Arahkan kamera ke QRIS code untuk memproses pembayaran
            </p>
            <button className="btn-primary">
              🎥 Aktifkan Kamera
            </button>
          </div>

          {/* Quick Test Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-secondary py-3">
              💳 Test QRIS Credit
            </button>
            <button className="btn-secondary py-3">
              📱 Test QRIS E-Wallet
            </button>
            <button className="btn-secondary py-3">
              🏦 Test QRIS Bank
            </button>
            <button className="btn-secondary py-3">
              🔗 Test QRIS Link
            </button>
          </div>

          {/* Last Scan Result */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <p className="text-sm text-gray-600 mb-2">Hasil Scan Terakhir</p>
            <p className="text-gray-400 text-center py-4">Belum ada scan</p>
          </div>
        </div>
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
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-white text-pos-primary rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              📊 Dashboard
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

      {/* Main Content */}
      <div className="p-8">
        {/* Tab Navigation */}
        <div className="max-w-full mb-8">
          <div className="flex gap-2 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('order')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'order'
                ? 'border-b-2 border-pos-primary text-pos-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ➕ Order
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'payment'
                ? 'border-b-2 border-pos-primary text-pos-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💳 Pembayaran
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'scan'
                ? 'border-b-2 border-pos-primary text-pos-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔍 Payment Scan
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'order' && orderTab}
      {activeTab === 'payment' && paymentTab}
      {activeTab === 'scan' && scanTab}
      </div>
    </div>
  );
}
