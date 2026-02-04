import { useState, useEffect } from 'react';
import { db } from '@pos/utils';

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrder: 0,
    totalDiscount: 0,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<number>(1);

  // Get tenant ID from localStorage
  useEffect(() => {
    const storedTenantId = localStorage.getItem('tenantId');
    if (storedTenantId) {
      setTenantId(parseInt(storedTenantId));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch transactions data (using transactions table for revenue)
        const { data: transactionsData, error } = await db
          .from('transactions')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('type', 'Revenue')
          .order('date', { ascending: false });

        if (error) throw error;

        const ordersData = transactionsData || [];
        setOrders(ordersData);

        // Calculate stats
        const totalOrders = ordersData?.length || 0;
        const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
        const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const totalDiscount = 0; // Discount tracking akan ditambah nanti

        setStats({
          totalOrders,
          totalRevenue,
          avgOrder,
          totalDiscount,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchData();
    }
  }, [selectedPeriod, tenantId]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Orders"
          value={stats.totalOrders.toString()}
          change="+0%"
          icon="📦"
          color="blue"
        />
        <StatsCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          change="+0%"
          icon="💰"
          color="green"
        />
        <StatsCard
          label="Avg Order"
          value={formatCurrency(stats.avgOrder)}
          change="+0%"
          icon="📊"
          color="purple"
        />
        <StatsCard
          label="Discount"
          value={formatCurrency(stats.totalDiscount)}
          change="-0%"
          icon="🎯"
          color="red"
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-2">
          {orders.length > 0 ? (
            orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex justify-between items-center py-2 border-b"
              >
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <span className="font-semibold text-green-600">{formatCurrency(order.total_amount)}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  label,
  value,
  change,
  icon,
  color,
}: {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className={`rounded-lg p-6 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          <p className="text-xs mt-2">{change} from last period</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function PaymentMethod({
  name,
  value,
  color,
}: {
  name: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-sm font-semibold">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: value }}></div>
      </div>
    </div>
  );
}
