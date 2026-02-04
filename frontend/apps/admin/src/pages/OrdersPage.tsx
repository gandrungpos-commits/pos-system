import { useState } from 'react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

interface Order {
  id: number;
  orderNo: string;
  customer: string;
  amount: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  date: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    { id: 1, orderNo: '#ORD-2024-001', customer: 'John Doe', amount: 85000, status: 'Completed', date: '2024-02-01' },
    { id: 2, orderNo: '#ORD-2024-002', customer: 'Jane Smith', amount: 120000, status: 'In Progress', date: '2024-02-02' },
    { id: 3, orderNo: '#ORD-2024-003', customer: 'Bob Johnson', amount: 65000, status: 'Pending', date: '2024-02-02' },
    { id: 4, orderNo: '#ORD-2024-004', customer: 'Alice Brown', amount: 95000, status: 'Completed', date: '2024-02-02' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    status: 'Pending' as const,
  });

  const statuses = ['Pending', 'In Progress', 'Completed'];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const openEditModal = (order: Order) => {
    setFormData({ status: order.status });
    setEditingId(order.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingId) return;
    
    setIsLoading(true);
    try {
      setOrders(orders.map(o => 
        o.id === editingId 
          ? { ...o, status: formData.status }
          : o
      ));
      setShowModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    try {
      setOrders(orders.filter(o => o.id !== deleteId));
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteConfirm = (id: number) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const inProgressCount = orders.filter(o => o.status === 'In Progress').length;
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">📋 Pesanan</h1>
        <p className="text-slate-600 mt-1">Kelola semua pesanan pelanggan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length.toString(), icon: '📦', color: 'bg-blue-500' },
          { label: 'Completed', value: completedCount.toString(), icon: '✅', color: 'bg-green-500' },
          { label: 'In Progress', value: inProgressCount.toString(), icon: '⏳', color: 'bg-blue-500' },
          { label: 'Total Revenue', value: `Rp ${(totalRevenue / 1000000).toFixed(1)}M`, icon: '💰', color: 'bg-purple-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className={`${stat.color} h-2`}></div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <p className="text-slate-600 text-sm">{stat.label}</p>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.orderNo}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{order.customer}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Rp {order.amount.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{order.date}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button 
                    onClick={() => openEditModal(order)}
                    className="text-blue-600 hover:text-blue-700 font-medium">Edit
                  </button>
                  <button 
                    onClick={() => openDeleteConfirm(order.id)}
                    className="text-red-600 hover:text-red-700 font-medium">Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Status Modal */}
      <Modal
        isOpen={showModal}
        title="Update Order Status"
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        isLoading={isLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ status: e.target.value as any })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        isLoading={isLoading}
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  );
}
