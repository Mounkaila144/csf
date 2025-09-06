import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface FeaturedSectionsProps {
  products?: Product[];
  onToggleFavorite: (productId: string) => void;
  favorites?: string[];
}

const FeaturedSections: React.FC<FeaturedSectionsProps> = ({
  products = [],
  onToggleFavorite,
  favorites = []
}) => {
  // Early return if products is undefined or not an array
  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-lg">Chargement des produits en vedette...</p>
        </div>
      </div>
    );
  }

  // Filter products with additional safety checks
  const bestSellers = products.filter(p => p && typeof p === 'object' && p.isBestSeller).slice(0, 4);
  const newProducts = products.filter(p => p && typeof p === 'object' && p.isNew).slice(0, 4);
  const promoProducts = products.filter(p => p && typeof p === 'object' && p.isPromo).slice(0, 4);

  const SectionGrid: React.FC<{ products: Product[]; title: string; bgColor: string }> = ({ 
    products, 
    title, 
    bgColor 
  }) => (
    <section className={`${bgColor} py-12`}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favorites.includes(product.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div className="space-y-0">
      <SectionGrid
        products={bestSellers}
        title="🏆 Meilleures Ventes"
        bgColor="bg-gradient-to-br from-blue-50 to-sky-100"
      />
      
      <SectionGrid
        products={newProducts}
        title="✨ Nouveautés"
        bgColor="bg-gradient-to-br from-green-50 to-green-100"
      />
      
      <SectionGrid
        products={promoProducts}
        title="🔥 Promotions Spéciales"
        bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
      />
    </div>
  );
};

export default FeaturedSections;