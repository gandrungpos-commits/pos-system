import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import type { MenuItem } from '@pos/types';
import { setMenuItems, setSelectedCategory } from '../store/menuSlice';

interface MenuCategory {
  name: string;
  label: string;
}

const CATEGORIES: MenuCategory[] = [
  { name: 'all', label: 'Semua' },
  { name: 'makanan', label: 'Makanan' },
  { name: 'minuman', label: 'Minuman' },
  { name: 'dessert', label: 'Dessert' },
];

export function MenuGrid() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, selectedCategory } = useSelector((state: RootState) => state.menu);

  const filteredItems =
    selectedCategory === 'all'
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const handleAddItem = (item: MenuItem) => {
    // Will dispatch addOrderItem action
    console.log('Add item:', item);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.name}
            onClick={() => dispatch(setSelectedCategory(category.name))}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category.name
                ? 'bg-pos-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto flex-1">
        {filteredItems.map((item) => (
          <div key={item.id} className="card cursor-pointer hover:shadow-lg transition-shadow">
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
            )}
            <h3 className="font-semibold text-sm truncate">{item.name}</h3>
            <p className="text-gray-500 text-xs mb-2 line-clamp-2">{item.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-pos-primary font-bold">
                Rp {item.price.toLocaleString('id-ID')}
              </span>
              <button
                onClick={() => handleAddItem(item)}
                disabled={!item.is_available}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  item.is_available
                    ? 'bg-pos-secondary text-white hover:bg-teal-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Tidak ada menu tersedia</p>
        </div>
      )}
    </div>
  );
}
