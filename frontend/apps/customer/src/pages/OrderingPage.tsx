import React, { useState } from 'react';
import type { MenuItem, OrderItem } from '@pos/types';

export function OrderingPage() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: '1',
      restaurant_id: 'demo-rest',
      name: 'Nasi Goreng Spesial',
      description: 'Nasi goreng dengan telur, ayam, dan udang',
      price: 35000,
      category: 'makanan',
      image_url: undefined,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      restaurant_id: 'demo-rest',
      name: 'Mie Goreng',
      description: 'Mie goreng kering dengan sayuran',
      price: 28000,
      category: 'makanan',
      image_url: undefined,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      restaurant_id: 'demo-rest',
      name: 'Es Jeruk',
      description: 'Minuman segar es jeruk murni',
      price: 8000,
      category: 'minuman',
      image_url: undefined,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedQuantity, setSelectedQuantity] = useState<Record<string, number>>({});

  const handleQRScan = (qrData: string) => {
    const id = qrData.split('-')[0] || 'demo-rest';
    setRestaurantId(id);
    setShowQRScanner(false);
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = selectedQuantity[item.id] || 1;
    const existingItem = orderItems.find((oi) => oi.menu_item_id === item.id);

    if (existingItem) {
      setOrderItems(
        orderItems.map((oi) =>
          oi.menu_item_id === item.id
            ? { ...oi, quantity: oi.quantity + quantity }
            : oi
        )
      );
    } else {
      const newItem: OrderItem = {
        id: `${item.id}-${Date.now()}`,
        quantity,
        menu_item_id: item.id,
      };
      setOrderItems([...orderItems, newItem]);
    }
    setSelectedQuantity({ ...selectedQuantity, [item.id]: 1 });
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId));
  };

  const totalPrice = orderItems.reduce((sum, item) => {
    const menuItem = menuItems.find((m) => m.id === item.menu_item_id);
    return sum + (menuItem?.price || 0) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">🍕 Pesan Makanan</h1>

        {!restaurantId ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-xl text-gray-700 mb-4">Silakan scan QR code menu untuk memulai</p>
            <button
              onClick={() => setShowQRScanner(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              📷 Scan QR Code
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Menu Tersedia</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                      <div className="bg-gray-200 h-40 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-4xl">🍽️</span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <p className="text-lg font-bold text-green-600 mb-3">Rp {item.price.toLocaleString()}</p>
                      <div className="flex gap-2">
                        <select
                          value={selectedQuantity[item.id] || 1}
                          onChange={(e) => setSelectedQuantity({ ...selectedQuantity, [item.id]: parseInt(e.target.value) })}
                          className="flex-1 border rounded px-2 py-1"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold py-1"
                        >
                          + Keranjang
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Section */}
            <div className="bg-white rounded-lg shadow p-6 h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📦 Keranjang</h2>
              {orderItems.length === 0 ? (
                <p className="text-gray-600 text-center py-4">Keranjang kosong</p>
              ) : (
                <>
                  <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                    {orderItems.map((item) => {
                      const menuItem = menuItems.find((m) => m.id === item.menu_item_id);
                      return (
                        <div key={item.id} className="border-b pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{menuItem?.name}</p>
                              <p className="text-sm text-gray-600">{item.quantity}x Rp {menuItem?.price.toLocaleString()}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600 hover:text-red-800 ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-gray-800">Total:</span>
                      <span className="text-2xl font-bold text-green-600">Rp {totalPrice.toLocaleString()}</span>
                    </div>
                    <button className="w-full bg-green-600 text-white rounded-lg py-3 font-bold hover:bg-green-700">
                      ✓ Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {showQRScanner && (
          <div className="mt-4 bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">Kamera QR Scanner</p>
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
              <p className="text-gray-500">📷 QR Scanner akan tampil di sini</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleQRScan('demo-rest-123456');
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                ✓ Demo Scan
              </button>
              <button
                onClick={() => setShowQRScanner(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
