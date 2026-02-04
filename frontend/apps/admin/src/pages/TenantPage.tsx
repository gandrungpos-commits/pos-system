import React, { useState, useEffect } from 'react';
import { supabase } from '@pos/utils';

interface Tenant {
  id: number;
  name: string;
  code: string;
  location?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  subscriptionTier?: 'basic' | 'pro' | 'enterprise';
  created_at?: string;
}

export function TenantPage() {
  console.log('🟢 TenantPage component rendered');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    email: '',
    phone: '',
  });

  // Fetch tenants from Supabase
  useEffect(() => {
    console.log('⚙️ TenantPage useEffect triggered');
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching tenants from Supabase...');
      console.log('📍 Supabase client:', supabase ? 'OK' : 'MISSING');
      
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase Error:', error);
        throw error;
      }
      
      console.log('✅ Supabase Success! Tenants:', data);
      setTenants(data || []);
    } catch (err) {
      console.error('❌ Fetch Error (using mock):', err);
      console.log('📦 Loading mock data...');
      setLoading(false);
      
      const mockTenants: Tenant[] = [
        {
          id: 1,
          name: 'Ayam Geprek Pak Maksur',
          code: 'TENANT001',
          location: 'Samarinda Supermall, Food Court Lt. 3',
          email: 'ayamgeprek@samarindamall.id',
          phone: '+62-541-8888111',
          status: 'active',
          created_at: '2025-01-10T00:00:00Z',
        },
        {
          id: 2,
          name: 'Soto Makasar Asoy',
          code: 'TENANT002',
          location: 'Samarinda Supermall, Food Court Lt. 3',
          email: 'sotomakasar@samarindamall.id',
          phone: '+62-541-8888222',
          status: 'active',
          created_at: '2025-01-12T00:00:00Z',
        },
        {
          id: 3,
          name: 'Gado-Gado Mak Ijah',
          code: 'TENANT003',
          location: 'Samarinda Supermall, Food Court Lt. 3',
          email: 'gadogado@samarindamall.id',
          phone: '+62-541-8888333',
          status: 'active',
          created_at: '2025-01-15T00:00:00Z',
        },
        {
          id: 4,
          name: 'Mie Aceh Teh Matahari',
          code: 'TENANT123',
          location: 'Samarinda Supermall, Food Court Lt. 3',
          email: 'mieaceh@samarindamall.id',
          phone: '+62-541-8888444',
          status: 'active',
          created_at: '2025-01-18T00:00:00Z',
        },
      ];
      console.log('✅ Mock data loaded:', mockTenants.length, 'tenants');
      setTenants(mockTenants);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTenant = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Mohon isi nama dan kode tenant');
      return;
    }

    try {
      setSaveLoading(true);
      const { data, error } = await supabase
        .from('tenants')
        .insert({
          name: formData.name,
          code: formData.code.toUpperCase(),
          location: formData.location || null,
          email: formData.email || null,
          phone: formData.phone || null,
          status: 'active',
        })
        .select();

      if (error) throw error;
      
      alert('✓ Tenant berhasil ditambahkan!');
      setFormData({ name: '', code: '', location: '', email: '', phone: '' });
      setShowAddModal(false);
      fetchTenants();
    } catch (err) {
      console.error('Error adding tenant:', err);
      alert('Gagal menambahkan tenant');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEditTenant = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Mohon isi nama dan kode tenant');
      return;
    }

    if (!selectedTenant) return;

    try {
      setSaveLoading(true);
      const { error } = await supabase
        .from('tenants')
        .update({
          name: formData.name,
          code: formData.code.toUpperCase(),
          location: formData.location || null,
          email: formData.email || null,
          phone: formData.phone || null,
        })
        .eq('id', selectedTenant.id);

      if (error) throw error;

      alert('✓ Tenant berhasil diperbarui!');
      setShowEditModal(false);
      setShowDetailModal(false);
      setSelectedTenant(null);
      setFormData({ name: '', code: '', location: '', email: '', phone: '' });
      fetchTenants();
    } catch (err) {
      console.error('Error updating tenant:', err);
      alert('Gagal memperbarui tenant');
    } finally {
      setSaveLoading(false);
    }
  };

  const toggleTenantStatus = async (tenant: Tenant) => {
    try {
      const newStatus = tenant.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('tenants')
        .update({ status: newStatus })
        .eq('id', tenant.id);

      if (error) throw error;
      alert('✓ Status tenant berhasil diubah!');
      fetchTenants();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Gagal mengubah status tenant');
    }
  };

  const deleteTenant = async (id: number) => {
    if (!window.confirm('⚠️ Apakah Anda yakin ingin menghapus tenant ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✓ Tenant berhasil dihapus!');
      fetchTenants();
    } catch (err) {
      console.error('Error deleting tenant:', err);
      alert('Gagal menghapus tenant');
    }
  };

  const getStatusBadge = (status: string) => {
    const badgeClass =
      status === 'active'
        ? 'bg-green-100 text-green-800'
        : status === 'inactive'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800';
    const statusText =
      status === 'active' ? '✓ Aktif' : status === 'inactive' ? '⏸ Nonaktif' : '🚫 Diblokir';
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeClass}`}>{statusText}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏢 Manajemen Tenant</h1>
          <p className="text-gray-600 mt-2">Kelola restoran dan toko yang menggunakan sistem GAN-POS</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          ➕ Tambah Tenant Baru
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-gray-600 text-sm font-semibold mb-1">📊 Total Tenant</div>
          <div className="text-3xl font-bold text-gray-900">{tenants.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-gray-600 text-sm font-semibold mb-1">✓ Tenant Aktif</div>
          <div className="text-3xl font-bold text-gray-900">{tenants.filter((t) => t.status === 'active').length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-gray-600 text-sm font-semibold mb-1">⏸ Tenant Nonaktif</div>
          <div className="text-3xl font-bold text-gray-900">{tenants.filter((t) => t.status === 'inactive').length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="text-gray-600 text-sm font-semibold mb-1">🚫 Diblokir</div>
          <div className="text-3xl font-bold text-gray-900">{tenants.filter((t) => t.status === 'suspended').length}</div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="px-6 py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600 mt-2">Memuat data tenant...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nama Tenant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Kode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Terdaftar</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    ℹ️ Belum ada tenant terdaftar. Klik tombol "➕ Tambah Tenant Baru" untuk memulai.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{tenant.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono bg-gray-50 rounded px-2 py-1">{tenant.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tenant.email || '—'}</td>
                    <td className="px-6 py-4">{getStatusBadge(tenant.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString('id-ID') : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setShowDetailModal(true);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition font-semibold"
                          title="Lihat detail"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => toggleTenantStatus(tenant)}
                          className={`px-3 py-1 rounded hover:opacity-80 transition font-semibold ${
                            tenant.status === 'active'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                          title={tenant.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {tenant.status === 'active' ? '⏸' : '▶️'}
                        </button>
                        <button
                          onClick={() => deleteTenant(tenant.id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition font-semibold"
                          title="Hapus"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">➕ Tambah Tenant Baru</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Tenant *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Ayam Geprek Pak Maksur"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kode Tenant *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="Contoh: TENANT001"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: contact@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Samarinda Supermall, Lt. 3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: +62-541-123456"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddTenant}
                disabled={saveLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              >
                {saveLoading ? 'Menyimpan...' : '✓ Buat Tenant'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ name: '', code: '', location: '', email: '', phone: '' });
                }}
                disabled={saveLoading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Tenant Modal */}
      {showDetailModal && selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">👁️ Detail Tenant</h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-sm text-gray-600 font-semibold mb-1">Nama Tenant</div>
                <div className="text-lg font-bold text-gray-900">{selectedTenant.name}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600 font-semibold mb-1">Status</div>
                <div>{getStatusBadge(selectedTenant.status)}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600 font-semibold mb-1">Kode Tenant</div>
                <div className="text-gray-900 font-mono bg-gray-50 rounded px-2 py-1">{selectedTenant.code}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600 font-semibold mb-1">Email</div>
                <div className="text-gray-900">{selectedTenant.email || '—'}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600 font-semibold mb-1">Lokasi</div>
                <div className="text-gray-900">{selectedTenant.location || '—'}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600 font-semibold mb-1">Nomor Telepon</div>
                <div className="text-gray-900">{selectedTenant.phone || '—'}</div>
              </div>

              <div className="col-span-2">
                <div className="text-sm text-gray-600 font-semibold mb-1">Terdaftar Sejak</div>
                <div className="text-gray-900">
                  {selectedTenant.created_at
                    ? new Date(selectedTenant.created_at).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setFormData({
                    name: selectedTenant.name,
                    code: selectedTenant.code,
                    location: selectedTenant.location || '',
                    email: selectedTenant.email || '',
                    phone: selectedTenant.phone || '',
                  });
                  setShowEditModal(true);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                ✏️ Edit Tenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {showEditModal && selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">✏️ Edit Tenant</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Tenant *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kode Tenant *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEditTenant}
                disabled={saveLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              >
                {saveLoading ? 'Menyimpan...' : '✓ Simpan'}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setFormData({ name: '', code: '', location: '', email: '', phone: '' });
                }}
                disabled={saveLoading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
