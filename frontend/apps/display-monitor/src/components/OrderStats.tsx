import React from 'react';
import { useDisplayStore } from '../store';
import { formatTime } from '@pos/utils';

export function OrderStats() {
  const { orders, readyOrders } = useDisplayStore();
  
  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = readyOrders.length;
  const totalItems = orders.reduce((sum, o) => sum + o.items.length, 0);

  const StatBadge = ({ label, value, bgColor }: { label: string; value: number; bgColor: string }) => (
    <div className={`${bgColor} text-white rounded-lg p-4 text-center`}>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatBadge label="Pending" value={pendingCount} bgColor="bg-blue-500" />
      <StatBadge label="Proses" value={preparingCount} bgColor="bg-yellow-500" />
      <StatBadge label="Siap" value={readyCount} bgColor="bg-green-500" />
      <StatBadge label="Items" value={totalItems} bgColor="bg-purple-500" />
    </div>
  );
}
