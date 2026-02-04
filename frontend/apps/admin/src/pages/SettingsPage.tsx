import { useState, useEffect } from 'react';
import { supabase } from '@pos/utils';

interface Settings {
  id?: number;
  tenant_id?: number;
  business_name: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  date_format: string;
  time_zone: string;
  language: string;
  email_notifications: boolean;
  sms_alerts: boolean;
  push_notifications: boolean;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [settings, setSettings] = useState<Settings>({
    business_name: '',
    email: '',
    phone: '',
    address: '',
    currency: 'IDR (Rp)',
    date_format: 'DD/MM/YYYY',
    time_zone: 'Asia/Jakarta',
    language: 'Indonesian',
    email_notifications: true,
    sms_alerts: true,
    push_notifications: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      console.log('🔄 Fetching app settings...');
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1);

      if (error) throw error;
      
      const settingsData = data && data.length > 0 ? data[0] : null;
      
      if (settingsData) {
        console.log('✅ App settings loaded:', settingsData);
        setSettings({
          id: settingsData.id,
          tenant_id: undefined,
          business_name: settingsData.business_name || '',
          email: settingsData.email || '',
          phone: settingsData.phone || '',
          address: settingsData.address || '',
          currency: settingsData.currency || 'IDR (Rp)',
          date_format: settingsData.date_format || 'DD/MM/YYYY',
          time_zone: settingsData.time_zone || 'Asia/Jakarta',
          language: settingsData.language || 'Indonesian',
          email_notifications: settingsData.email_notifications ?? true,
          sms_alerts: settingsData.sms_alerts ?? true,
          push_notifications: settingsData.push_notifications ?? false,
        });
      } else {
        console.log('ℹ️ No app settings found, using defaults');
      }
    } catch (err) {
      console.error('❌ Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Settings, value: any) => {
    setSettings({ ...settings, [field]: value });
    setSaveMessage('');
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('💾 Saving app settings...');
      const updateData = {
        business_name: settings.business_name,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        currency: settings.currency,
        date_format: settings.date_format,
        time_zone: settings.time_zone,
        language: settings.language,
        email_notifications: settings.email_notifications,
        sms_alerts: settings.sms_alerts,
        push_notifications: settings.push_notifications,
      };

      if (settings.id) {
        const { error } = await supabase
          .from('app_settings')
          .update(updateData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('app_settings')
          .insert(updateData);

        if (error) throw error;
      }

      console.log('✅ App settings saved');
      setSaveMessage('✓ Pengaturan berhasil disimpan');
      setTimeout(() => setSaveMessage(''), 3000);
      await fetchSettings();
    } catch (err) {
      console.error('❌ Error saving settings:', err);
      setSaveMessage('❌ Gagal menyimpan pengaturan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">⚙️ Settings</h1>
        <p className="text-slate-600 mt-1">Kelola pengaturan sistem aplikasi</p>
      </div>

      {saveMessage && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
          {saveMessage}
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {/* Business Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">🏢 Pengaturan Bisnis</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Bisnis</label>
              <input
                type="text"
                value={settings.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Telepon</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat</label>
              <textarea
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">🔧 Pengaturan Sistem</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mata Uang</label>
              <select
                value={settings.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              >
                <option>IDR (Rp)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Format Tanggal</label>
              <select
                value={settings.date_format}
                onChange={(e) => handleInputChange('date_format', e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              >
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Zona Waktu</label>
              <select
                value={settings.time_zone}
                onChange={(e) => handleInputChange('time_zone', e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              >
                <option>Asia/Jakarta</option>
                <option>Asia/Bangkok</option>
                <option>Asia/Singapore</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Bahasa</label>
              <select
                value={settings.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              >
                <option>Indonesian</option>
                <option>English</option>
                <option>Chinese</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">🔔 Notifikasi</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-slate-200">
              <div>
                <p className="font-medium text-slate-900">Email Notifications</p>
                <p className="text-sm text-slate-600">Terima notifikasi via email</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.email_notifications}
                onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-200">
              <div>
                <p className="font-medium text-slate-900">SMS Alerts</p>
                <p className="text-sm text-slate-600">Terima peringatan SMS penting</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.sms_alerts}
                onChange={(e) => handleInputChange('sms_alerts', e.target.checked)}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-slate-900">Push Notifications</p>
                <p className="text-sm text-slate-600">Notifikasi push di browser</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.push_notifications}
                onChange={(e) => handleInputChange('push_notifications', e.target.checked)}
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </div>
  );
}
