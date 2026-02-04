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
        setError('Masukkan kode akses restoran');
        setIsLoading(false);
        return;
      }

      // Demo tenants untuk testing (matching actual database codes)
      const demoTenants: Record<string, any> = {
        'TENANT001': { id: 1, name: 'Ayam Geprek Pak Maksur', code: 'TENANT001' },
        'TENANT002': { id: 2, name: 'Soto Makasar', code: 'TENANT002' },
        'TENANT003': { id: 3, name: 'Gado-Gado', code: 'TENANT003' },
        'TENANT004': { id: 4, name: 'Mie Aceh', code: 'TENANT004' },
      };

      let tenantData = demoTenants[tenantCode];

      // Jika tidak ada di demo, coba query Supabase
      if (!tenantData) {
        try {
          const { data, error: queryError } = await db
            .from('tenants')
            .select('id, name, code')
            .eq('code', tenantCode)
            .single();

          if (queryError) {
            console.error('❌ Supabase Query Error:', queryError);
            console.warn('Demo codes available: TENANT001, TENANT002, TENANT003, TENANT004');
          } else if (data) {
            console.log('✅ Tenant found in Supabase:', data);
            tenantData = data;
          } else {
            console.warn('⚠️ No tenant found with code:', tenantCode);
          }
        } catch (err) {
          console.error('❌ Supabase connection error:', err);
        }
      }

      if (!tenantData) {
        setError('Kode akses tidak valid. Gunakan: TENANT001, TENANT002, TENANT003, atau TENANT004');
        setIsLoading(false);
        return;
      }

      // Simpan tenant info ke localStorage
      localStorage.setItem('tenant_code', tenantCode);
      localStorage.setItem('tenantId', tenantData.id.toString());
      localStorage.setItem('tenant_data', JSON.stringify({
        id: tenantData.id,
        name: tenantData.name,
        code: tenantData.code,
        loginTime: new Date().toISOString(),
      }));

      // Redirect ke dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Akses gagal. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const demoCode = 'TENANT001';
      
      // Demo tenants (matching actual database codes)
      const demoTenants: Record<string, any> = {
        'TENANT001': { id: 1, name: 'Ayam Geprek Pak Maksur', code: 'TENANT001' },
        'TENANT002': { id: 2, name: 'Soto Makasar', code: 'TENANT002' },
        'TENANT003': { id: 3, name: 'Gado-Gado', code: 'TENANT003' },
        'TENANT004': { id: 4, name: 'Mie Aceh', code: 'TENANT004' },
      };

      const demoTenant = demoTenants[demoCode];
      if (!demoTenant) {
        setError('Demo restoran tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('tenant_code', demoCode);
      localStorage.setItem('tenantId', demoTenant.id.toString());
      localStorage.setItem('tenant_data', JSON.stringify({
        id: demoTenant.id,
        name: demoTenant.name,
        code: demoTenant.code,
        loginTime: new Date().toISOString(),
      }));

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Akses gagal. Silakan coba lagi.');
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
            <p className="text-slate-600 mt-2">Masukkan Kode Akses Restoran</p>
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
                Kode Akses
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
