import React from 'react';
import type { MenuItem } from '@pos/types';
import { formatCurrency } from '@pos/utils';

interface MenuDisplayProps {
  items: MenuItem[];
  onAddItem: (item: MenuItem, quantity: number) => void;
}

export function MenuDisplay({ items, onAddItem }: MenuDisplayProps) {
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  const handleAdd = (item: MenuItem) => {
    const quantity = quantities[item.id] || 1;
    onAddItem(item, quantity);
    setQuantities({ ...quantities, [item.id]: 1 });
  };

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Scan QR code untuk melihat menu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <h3 className="font-bold text-lg mb-1">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{item.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-pos-primary font-bold text-lg">
                  {formatCurrency(item.price, 'IDR')}
                </span>
                
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() =>
                      setQuantities({
                        ...quantities,
                        [item.id]: Math.max(1, (quantities[item.id] || 1) - 1),
                      })
                    }
                    className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{quantities[item.id] || 1}</span>
                  <button
                    onClick={() =>
                      setQuantities({
                        ...quantities,
                        [item.id]: (quantities[item.id] || 1) + 1,
                      })
                    }
                    className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                  
                  <button
                    onClick={() => handleAdd(item)}
                    disabled={!item.is_available}
                    className={`ml-2 px-4 py-2 rounded-lg font-medium ${
                      item.is_available
                        ? 'bg-pos-secondary text-white hover:bg-teal-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {item.is_available ? 'Pesan' : 'Habis'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
