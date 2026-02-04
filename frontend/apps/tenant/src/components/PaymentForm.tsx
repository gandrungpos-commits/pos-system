import React, { useState } from 'react';
import { formatCurrency } from '@pos/utils';

interface PaymentFormProps {
  amount: number;
  onSuccess: (payment: { method: string; reference?: string }) => void;
  onCancel: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'e_wallet' | 'bank_transfer';

export function PaymentForm({ amount, onSuccess, onCancel }: PaymentFormProps) {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PAYMENT_METHODS = [
    { id: 'cash', label: 'Tunai', icon: '💵' },
    { id: 'card', label: 'Kartu', icon: '💳' },
    { id: 'e_wallet', label: 'E-Wallet', icon: '📱' },
    { id: 'bank_transfer', label: 'Transfer Bank', icon: '🏦' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate reference for non-cash payments
      if (method !== 'cash' && !reference) {
        throw new Error('Nomor referensi diperlukan');
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess({
        method,
        reference: method !== 'cash' ? reference : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="card-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Pembayaran</h2>

      {/* Amount */}
      <div className="mb-6 p-4 bg-pos-primary bg-opacity-10 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Total Pembayaran</p>
        <p className="text-3xl font-bold text-pos-primary">{formatCurrency(amount, 'IDR')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Methods */}
        <div>
          <label className="block text-sm font-medium mb-3">Metode Pembayaran</label>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setMethod(pm.id as PaymentMethod)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  method === pm.id
                    ? 'border-pos-primary bg-pos-primary bg-opacity-10'
                    : 'border-gray-200 hover:border-pos-primary'
                }`}
              >
                <div className="text-2xl mb-1">{pm.icon}</div>
                <div className="text-xs font-medium">{pm.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Reference Number */}
        {method !== 'cash' && (
          <div>
            <label htmlFor="reference" className="block text-sm font-medium mb-2">
              Nomor Referensi
            </label>
            <input
              id="reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g., transaction ID"
              className="input"
              disabled={loading}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-outline flex-1"
          >
            Batal
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Memproses...' : 'Konfirmasi Pembayaran'}
          </button>
        </div>
      </form>
    </div>
  );
}
