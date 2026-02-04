import { useState, useEffect } from 'react';
import { db } from '@pos/utils';

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  status: 'Available' | 'Unavailable';
  tenant_id: number;
  created_at: string;
  updated_at: string;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food' as const,
    price: 0,
    description: '',
    status: 'Available' as 'Available' | 'Unavailable',
  });

  // Get tenant ID from localStorage (set during login)
  useEffect(() => {
    const storedTenantId = localStorage.getItem('tenantId');
    if (storedTenantId) {
      setTenantId(parseInt(storedTenantId));
    }
  }, []);

  // Fetch menu items
  useEffect(() => {
    if (!tenantId) return;

    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        const { data, error } = await db
          .from('menu_items')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMenuItems(data || []);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [tenantId]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      // For now, we'll just show empty state
      // TODO: Implement menu_items fetch when table is fully set up
      // setMenuItems([]);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      category: item.category as 'Food',
      price: item.price,
      description: item.description,
      status: item.status,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setSaveLoading(true);
    try {
      const { error } = await db
        .from('menu_items')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      setMenuItems(menuItems.filter(item => item.id !== deleteId));
      setShowConfirm(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menghapus menu');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price <= 0 || !tenantId) {
      alert('Mohon isi nama dan harga');
      return;
    }

    setSaveLoading(true);
    try {
      if (editingId) {
        // Update
        const { error } = await db
          .from('menu_items')
          .update({
            name: formData.name,
            category: formData.category,
            price: formData.price,
            description: formData.description,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;

        setMenuItems(menuItems.map(item => 
          item.id === editingId 
            ? {
                ...item,
                name: formData.name,
                category: formData.category,
                price: formData.price,
                description: formData.description,
                status: formData.status,
              }
            : item
        ));
      } else {
        // Create
        const { data, error } = await db
          .from('menu_items')
          .insert({
            name: formData.name,
            category: formData.category,
            price: formData.price,
            description: formData.description,
            status: formData.status,
            tenant_id: tenantId,
          })
          .select();

        if (error) throw error;

        if (data && data[0]) {
          setMenuItems([data[0], ...menuItems]);
        }
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', category: 'Food', price: 0, description: '', status: 'Available' });
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menyimpan menu');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🍔 Manajemen Menu</h1>
          <p className="text-slate-600 mt-1">Kelola menu dan harga produk Anda</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', category: 'Food', price: 0, description: '', status: 'Available' });
          }}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
          {showForm ? '✕ Batal' : '+ Tambah Menu'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Menu', value: menuItems.length.toString(), icon: '📦' },
          { label: 'Tersedia', value: menuItems.filter(i => i.status === 'Available').length.toString(), icon: '✅' },
          { label: 'Tidak Tersedia', value: menuItems.filter(i => i.status === 'Unavailable').length.toString(), icon: '❌' },
          { label: 'Kategori', value: new Set(menuItems.map(i => i.category)).size.toString(), icon: '📊' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-slate-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">{editingId ? '✏️ Edit Menu' : '➕ Tambah Menu Baru'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Menu</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Contoh: Nasi Goreng Spesial"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Food">Food</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Add-on">Add-on</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Harga (Rp)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Available' | 'Unavailable' })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Available">Tersedia</option>
                  <option value="Unavailable">Tidak Tersedia</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Deskripsi menu (opsional)"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saveLoading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {saveLoading ? 'Menyimpan...' : editingId ? '💾 Update Menu' : '➕ Tambah Menu'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: '', category: 'Food', price: 0, description: '', available: true });
                }}
                className="flex-1 bg-slate-300 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-400 transition"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Menu Item</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Kategori</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Harga</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Deskripsi</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="text-slate-500 mt-2">Loading menu...</p>
                </td>
              </tr>
            ) : menuItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <p className="text-lg font-medium">Belum ada menu</p>
                  <p className="text-sm">Silahkan tambahkan menu terlebih dahulu</p>
                </td>
              </tr>
            ) : (
              menuItems.map((item) => (
                <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">Rp {item.price.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'Available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status === 'Available' ? '✅ Tersedia' : '❌ Tidak'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{item.description || '-'}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-700 font-medium">✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700 font-medium">🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">🗑️ Hapus Menu</h2>
            <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus menu ini? Tindakan ini tidak dapat dibatalkan.</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={saveLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {saveLoading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
