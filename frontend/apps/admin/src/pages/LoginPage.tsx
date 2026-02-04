import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@pos/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('admin@gandpos.com');
  const [password, setPassword] = useState('Admin!234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setLoading(true);
    localStorage.setItem('pos_demo_mode', 'true');
    localStorage.setItem(
      'pos_demo_user',
      JSON.stringify({
        id: 'demo-admin',
        email: 'admin@postest.com',
        role: 'admin',
      })
    );
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Login Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">POS System</h2>
          <p className="text-slate-600">Admin Dashboard</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-shake">
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              📧 Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200 bg-slate-50"
              disabled={loading}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              🔑 Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200 bg-slate-50"
              disabled={loading}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Loading...
              </>
            ) : isSignUp ? (
              '📝 Sign Up'
            ) : (
              '🚀 Login'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t-2 border-slate-200"></div>
          <span className="text-xs text-slate-500 font-semibold uppercase">Or</span>
          <div className="flex-1 border-t-2 border-slate-200"></div>
        </div>

        {/* Demo Mode Button */}
        <button
          onClick={handleDemo}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:from-green-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 transition duration-200"
        >
          🎮 Demo Mode
        </button>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
          >
            {isSignUp ? '← Back to Login' : 'Create new account?'}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg">
          <p className="font-bold text-slate-900 text-sm mb-2">📋 Test Credentials:</p>
          <div className="space-y-1 text-xs text-slate-700 font-mono">
            <p><span className="font-bold">Email:</span> admin@gandpos.com</p>
            <p><span className="font-bold">Pass:</span> Admin!234</p>
          </div>
          <p className="mt-3 text-xs text-green-600 font-semibold">✅ Real Supabase Account</p>
        </div>
      </div>
    </div>
  );
}
