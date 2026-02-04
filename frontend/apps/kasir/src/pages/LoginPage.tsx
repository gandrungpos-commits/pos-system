import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '@pos/hooks';
import { setUser, setToken } from '../store/authSlice';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo login bypass
    if (email === 'demo@pos.local' && password === 'demo123') {
      const demoToken = 'demo-token-' + Date.now();
      const demoUser = {
        id: 'user_1',
        name: 'Demo Kasir',
        email: 'demo@pos.local',
        role: 'cashier'
      };
      
      // Update Redux state
      dispatch(setToken(demoToken));
      dispatch(setUser(demoUser as any));
      
      navigate('/dashboard');
      return;
    }

    const result = await login(email, password);
    if (result) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-pos-primary">POS Kasir</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">atau</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEmail('demo@pos.local');
              setPassword('demo123');
            }}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
          >
            📱 Demo Login
          </button>
        </form>
      </div>
    </div>
  );
}
