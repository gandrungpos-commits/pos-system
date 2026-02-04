import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@pos/utils';

export function LoginPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const tenantCode = code.toUpperCase().trim();
      
      if (!tenantCode) {
        setError('Masukkan kode sandi tenant');
        setIsLoading(false);
        return;
      }

      // Query Supabase untuk mencari tenant dengan kode ini
      const { data, error: queryError } = await db
        .from('tenants')
        .select('id, name, code')
        .eq('code', tenantCode)
        .single();

      if (queryError || !data) {
        setError('Kode sandi tenant tidak valid. Silakan cek kembali.');
        setIsLoading(false);
        return;
      }

      // Simpan tenant info ke localStorage
      localStorage.setItem('tenant_code', tenantCode);
      localStorage.setItem('tenantId', data.id.toString());
      localStorage.setItem('tenant_data', JSON.stringify({
        id: data.id,
        name: data.name,
        code: data.code,
        loginTime: new Date().toISOString(),
      }));

      // Redirect ke dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCode('TENANT001');
    setError('');
    setIsLoading(true);

    try {
      // Query Supabase untuk demo tenant
      const { data, error: queryError } = await db
        .from('tenants')
        .select('id, name, code')
        .eq('code', 'TENANT001')
        .single();

      if (queryError || !data) {
        setError('Demo tenant tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('tenant_code', 'TENANT001');
      localStorage.setItem('tenantId', data.id.toString());
      localStorage.setItem('tenant_data', JSON.stringify({
        id: data.id,
        name: data.name,
        code: data.code,
        loginTime: new Date().toISOString(),
      }));

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login gagal.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🏪</div>
            <h1 className="text-3xl font-bold text-slate-900">POS Tenant</h1>
            <p className="text-slate-600 mt-2">Login dengan Kode Sandi</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700">
              <p className="font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-semibold text-slate-700 mb-2">
                Kode Sandi Tenant
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Contoh: TENANT001"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-center text-lg font-mono uppercase transition"
                required
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-2">Masukkan kode sandi yang diberikan oleh administrator</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '🔄 Masuk...' : '🔓 Masuk'}
            </button>
          </form>

          {/* Demo Section */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-slate-500 text-sm">atau</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition disabled:opacity-50"
          >
            📱 Demo Login (TENANT123)
          </button>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-slate-700">
              <strong>Kode Demo Tersedia:</strong>
            </p>
            <p className="text-xs text-slate-600 mt-2 space-y-1">
              • TENANT001 - Restoran Maju Jaya<br/>
              • TENANT002 - Warung Makan Asri<br/>
              • TENANT003 - Kafe Nikmat<br/>
              • TENANT123 - Demo Tenant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
