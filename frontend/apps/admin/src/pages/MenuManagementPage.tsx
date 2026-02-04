import { useState, useEffect } from 'react';
import { supabase } from '@pos/utils';

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  status: 'Available' | 'Unavailable';
  tenant_id: number;
  tenantName: string;
  created_at: string;
  updated_at: string;
}

interface Tenant {
  id: number;
  name: string;
}

export default function MenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);

  // Fetch tenants
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('id, name')
          .order('id', { ascending: true });
        
        if (error) throw error;
        setTenants(data || []);
      } catch (error) {
        console.error('Error fetching tenants:', error);
      }
    };

    fetchTenants();
  }, []);

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select(`
            id,
            name,
            category,
            price,
            status,
            tenant_id,
            created_at,
            updated_at
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;

        // Map data to include tenant name - will match with tenants list
        const mappedData = (data || []).map((item: any) => {
          const tenant = tenants.find(t => t.id === item.tenant_id);
          return {
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price,
            status: item.status,
            tenant_id: item.tenant_id,
            tenantName: tenant?.name || 'Unknown',
            created_at: item.created_at,
            updated_at: item.updated_at,
          };
        });

        setItems(mappedData);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [tenants]);

  const filteredItems = selectedTenant 
    ? items.filter(item => item.tenant_id === selectedTenant) 
    : items;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🍔 Daftar Menu</h1>
          <p className="text-slate-600 mt-1">Pantau menu dari semua tenant kasir</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <label className="font-semibold text-slate-700">Filter by Tenant:</label>
          <select
            value={selectedTenant ?? ''}
            onChange={(e) => setSelectedTenant(e.target.value ? parseInt(e.target.value) : null)}
            className="px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">📊 Semua Tenant</option>
            {tenants.map(tenant => (
              <option key={tenant.id} value={tenant.id}>
                🏢 {tenant.name}
              </option>
            ))}
          </select>
          {selectedTenant && (
            <button
              onClick={() => setSelectedTenant(null)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
            >
              ✕ Clear Filter
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: filteredItems.length.toString(), icon: '📦' },
          { label: 'Available', value: filteredItems.filter(i => i.status === 'Available').length.toString(), icon: '✅' },
          { label: 'Unavailable', value: filteredItems.filter(i => i.status === 'Unavailable').length.toString(), icon: '❌' },
          { label: 'Tenants', value: new Set(filteredItems.map(i => i.tenant_id)).size.toString(), icon: '🏢' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-slate-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Menu Item</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tenant</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="text-slate-500 mt-2">Loading menu items...</p>
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <p>Belum ada menu</p>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {item.tenantName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">Rp {item.price.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'Available' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
