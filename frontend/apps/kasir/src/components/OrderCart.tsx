import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import type { OrderItem } from '@pos/types';
import { removeOrderItem, clearOrderItems } from '../store/ordersSlice';
import { formatCurrency } from '@pos/utils';

export function OrderCart() {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedItems } = useSelector((state: RootState) => state.orders);
  const [discountPercent, setDiscountPercent] = useState(0);

  const subtotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const taxAmount = Math.round((subtotal - discountAmount) * 0.1); // 10% tax
  const total = subtotal - discountAmount + taxAmount;

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeOrderItem(itemId));
  };

  const handleClear = () => {
    if (window.confirm('Hapus semua item dari pesanan?')) {
      dispatch(clearOrderItems());
    }
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    // Will update item quantity
    console.log(`Update item ${itemId} to qty ${newQuantity}`);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h2 className="text-xl font-bold text-pos-dark">Pesanan</h2>
        {selectedItems.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Kosongkan
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto mb-4">
        {selectedItems.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Tidak ada item</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex gap-2 bg-gray-50 p-2 rounded">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.menu_name}</h4>
                  <p className="text-xs text-gray-600">
                    Rp {item.unit_price.toLocaleString('id-ID')} x {item.quantity}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-pos-primary">
                    {formatCurrency(item.subtotal, 'IDR')}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discount */}
      {selectedItems.length > 0 && (
        <div className="mb-4 pb-4 border-b">
          <label className="block text-sm font-medium mb-2">Diskon (%)</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Math.min(100, parseInt(e.target.value) || 0))}
              className="input flex-1 h-10"
              placeholder="0"
            />
            <span className="text-sm font-semibold text-pos-primary pt-2">
              -{formatCurrency(discountAmount, 'IDR')}
            </span>
          </div>
        </div>
      )}

      {/* Totals */}
      {selectedItems.length > 0 && (
        <div className="space-y-2 mb-4 pb-4 border-b">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal, 'IDR')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Pajak (10%):</span>
            <span>{formatCurrency(taxAmount, 'IDR')}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-pos-primary">
            <span>Total:</span>
            <span>{formatCurrency(total, 'IDR')}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="btn-outline flex-1">Bayar Nanti</button>
        <button className="btn-primary flex-1" disabled={selectedItems.length === 0}>
          Bayar
        </button>
      </div>
    </div>
  );
}
