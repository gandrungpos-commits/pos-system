import React, { useEffect } from 'react';
import type { Order } from '@pos/types';
import { useDisplayStore } from '../store';
import { formatTime } from '@pos/utils';

export function OrderQueue() {
  const { orders, readyOrders, completeOrder } = useDisplayStore();
  
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');

  const OrderCard = ({ order, isReady }: { order: Order; isReady?: boolean }) => (
    <div
      className={`rounded-xl p-6 text-center shadow-lg transform transition-all ${
        isReady
          ? 'bg-gradient-to-br from-green-400 to-green-600'
          : 'bg-gradient-to-br from-blue-400 to-blue-600'
      } text-white`}
    >
      <div className="text-5xl font-bold mb-4">{order.order_number}</div>
      <div className="text-2xl mb-2">Meja {order.customer_name || 'Unknown'}</div>
      <div className="text-lg opacity-90">{formatTime(order.created_at)}</div>
      {isReady && (
        <div className="mt-4 text-base bg-white text-green-600 rounded-lg py-2 font-bold">
          ✓ SIAP DIAMBIL
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-y-auto p-6">
      {/* Pending Orders */}
      {pendingOrders.slice(0, 3).map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}

      {/* Preparing Orders */}
      {preparingOrders.slice(0, 3).map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}

      {/* Ready Orders */}
      {readyOrders.slice(0, 3).map((order) => (
        <div key={order.id} onClick={() => completeOrder(order.id)} className="cursor-pointer">
          <OrderCard order={order} isReady={true} />
        </div>
      ))}

      {orders.length === 0 && readyOrders.length === 0 && (
        <div className="col-span-full flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl mb-4">🍜</div>
            <p className="text-3xl text-gray-600 font-semibold">Menunggu pesanan...</p>
          </div>
        </div>
      )}
    </div>
  );
}
