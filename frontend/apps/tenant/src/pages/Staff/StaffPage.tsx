import { useState, useEffect } from 'react';
import { db } from '@pos/utils';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'cashier' as const,
    email: '',
    phone: '',
    status: 'active' as const,
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      // Fetch staff members from users table
      const response = await db.getUsers();
      if (response.error) {
        console.error('Error fetching staff:', response.error);
        setStaff([]);
      } else {
        setStaff(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading staff...</p>
        </div>
      </div>
    );
  }

  const handleEdit = (member: any) => {
    setFormData(member);
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus staff ini?')) return;

    setSaveLoading(true);
    try {
      // Just mark as inactive instead of deleting
      const response = await db.updateUser(id, { status: 'inactive' });
      if (response.error) {
        console.error('Error deleting staff:', response.error);
        alert('Gagal menghapus staff');
      } else {
        await fetchStaff();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menghapus staff');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Mohon isi nama dan email');
      return;
    }

    setSaveLoading(true);
    try {
      if (editingId) {
        // Update
        const response = await db.updateUser(editingId, formData);
        if (response.error) {
          console.error('Error updating staff:', response.error);
          alert('Gagal memperbarui staff');
        } else {
          setShowForm(false);
          setEditingId(null);
          setFormData({ name: '', role: 'cashier', email: '', phone: '', status: 'active' });
          await fetchStaff();
        }
      } else {
        // Create
        const newStaff = {
          ...formData,
          created_at: new Date().toISOString(),
        };
        const response = await db.createUser(newStaff);
        if (response.error) {
          console.error('Error creating staff:', response.error);
          alert('Gagal menambah staff');
        } else {
          setShowForm(false);
          setFormData({ name: '', role: 'cashier', email: '', phone: '', status: 'active' });
          await fetchStaff();
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menyimpan staff');
    } finally {
      setSaveLoading(false);
    }
  };

  const roleColor = (role: string) => {
    switch(role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'cashier': return 'bg-blue-100 text-blue-800';
      case 'chef': return 'bg-orange-100 text-orange-800';
      case 'waiter': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', role: 'cashier', email: '', phone: '', status: 'active' });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? '✕ Cancel' : '+ Add Staff'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Staff"
          value={staff.length}
          icon="👥"
          color="blue"
        />
        <StatCard
          label="Active"
          value={staff.filter(s => s.status === 'active').length}
          icon="✅"
          color="green"
        />
        <StatCard
          label="On Leave"
          value={staff.filter(s => s.status === 'leave').length}
          icon="🏖️"
          color="yellow"
        />
        <StatCard
          label="Inactive"
          value={staff.filter(s => s.status === 'inactive').length}
          icon="⛔"
          color="red"
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit' : 'Add New'} Staff Member</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                  <option value="chef">Chef</option>
                  <option value="waiter">Waiter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {saveLoading ? 'Menyimpan...' : editingId ? 'Update Staff' : 'Add Staff'}
            </button>
          </form>
        </div>
      )}

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map(member => (
          <div key={member.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${roleColor(member.role)}`}>
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                member.status === 'active' ? 'bg-green-100 text-green-800' :
                member.status === 'leave' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <p>📧 {member.email}</p>
              <p>📱 {member.phone}</p>
              <p className="text-xs text-gray-500">Joined {member.joinDate}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(member)}
                className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
              >
                🗑️ Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} rounded-lg p-6`}>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-2xl mt-2">{icon}</p>
    </div>
  );
}

const initialStaff = [
  {
    id: '1',
    name: 'Budi Hartoyo',
    role: 'manager',
    email: 'budi@madjajaya.id',
    phone: '+62 812 3456 7890',
    status: 'active',
    joinDate: '01 Januari 2023',
  },
  {
    id: '2',
    name: 'Siti Rahayu',
    role: 'cashier',
    email: 'siti@madjajaya.id',
    phone: '+62 811 2345 6789',
    status: 'active',
    joinDate: '15 Februari 2023',
  },
  {
    id: '3',
    name: 'Agus Suryanto',
    role: 'chef',
    email: 'agus@madjajaya.id',
    phone: '+62 813 4567 8901',
    status: 'active',
    joinDate: '10 Januari 2023',
  },
  {
    id: '4',
    name: 'Dini Handari',
    role: 'waiter',
    email: 'dini@madjajaya.id',
    phone: '+62 814 5678 9012',
    status: 'active',
    joinDate: '20 Februari 2023',
  },
  {
    id: '5',
    name: 'Roni Firmansyah',
    role: 'cashier',
    email: 'roni@madjajaya.id',
    phone: '+62 815 6789 0123',
    status: 'leave',
    joinDate: '25 Maret 2023',
  },
  {
    id: '6',
    name: 'Eka Putri',
    role: 'waiter',
    email: 'eka@madjajaya.id',
    phone: '+62 816 7890 1234',
    status: 'active',
    joinDate: '05 April 2023',
  },
];
