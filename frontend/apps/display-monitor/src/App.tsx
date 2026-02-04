import React, { useEffect, useState } from 'react';
import { getAPIClient } from '@pos/api-client';
import { useDisplayStore } from './store';
import { OrderQueue } from './components/OrderQueue';
import { OrderStats } from './components/OrderStats';

function App() {
  const { addOrder, updateOrderStatus, addReadyOrder, isKioskMode, setKioskMode } = useDisplayStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Connect to Socket.io for real-time order updates
    const apiClient = getAPIClient();
    const socket = apiClient.connectSocket();

    socket.on('order:created', (order) => {
      console.log('New order:', order);
      addOrder(order);
    });

    socket.on('order:status:changed', ({ order_id, status }) => {
      console.log('Order status changed:', order_id, status);
      updateOrderStatus(order_id, status);
      
      // If status is ready, add to ready queue
      if (status === 'ready') {
        // Need to fetch order details
      }
    });

    socket.on('order:updated', (order) => {
      console.log('Order updated:', order);
      updateOrderStatus(order.id, order.status);
    });

    // Mock data for demo
    setTimeout(() => {
      const mockOrders = [
        {
          id: '1',
          restaurant_id: 'rest-1',
          order_number: 'ORD-001',
          customer_name: 'Meja 1',
          items: [],
          total_amount: 50000,
          tax_amount: 5000,
          discount_amount: 0,
          final_amount: 55000,
          status: 'preparing' as const,
          payment_status: 'completed' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'cashier-1',
        },
        {
          id: '2',
          restaurant_id: 'rest-1',
          order_number: 'ORD-002',
          customer_name: 'Meja 3',
          items: [],
          total_amount: 75000,
          tax_amount: 7500,
          discount_amount: 0,
          final_amount: 82500,
          status: 'ready' as const,
          payment_status: 'completed' as const,
          created_at: new Date(Date.now() - 180000).toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'cashier-1',
        },
      ];
      addOrder(mockOrders[0]);
      addOrder(mockOrders[1]);
      addReadyOrder(mockOrders[1]);
      setLoading(false);
    }, 500);

    // Exit fullscreen on ESC key (for dev testing)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isKioskMode) {
        setKioskMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      socket.off('order:created');
      socket.off('order:status:changed');
      socket.off('order:updated');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Enter fullscreen on load (if supported)
  useEffect(() => {
    if (isKioskMode && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        console.log('Fullscreen not available');
      });
    }
  }, [isKioskMode]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Top Bar */}
      <div className="bg-black bg-opacity-50 p-4 border-b border-gray-700">
        <div className="max-w-full mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-display-lg font-bold">🍽️ DISPLAY PESANAN</h1>
            <div className="text-sm text-gray-400">
              {new Date().toLocaleTimeString('id-ID')}
            </div>
          </div>
          <OrderStats />
        </div>
      </div>

      {/* Main Display */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">⏳</div>
              <p className="text-2xl">Menghubungkan...</p>
            </div>
          </div>
        ) : (
          <OrderQueue />
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-black bg-opacity-50 p-4 text-center text-sm text-gray-500 border-t border-gray-700">
        {isKioskMode ? 'Tekan ESC untuk keluar mode kiosk' : 'Klik order untuk tandai selesai'}
      </div>
    </div>
  );
}

export default App;
