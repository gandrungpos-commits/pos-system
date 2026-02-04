import { useState, useEffect } from 'react';
import { supabase } from '@pos/utils';

interface Transaction {
  id: number;
  type: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  tenant_id: number;
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching transactions...');
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('tenant_id', 1)
        .order('date', { ascending: false });

      if (error) throw error;
      console.log('✅ Transactions loaded:', data);
      setTransactions(data || []);
    } catch (err) {
      console.error('❌ Error fetching transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = transactions
    .filter(t => t.type === 'Revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = Math.abs(transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0));

  const netProfit = totalRevenue - totalExpense;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">💰 Finance</h1>
        <p className="text-slate-600 mt-1">Kelola keuangan dan laporan finansial</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `Rp ${(totalRevenue / 1000000).toFixed(1)}M`, trend: '+15%', icon: '📈', color: 'bg-green-500' },
          { label: 'Total Expense', value: `Rp ${(totalExpense / 1000000).toFixed(1)}M`, trend: '+8%', icon: '📉', color: 'bg-red-500' },
          { label: 'Net Profit', value: `Rp ${(netProfit / 1000000).toFixed(1)}M`, trend: '+22%', icon: '💸', color: 'bg-blue-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className={`${stat.color} h-2`}></div>
            <div className="p-6">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-slate-600 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
              <p className={`text-xs font-semibold mt-1 ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">💹 Revenue vs Expense</h3>
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
            <p className="text-slate-500">Chart placeholder - Revenue vs Expense</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📋 Recent Transactions</h3>
          {loading ? (
            <p className="text-slate-600">Loading transactions...</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-slate-200 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{tx.category}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                      <p className="text-xs text-slate-600">{tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${tx.type === 'Revenue' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'Revenue' ? '+' : '-'}Rp {Math.abs(tx.amount).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
