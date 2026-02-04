import { useState, useEffect } from 'react';
import { supabase } from '@pos/utils';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  date: string;
  tenant_id: number;
}

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      console.log('🔄 Fetching analytics data...');
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('tenant_id', 1);

      if (error) throw error;
      console.log('✅ Analytics data loaded');
      setTransactions(data || []);
    } catch (err) {
      console.error('❌ Error:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const todayRevenue = transactions
    .filter(t => t.type === 'Revenue' && t.date === new Date().toISOString().split('T')[0])
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyRevenue = transactions
    .filter(t => t.type === 'Revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">📈 Analytics</h1>
        <p className="text-slate-600 mt-1">Lihat analytics dan laporan penjualan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Daily Revenue', value: `Rp ${(todayRevenue / 1000000).toFixed(1)}M`, change: '+12%', icon: '📊', color: 'bg-green-500' },
          { label: 'Monthly Revenue', value: `Rp ${(monthlyRevenue / 1000000).toFixed(1)}M`, change: '+8%', icon: '💰', color: 'bg-blue-500' },
          { label: 'Avg Order Value', value: 'Rp 85K', change: '+5%', icon: '💵', color: 'bg-purple-500' },
          { label: 'Conversion Rate', value: '24%', change: '+3%', icon: '📈', color: 'bg-orange-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className={`${stat.color} h-2`}></div>
            <div className="p-6">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-slate-600 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
              <p className="text-xs text-green-600 font-semibold mt-1">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">💹 Revenue Trend (Weekly)</h3>
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
            <p className="text-slate-500">Chart placeholder - Revenue trend visualization</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">🍔 Top Selling Items</h3>
          <div className="space-y-3">
            {[
              { name: 'Nasi Goreng', sales: 342, progress: 85 },
              { name: 'Teh Manis', sales: 289, progress: 72 },
              { name: 'Mie Goreng', sales: 245, progress: 61 },
            ].map((item) => (
              <div key={item.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">{item.name}</span>
                  <span className="text-xs text-slate-600">{item.sales} sales</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
