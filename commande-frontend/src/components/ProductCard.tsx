import React from 'react';
import { Star, Heart, ShoppingCart, Truck } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onToggleFavorite: (productId: string) => void;
  isFavorite?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onToggleFavorite, 
  isFavorite = false 
}) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: parseInt(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
      {/* Image container */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
              NOUVEAU
            </span>
          )}
          {product.isPromo && discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
              -{discountPercentage}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-custom-blue text-white text-xs px-2 py-1 rounded font-medium">
              TOP VENTE
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={() => onToggleFavorite(product.id)}
          className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all"
        >
          <Heart
            size={18}
            className={`${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'} transition-colors`}
          />
        </button>

        {/* Free shipping badge */}
        {product.freeShipping && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            <Truck size={12} />
            <span>Livraison gratuite</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 h-12">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-custom-blue">
              {product.price.toLocaleString('fr-FR')} CFA
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {product.originalPrice.toLocaleString('fr-FR')} CFA
              </span>
            )}
          </div>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-custom-blue hover:bg-custom-blue-hover text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-custom-blue-hover"
        >
          <ShoppingCart size={18} />
          Ajouter au panier
        </button>
      </div>
    </div>
  );
};

export default ProductCard;