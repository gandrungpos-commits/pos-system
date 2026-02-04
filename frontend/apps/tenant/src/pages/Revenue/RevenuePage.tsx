import { useState, useEffect } from 'react';
import { db } from '@pos/utils';

export default function RevenuePage() {
  const [period, setPeriod] = useState('month');
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    orderCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const orders = await db.getOrders();
        const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
        
        setRevenueData({
          totalRevenue,
          orderCount: orders?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Revenue Reports</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Total Revenue */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow p-8 text-white">
        <p className="text-green-100 text-sm font-medium">Total Revenue</p>
        <p className="text-4xl font-bold mt-2">{formatCurrency(revenueData.totalRevenue)}</p>
        <p className="text-green-100 mt-2">{revenueData.orderCount} orders</p>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Top Products</h2>
        <div className="space-y-4">
          {topProducts.map((product, idx) => (
            <div key={idx} className="flex items-center justify-between pb-4 border-b last:border-b-0">
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">Sold: {product.quantity} units</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Rp {product.revenue}</p>
                <div className="w-16 bg-gray-200 rounded h-2 mt-2">
                  <div
                    className="bg-green-500 h-2 rounded"
                    style={{ width: `${product.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">By Category</h2>
          <div className="space-y-3">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm font-medium">{cat.name}</span>
                <span className="font-semibold">Rp {cat.revenue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Peak Hours</h2>
          <div className="space-y-2">
            {peakHours.map((hour, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-sm font-medium w-12">{hour.time}</span>
                <div className="flex-1 bg-gray-200 rounded h-6">
                  <div
                    className="bg-blue-500 h-6 rounded flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${hour.traffic}%` }}
                  >
                    {hour.traffic > 20 && `${hour.traffic}%`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const topProducts = [
  { name: 'Ayam Goreng Spesial', quantity: 456, revenue: '22.8M', percentage: 100 },
  { name: 'Nasi Goreng Kampung', quantity: 389, revenue: '15.5M', percentage: 68 },
  { name: 'Tahu Goreng Tepung', quantity: 342, revenue: '10.3M', percentage: 45 },
  { name: 'Perkedel Kentang', quantity: 287, revenue: '5.7M', percentage: 25 },
];

const categories = [
  { name: 'Food', revenue: '32.5M' },
  { name: 'Beverages', revenue: '8.2M' },
  { name: 'Desserts', revenue: '3.1M' },
  { name: 'Add-ons', revenue: '1.4M' },
];

const peakHours = [
  { time: '09:00', traffic: 20 },
  { time: '11:00', traffic: 85 },
  { time: '12:00', traffic: 100 },
  { time: '13:00', traffic: 75 },
  { time: '14:00', traffic: 30 },
  { time: '18:00', traffic: 90 },
  { time: '19:00', traffic: 95 },
  { time: '20:00', traffic: 60 },
];
