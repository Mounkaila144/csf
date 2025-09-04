import React from 'react';
import { Star, Truck } from 'lucide-react';
import { FilterOptions } from '../types';

interface SidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ filters, onFilterChange }) => {
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-28">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Filtres</h3>
      
      {/* Price range */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Prix (€)</h4>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange[0]}
              onChange={(e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])}
              className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange[1]}
              onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
              className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Note minimum</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => updateFilter('rating', rating)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                  />
                ))}
                <span className="text-sm text-gray-600">& plus</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Free shipping */}
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.freeShipping}
            onChange={(e) => updateFilter('freeShipping', e.target.checked)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <Truck size={18} className="text-green-600" />
          <span className="text-gray-700">Livraison gratuite</span>
        </label>
      </div>

      {/* Sort */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Trier par</h4>
        <select
          value={filters.sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
        >
          <option value="bestseller">Meilleures ventes</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="rating">Mieux notés</option>
          <option value="newest">Nouveautés</option>
        </select>
      </div>

      {/* Reset filters */}
      <button
        onClick={() => onFilterChange({
          priceRange: [0, 1000],
          categories: [],
          rating: 0,
          freeShipping: false,
          sort: 'bestseller'
        })}
        className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
};

export default Sidebar;