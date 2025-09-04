import React from 'react';
import { Product, FilterOptions } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products?: Product[];
  filters?: FilterOptions;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  favorites?: string[];
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products = [],
  filters,
  onAddToCart,
  onToggleFavorite,
  favorites = []
}) => {
  // Early return if filters is undefined or products is empty
  if (!filters || !filters.priceRange || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  // Filter and sort products with additional safety checks
  const filteredProducts = products
    .filter(product => {
      // Safety check for product
      if (!product || typeof product !== 'object') return false;

      // Price filter - with safety checks
      if (filters.priceRange && Array.isArray(filters.priceRange) && filters.priceRange.length >= 2) {
        if (typeof product.price === 'number' && (product.price < filters.priceRange[0] || product.price > filters.priceRange[1])) {
          return false;
        }
      }

      // Rating filter
      if (filters.rating && filters.rating > 0 && typeof product.rating === 'number' && product.rating < filters.rating) {
        return false;
      }

      // Free shipping filter
      if (filters.freeShipping && !product.freeShipping) {
        return false;
      }

      // Category filter
      if (filters.categories && Array.isArray(filters.categories) && filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Safety checks for sorting
      if (!a || !b) return 0;

      switch (filters.sort) {
        case 'price-asc':
          return (typeof a.price === 'number' ? a.price : 0) - (typeof b.price === 'number' ? b.price : 0);
        case 'price-desc':
          return (typeof b.price === 'number' ? b.price : 0) - (typeof a.price === 'number' ? a.price : 0);
        case 'rating':
          return (typeof b.rating === 'number' ? b.rating : 0) - (typeof a.rating === 'number' ? a.rating : 0);
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case 'bestseller':
        default:
          return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      }
    });

  return (
    <div className="space-y-6">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          {filteredProducts.length} produits trouvés
        </h2>
        
        <div className="text-sm text-gray-600">
          Trié par: {
            filters.sort === 'price-asc' ? 'Prix croissant' :
            filters.sort === 'price-desc' ? 'Prix décroissant' :
            filters.sort === 'rating' ? 'Mieux notés' :
            filters.sort === 'newest' ? 'Nouveautés' :
            'Meilleures ventes'
          }
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(product.id)}
          />
        ))}
      </div>

      {/* No results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun produit ne correspond à vos critères</p>
          <p className="text-gray-400 mt-2">Essayez de modifier vos filtres</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;