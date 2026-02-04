import { useState, useEffect } from 'react';
import { supabase } from '@pos/utils';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

interface Staff {
  id: number;
  name: string;
  role: string;
  tenant_id: number;
  status: 'active' | 'inactive';
  salary: number;
  created_at?: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    role: '', 
    tenant_id: 1,
    status: 'active' as const,
    salary: 0,
  });

  const roles = ['Cashier', 'Chef', 'Manager', 'Waiter', 'Kitchen Staff'];

  // Fetch staff from Supabase
  useEffect(() => {
    console.log('⚙️ StaffPage useEffect triggered');
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching staff from Supabase...');
      
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase Error:', error);
        throw error;
      }
      
      console.log('✅ Supabase Success! Staff:', data);
      setStaff(data || []);
    } catch (err) {
      console.error('❌ Fetch Error:', err);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', role: '', tenant_id: 1, status: 'active', salary: 0 });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (member: Staff) => {
    setFormData({ 
      name: member.name, 
      role: member.role, 
      tenant_id: member.tenant_id,
      status: member.status,
      salary: member.salary
    });
    setEditingId(member.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.role || formData.salary <= 0) {
      alert('Please fill all fields correctly');
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('staff')
          .update({
            name: formData.name,
            role: formData.role,
            tenant_id: formData.tenant_id,
            status: formData.status,
            salary: formData.salary,
          })
          .eq('id', editingId);

        if (error) throw error;
        console.log('✅ Staff updated');
      } else {
        const { error } = await supabase
          .from('staff')
          .insert({
            name: formData.name,
            role: formData.role,
            tenant_id: formData.tenant_id,
            status: formData.status,
            salary: formData.salary,
          });

        if (error) throw error;
        console.log('✅ Staff created');
      }
      
      setShowModal(false);
      await fetchStaff();
    } catch (err) {
      console.error('Error saving staff:', err);
      alert('Error saving staff');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      console.log('✅ Staff deleted');
      setShowConfirm(false);
      await fetchStaff();
    } catch (err) {
      console.error('Error deleting staff:', err);
      alert('Error deleting staff');
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteConfirm = (id: number) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">👥 Manajemen Staff</h1>
          <p className="text-slate-600 mt-1">Kelola karyawan dan data gaji</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          + Tambah Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: staff.length.toString(), icon: '👥', color: 'bg-blue-500' },
          { label: 'Active', value: staff.filter(s => s.status === 'active').length.toString(), icon: '✅', color: 'bg-green-500' },
          { label: 'Inactive', value: staff.filter(s => s.status === 'inactive').length.toString(), icon: '🔴', color: 'bg-red-500' },
          { label: 'Total Salary', value: `Rp ${(staff.reduce((sum, s) => sum + s.salary, 0) / 1000000).toFixed(0)}M`, icon: '💰', color: 'bg-purple-500' },
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

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-600">Loading staff data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tenant ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Salary</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{member.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{member.role}</td>
                <td className="px-6 py-4 text-sm text-slate-600">Tenant #{member.tenant_id}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    member.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {member.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">Rp {member.salary.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button 
                    onClick={() => openEditModal(member)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => openDeleteConfirm(member.id)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingId ? 'Edit Staff' : 'Add New Staff'}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        isLoading={isLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Select role</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tenant ID</label>
            <input
              type="number"
              value={formData.tenant_id}
              onChange={(e) => setFormData({ ...formData, tenant_id: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Tenant ID"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Salary (Rp)</label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="0"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Staff"
        message="Are you sure you want to delete this staff member? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        isLoading={isLoading}
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  );
}
