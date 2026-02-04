import { useState, useEffect } from 'react';
import { db } from '@pos/utils';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [tenantId, setTenantId] = useState<number>(1);
  const [newOrder, setNewOrder] = useState({
    customer: '',
    phone: '',
    items: [{ name: '', qty: 1 }],
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Get tenant ID from localStorage
  useEffect(() => {
    const storedTenantId = localStorage.getItem('tenantId');
    if (storedTenantId) {
      setTenantId(parseInt(storedTenantId));
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await db
        .from('transactions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchOrders();
    }
  }, [tenantId]);

  const filteredOrders = Array.isArray(orders) && statusFilter === 'all' 
    ? orders 
    : Array.isArray(orders) ? orders.filter(order => order.status === statusFilter) : [];

  const stats = {
    total: Array.isArray(orders) ? orders.length : 0,
    pending: Array.isArray(orders) ? orders.filter(o => o.status === 'pending').length : 0,
    completed: Array.isArray(orders) ? orders.filter(o => o.status === 'completed').length : 0,
    cancelled: Array.isArray(orders) ? orders.filter(o => o.status === 'cancelled').length : 0,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddOrder = async () => {
    if (!newOrder.customer.trim() || !newOrder.phone.trim() || newOrder.items.some(i => !i.name.trim())) {
      alert('Mohon isi semua field');
      return;
    }

    setSaveLoading(true);
    try {
      const total = newOrder.items.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
      const orderData = {
        order_number: `ORD-${Date.now()}`,
        tenant_id: 1, // Default to first tenant for demo
        customer_name: newOrder.customer,
        customer_phone: newOrder.phone,
        total_amount: 0,
        status: 'pending',
        payment_status: 'unpaid',
      };

      const response = await db.createOrder(orderData);
      if (response.error) {
        console.error('Error creating order:', response.error);
        alert('Gagal membuat pesanan');
      } else {
        setShowNewOrderModal(false);
        setNewOrder({ customer: '', phone: '', items: [{ name: '', qty: 1 }] });
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal membuat pesanan');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleVerifyOrder = (order: any) => {
    setSelectedOrder(order);
    setShowVerificationModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;

    setSaveLoading(true);
    try {
      const response = await db.updateOrder(selectedOrder.id, {
        status: 'completed',
        payment_status: 'paid',
      });
      if (response.error) {
        console.error('Error updating order:', response.error);
        alert('Gagal memperbarui pesanan');
      } else {
        setShowVerificationModal(false);
        setSelectedOrder(null);
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal memperbarui pesanan');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Pesanan Pelanggan</h1>
          <p className="text-gray-600 mt-1">Tempat masuk dan verifikasi pesanan dari pelanggan</p>
        </div>
        <button
          onClick={() => setShowNewOrderModal(true)}
          className="bg-pos-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
        >
          ➕ Pesanan Baru
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={stats.total} icon="📋" color="blue" />
        <StatCard label="Pending" value={stats.pending} icon="⏳" color="yellow" />
        <StatCard label="Completed" value={stats.completed} icon="✅" color="green" />
        <StatCard label="Cancelled" value={stats.cancelled} icon="❌" color="red" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          {['all', 'pending', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === status
                  ? 'bg-pos-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Pelanggan</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Waktu</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">#{order.id}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{order.customer}</p>
                    <p className="text-sm text-gray-500">{order.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx}>{item.qty}x {item.name}</div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-pos-primary">
                  Rp {order.total.toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{order.time}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleVerifyOrder(order)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      ✓ Verifikasi
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button className="text-green-600 font-medium">Siap</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Pesanan Baru</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pelanggan</label>
                <input
                  type="text"
                  value={newOrder.customer}
                  onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pos-primary"
                  placeholder="Masukkan nama pelanggan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor HP</label>
                <input
                  type="text"
                  value={newOrder.phone}
                  onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pos-primary"
                  placeholder="+62 8xx xxxx xxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Pesanan</label>
                {newOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <select
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...newOrder.items];
                        updated[idx].name = e.target.value;
                        setNewOrder({ ...newOrder, items: updated });
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    >
                      <option value="">Pilih menu</option>
                      {menuItems.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => {
                        const updated = [...newOrder.items];
                        updated[idx].qty = parseInt(e.target.value);
                        setNewOrder({ ...newOrder, items: updated });
                      }}
                      className="w-20 px-3 py-2 border rounded-lg"
                    />
                    {newOrder.items.length > 1 && (
                      <button
                        onClick={() => {
                          setNewOrder({
                            ...newOrder,
                            items: newOrder.items.filter((_: any, i: number) => i !== idx)
                          });
                        }}
                        className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setNewOrder({ ...newOrder, items: [...newOrder.items, { name: '', qty: 1 }] })}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Tambah Item
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleAddOrder}
                disabled={saveLoading}
                className="flex-1 px-4 py-2 bg-pos-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {saveLoading ? 'Menyimpan...' : 'Simpan Pesanan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">Verifikasi Pesanan</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-2"><strong>Nama:</strong> {selectedOrder.customer}</p>
              <p className="text-sm text-gray-600 mb-4"><strong>HP:</strong> {selectedOrder.phone}</p>
              
              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Item yang dipesan:</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.qty}x {item.name}</span>
                      <span>Rp {(parseInt(menuPrices[item.name] || '0') * item.qty).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4 flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold text-pos-primary text-lg">
                    Rp {selectedOrder.total.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">Apakah data pesanan sudah benar? Pesanan akan mulai diproses.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Koreksi
              </button>
              <button
                onClick={handleConfirmOrder}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✓ Konfirmasi & Proses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50',
    yellow: 'bg-yellow-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} rounded-lg p-6`}>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-2xl mt-2">{icon}</p>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'preparing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'pending':
      return 'Menunggu';
    case 'preparing':
      return 'Sedang Disiapkan';
    case 'completed':
      return 'Selesai';
    case 'cancelled':
      return 'Dibatalkan';
    default:
      return status;
  }
}

const menuItems = [
  'Ayam Geprek Sambal Matah',
  'Ayam Geprek Matah Asli',
  'Ayam Geprek Level Extreme',
  'Nasi Putih',
  'Nasi Merah',
  'Es Lemon',
  'Es Jeruk',
  'Jus Alpukat',
];

const menuPrices: Record<string, string> = {
  'Ayam Geprek Sambal Matah': '32000',
  'Ayam Geprek Matah Asli': '35000',
  'Ayam Geprek Level Extreme': '38000',
  'Nasi Putih': '5000',
  'Nasi Merah': '8000',
  'Es Lemon': '6000',
  'Es Jeruk': '6000',
  'Jus Alpukat': '12000',
};

const initialOrders = [
  {
    id: 1001,
    customer: 'Budi Santoso',
    phone: '+62 812 3456 7890',
    items: [
      { name: 'Ayam Geprek Sambal Matah', qty: 2 },
      { name: 'Nasi Putih', qty: 2 },
      { name: 'Es Lemon', qty: 2 },
    ],
    total: 82000,
    time: '14:32',
    status: 'completed',
  },
  {
    id: 1002,
    customer: 'Siti Nurhaliza',
    phone: '+62 811 2345 6789',
    items: [
      { name: 'Ayam Geprek Matah Asli', qty: 1 },
      { name: 'Nasi Merah', qty: 1 },
      { name: 'Es Jeruk', qty: 1 },
    ],
    total: 49000,
    time: '14:45',
    status: 'pending',
  },
  {
    id: 1003,
    customer: 'Ahmad Wijaya',
    phone: '+62 813 4567 8901',
    items: [
      { name: 'Ayam Geprek Level Extreme', qty: 2 },
      { name: 'Nasi Putih', qty: 2 },
      { name: 'Jus Alpukat', qty: 2 },
    ],
    total: 105000,
    time: '15:10',
    status: 'preparing',
  },
  {
    id: 1004,
    customer: 'Rini Handoko',
    phone: '+62 814 5678 9012',
    items: [
      { name: 'Ayam Geprek Sambal Matah', qty: 1 },
      { name: 'Nasi Putih', qty: 1 },
      { name: 'Es Lemon', qty: 1 },
    ],
    total: 43000,
    time: '15:20',
    status: 'pending',
  },
  {
    id: 1005,
    customer: 'Eko Prasetyo',
    phone: '+62 815 6789 0123',
    items: [
      { name: 'Ayam Geprek Matah Asli', qty: 1 },
      { name: 'Nasi Merah', qty: 1 },
      { name: 'Es Jeruk', qty: 1 },
    ],
    total: 49000,
    time: '15:35',
    status: 'cancelled',
  },
];
