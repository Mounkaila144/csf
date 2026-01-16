import React, { useState } from 'react';
import { Star, Heart, ShoppingCart, Truck } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import CurrencyDisplay from './CurrencyDisplay';
import ImageGallery from './ImageGallery';
import ProductModal from './ProductModal';

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
  console.log('🎴 [ProductCard] Rendu de la carte pour:', product.name);
  console.log('💰 [ProductCard] Prix du produit:', product.price, 'Type:', typeof product.price);
  
  const { addItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group cursor-pointer"
      >
      {/* Image container */}
      <div className="relative overflow-hidden">
        <ImageGallery
          images={product.images && product.images.length > 0 ? product.images : [product.image]}
          alt={product.name}
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
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
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
        <div className="mb-4">
          <CurrencyDisplay
            priceRMB={product.price}
            showBothCurrencies={true}
            primaryCurrency="XOF"
            size="md"
          />
          {product.originalPrice && (
            <div className="mt-1">
              <CurrencyDisplay
                priceRMB={product.originalPrice}
                showBothCurrencies={false}
                primaryCurrency="XOF"
                size="sm"
                className="line-through text-gray-400"
              />
            </div>
          )}
        </div>

        {/* Add to cart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          className="w-full bg-custom-blue hover:bg-custom-blue-hover text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-custom-blue-hover"
        >
          <ShoppingCart size={18} />
          Ajouter au panier
        </button>
      </div>
    </div>

      {/* Modal de détails du produit */}
      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onToggleFavorite={onToggleFavorite}
        isFavorite={isFavorite}
      />
    </>
  );
};

export default ProductCard;