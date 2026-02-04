import React from 'react';
import type { OrderItem } from '@pos/types';
import { formatCurrency } from '@pos/utils';

interface OrderSummaryProps {
  items: OrderItem[];
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  isLoading?: boolean;
}

export function OrderSummary({ items, onRemoveItem, onCheckout, isLoading }: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sticky top-0">
      <h2 className="text-xl font-bold mb-4">Pesanan Anda</h2>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-6">Belum ada pesanan</p>
      ) : (
        <>
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center pb-2 border-b">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.menu_name}</p>
                  <p className="text-xs text-gray-600">
                    {item.quantity}x {formatCurrency(item.unit_price, 'IDR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {formatCurrency(item.subtotal, 'IDR')}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span>{formatCurrency(subtotal, 'IDR')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pajak (10%):</span>
              <span>{formatCurrency(tax, 'IDR')}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span className="text-pos-primary">{formatCurrency(total, 'IDR')}</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            disabled={isLoading || items.length === 0}
            className="btn-primary w-full"
          >
            {isLoading ? 'Memproses...' : 'Lanjut ke Pembayaran'}
          </button>
        </>
      )}
    </div>
  );
}
