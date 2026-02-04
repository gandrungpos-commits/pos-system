import { useState, useEffect } from 'react';
import { db } from '@pos/utils';
import { useAuth } from '@pos/utils';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tenantId, setTenantId] = useState<number | null>(null);

  const fetchTenantData = async () => {
    setLoading(true);
    try {
      const response = await db.getTenants();
      if (response.error) {
        console.error('Error fetching tenant data:', response.error);
      } else if (response.data && response.data.length > 0) {
        const tenant = response.data[0];
        setTenantId(tenant.id);
        setProfile({
          name: tenant.name || '',
          email: user?.email || '',
          phone: tenant.phone || '',
          location: tenant.location || '',
        });
      }
    } catch (error) {
      console.error('Error fetching tenant data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, [user]);

  const handleSave = async () => {
    if (!tenantId) {
      alert('Tenant ID tidak ditemukan');
      return;
    }

    setSaving(true);
    try {
      const response = await db.updateTenant(tenantId, {
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
      });
      if (response.error) {
        console.error('Error saving settings:', response.error);
        alert('Gagal menyimpan pengaturan');
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <textarea
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : saved ? '✓ Tersimpan' : 'Simpan Profile'}
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          <ToggleOption
            label="Email Notifications"
            description="Receive notifications via email"
            checked={notifications.email}
            onChange={(checked) =>
              setNotifications({ ...notifications, email: checked })
            }
          />

          <ToggleOption
            label="Push Notifications"
            description="Receive browser push notifications"
            checked={notifications.push}
            onChange={(checked) =>
              setNotifications({ ...notifications, push: checked })
            }
          />

          <ToggleOption
            label="SMS Alerts"
            description="Critical alerts via SMS"
            checked={notifications.sms}
            onChange={(checked) =>
              setNotifications({ ...notifications, sms: checked })
            }
          />

          <ToggleOption
            label="Daily Reports"
            description="Send daily sales report every morning"
            checked={notifications.daily_report}
            onChange={(checked) =>
              setNotifications({ ...notifications, daily_report: checked })
            }
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-900 mb-4">Danger Zone</h2>
        <p className="text-sm text-red-700 mb-4">
          These actions cannot be undone. Please proceed with caution.
        </p>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition">
          Reset All Data
        </button>
      </div>

      {/* About */}
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">GAN-POS Tenant Manager</h2>
        <p className="text-gray-600 mb-2">Version 1.0.0</p>
        <p className="text-sm text-gray-500">
          © 2024 GAN Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function ToggleOption({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
