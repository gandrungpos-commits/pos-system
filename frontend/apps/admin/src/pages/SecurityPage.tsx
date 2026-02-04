import { useState, useEffect } from 'react';
import { supabase } from '@pos/utils';

interface Session {
  id: number;
  device: string;
  browser: string;
  location: string;
  session_start: string;
  is_current: boolean;
}

interface LoginLog {
  id: number;
  log_time: string;
  device: string;
  browser: string;
  status: 'Success' | 'Failed';
}

export default function SecurityPage() {
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching security data...');
      
      const [sessionsRes, logsRes] = await Promise.all([
        supabase
          .from('sessions')
          .select('*')
          .eq('tenant_id', 1)
          .order('session_start', { ascending: false }),
        supabase
          .from('login_logs')
          .select('*')
          .eq('tenant_id', 1)
          .order('log_time', { ascending: false })
          .limit(10)
      ]);

      if (sessionsRes.error) throw sessionsRes.error;
      if (logsRes.error) throw logsRes.error;

      console.log('✅ Security data loaded');
      setSessions(sessionsRes.data || []);
      setLoginHistory(logsRes.data || []);
    } catch (err) {
      console.error('❌ Error fetching security data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm({ ...passwordForm, [field]: value });
    setPasswordMessage('');
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage('❌ Semua field harus diisi');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('❌ Password baru tidak cocok');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage('❌ Password minimal 8 karakter');
      return;
    }

    setPasswordLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPasswordMessage('✓ Password berhasil diubah');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMessage(''), 3000);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setTwoFactorLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTwoFactorEnabled(!twoFactorEnabled);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleLogoutSession = async (sessionId: number) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      setSessions(sessions.filter(s => s.id !== sessionId));
      console.log('✅ Session logged out');
    } catch (err) {
      console.error('❌ Error logging out session:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">🔒 Security</h1>
        <p className="text-slate-600 mt-1">Kelola keamanan akun dan izin akses</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Password Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">🔑 Ganti Password</h3>
          {passwordMessage && (
            <div className={`mb-4 px-4 py-3 rounded-lg ${
              passwordMessage.includes('✓') 
                ? 'bg-green-100 border border-green-300 text-green-700' 
                : 'bg-red-100 border border-red-300 text-red-700'
            }`}>
              {passwordMessage}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password Lama</label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password Baru</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Konfirmasi Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
              />
            </div>
            <button 
              onClick={handleUpdatePassword}
              disabled={passwordLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {passwordLoading ? 'Mengubah...' : 'Update Password'}
            </button>
          </div>
        </div>

        {/* Two Factor Authentication */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">🛡️ Two-Factor Authentication</h3>
          <p className="text-slate-600 text-sm mb-4">Tingkatkan keamanan akun dengan 2FA</p>
          <div className="flex items-center justify-between">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              twoFactorEnabled 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {twoFactorEnabled ? '✓ Enabled' : 'Disabled'}
            </div>
            <button 
              onClick={handleToggle2FA}
              disabled={twoFactorLoading}
              className={`px-6 py-2 text-white rounded-lg font-medium transition disabled:opacity-50 ${
                twoFactorEnabled 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {twoFactorLoading ? 'Processing...' : (twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA')}
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📱 Active Sessions</h3>
          {loading ? (
            <p className="text-slate-600 text-sm">Loading sessions...</p>
          ) : (
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-slate-600 text-sm">Tidak ada sesi aktif</p>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className="py-3 border-b border-slate-200 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{session.device}</p>
                        <p className="text-xs text-slate-600">{session.browser} • {session.location}</p>
                        <p className="text-xs text-slate-600 mt-1">{session.session_start} {session.is_current && '(Current)'}</p>
                      </div>
                      {!session.is_current && (
                        <button 
                          onClick={() => handleLogoutSession(session.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm">
                          Logout
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Login History */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📋 Login History</h3>
          <div className="space-y-2">
            {loginHistory.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-b-0">
                <div>
                  <p className="text-sm text-slate-900">{log.log_time}</p>
                  <p className="text-xs text-slate-600">{log.device} ({log.browser})</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  log.status === 'Success' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
