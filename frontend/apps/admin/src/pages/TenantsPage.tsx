import React, { useState, useEffect } from 'react';
import { supabase } from '@pos/utils';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

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

export default function TenantsPage() {
  console.log('🟢 TenantsPage component rendered');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [pendingEditId, setPendingEditId] = useState<number | null>(null);
  const [pendingEditData, setPendingEditData] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', code: '', status: 'active' as const });
  const [revealingCodeId, setRevealingCodeId] = useState<number | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [visibleCodes, setVisibleCodes] = useState<Set<number>>(new Set());
  const [passwordModalMode, setPasswordModalMode] = useState<'reveal' | 'edit'>('reveal');

  // Mock admin password
  const ADMIN_PASSWORD = 'Admin!234';

  // Fetch tenants from Supabase
  useEffect(() => {
    console.log('⚙️ TenantsPage useEffect triggered');
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

  const openAddModal = () => {
    setFormData({ name: '', email: '', code: '', status: 'active' });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (tenant: Tenant) => {
    // Require password verification before opening edit modal
    setPendingEditId(tenant.id);
    setPendingEditData(tenant);
    setAdminPassword('');
    setPasswordError('');
    setPasswordModalMode('edit');
    setShowPasswordModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.code) {
      alert('Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        setTenants(tenants.map(t => 
          t.id === editingId 
            ? { ...t, name: formData.name, email: formData.email, code: formData.code, status: formData.status }
            : t
        ));
      } else {
        const newTenant: Tenant = {
          id: Math.max(...tenants.map(t => t.id), 0) + 1,
          name: formData.name,
          email: formData.email,
          code: formData.code,
          status: formData.status,
          orders: 0,
        };
        setTenants([...tenants, newTenant]);
      }
      setShowModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    try {
      setTenants(tenants.filter(t => t.id !== deleteId));
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteConfirm = (id: number) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const openRevealCode = (tenantId: number) => {
    if (visibleCodes.has(tenantId)) {
      // Already visible, hide it
      const newSet = new Set(visibleCodes);
      newSet.delete(tenantId);
      setVisibleCodes(newSet);
    } else {
      // Not visible, need to ask for password
      setRevealingCodeId(tenantId);
      setAdminPassword('');
      setPasswordError('');
      setShowPasswordModal(true);
    }
  };

  const verifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!adminPassword) {
      setPasswordError('Masukkan password admin');
      return;
    }

    if (adminPassword !== ADMIN_PASSWORD) {
      setPasswordError('Password admin salah');
      return;
    }

    // Password correct
    if (passwordModalMode === 'reveal' && revealingCodeId) {
      // Show the code
      const newSet = new Set(visibleCodes);
      newSet.add(revealingCodeId);
      setVisibleCodes(newSet);
      setShowPasswordModal(false);
      setAdminPassword('');
    } else if (passwordModalMode === 'edit' && pendingEditData) {
      // Open edit modal
      setFormData({ 
        name: pendingEditData.name, 
        email: pendingEditData.email, 
        code: pendingEditData.code, 
        status: pendingEditData.status 
      });
      setEditingId(pendingEditData.id);
      setShowPasswordModal(false);
      setShowModal(true);
      setAdminPassword('');
      setPendingEditId(null);
      setPendingEditData(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🏢 Manajemen Tenant</h1>
          <p className="text-slate-600 mt-1">Kelola semua tenant/cabang bisnis Anda</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          + Tambah Tenant
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Nama Tenant</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Kode Sandi</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total Order</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{tenant.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{tenant.email}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-slate-900 font-semibold bg-slate-50 rounded px-3 py-1">
                      {visibleCodes.has(tenant.id) ? tenant.code : '•••••'}
                    </div>
                    <button
                      onClick={() => openRevealCode(tenant.id)}
                      className="p-1 hover:bg-slate-200 rounded transition text-slate-600 hover:text-slate-900"
                      title={visibleCodes.has(tenant.id) ? 'Hide code' : 'Show code'}
                    >
                      {visibleCodes.has(tenant.id) ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    tenant.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">{tenant.orders}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button 
                    onClick={() => openEditModal(tenant)}
                    className="text-blue-600 hover:text-blue-700 font-medium">Edit
                  </button>
                  <button 
                    onClick={() => openDeleteConfirm(tenant.id)}
                    className="text-red-600 hover:text-red-700 font-medium">Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingId ? 'Edit Tenant' : 'Add New Tenant'}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        isLoading={isLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Tenant</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Nama tenant"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Kode Sandi</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono uppercase"
              placeholder="Contoh: TENANT001"
            />
            <p className="text-xs text-slate-500 mt-1">Kode sandi yang akan digunakan tenant untuk login</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Tenant"
        message={`Are you sure you want to delete this tenant? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        isLoading={isLoading}
        confirmText="Delete"
        isDangerous={true}
      />

      {/* Password Verification Modal */}
      <div className={`fixed inset-0 ${showPasswordModal ? 'flex' : 'hidden'} items-center justify-center bg-black bg-opacity-50 z-50`}>
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-4">🔐 Verifikasi Password Admin</h2>
          <p className="text-slate-600 mb-4">
            {passwordModalMode === 'edit' 
              ? 'Masukkan password admin untuk mengedit data tenant' 
              : 'Masukkan password admin untuk membuka kode sandi tenant'}
          </p>
          
          {passwordError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {passwordError}
            </div>
          )}

          <form onSubmit={verifyPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password Admin</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Masukkan password admin"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setAdminPassword('');
                  setPasswordError('');
                }}
                className="flex-1 px-4 py-2 border-2 border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Verifikasi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
