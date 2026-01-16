'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Heart, Star, Truck, Package } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import CurrencyDisplay from './CurrencyDisplay';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (productId: string) => void;
  isFavorite?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Dédupliquer les images pour éviter les doublons
  const images = React.useMemo(() => {
    const rawImages = product.images && product.images.length > 0 ? product.images : [product.image];
    // Utiliser un Set pour éliminer les doublons
    return Array.from(new Set(rawImages));
  }, [product.images, product.image]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentImageIndex(0);
      setQuantity(1);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: parseInt(product.id),
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto my-8 relative animate-fadeIn">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
          aria-label="Fermer"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Galerie d'images */}
          <div className="space-y-4">
            {/* Image principale */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={images[currentImageIndex]}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    NOUVEAU
                  </span>
                )}
                {product.isPromo && discountPercentage > 0 && (
                  <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    -{discountPercentage}%
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-custom-blue text-white text-xs px-3 py-1 rounded-full font-semibold">
                    TOP VENTE
                  </span>
                )}
              </div>

              {/* Navigation des images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full shadow-md transition-all"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>

                  <button
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full shadow-md transition-all"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>

                  {/* Compteur d'images */}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-full">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Miniatures */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-custom-blue ring-2 ring-custom-blue ring-opacity-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Miniature ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Détails du produit */}
          <div className="flex flex-col space-y-6">
            {/* En-tête */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h2>

              {/* Catégorie */}
              <p className="text-sm text-gray-500 mb-3">
                Catégorie: <span className="text-custom-blue font-medium">{product.category}</span>
                {product.subcategory && ` > ${product.subcategory}`}
              </p>

              {/* Note et avis */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} avis)
                </span>
              </div>
            </div>

            {/* Prix */}
            <div className="border-t border-b border-gray-200 py-4">
              <CurrencyDisplay
                priceRMB={product.price}
                showBothCurrencies={true}
                primaryCurrency="XOF"
                size="lg"
              />
              {product.originalPrice && (
                <div className="mt-2">
                  <CurrencyDisplay
                    priceRMB={product.originalPrice}
                    showBothCurrencies={false}
                    primaryCurrency="XOF"
                    size="md"
                    className="line-through text-gray-400"
                  />
                  <span className="ml-2 text-sm text-green-600 font-semibold">
                    Économisez {discountPercentage}%
                  </span>
                </div>
              )}
            </div>

            {/* Informations de livraison */}
            <div className="space-y-3">
              {product.freeShipping && (
                <div className="flex items-center gap-3 text-green-600">
                  <Truck size={20} />
                  <span className="font-medium">Livraison gratuite</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Package size={20} />
                <span>En stock - Expédié sous 24-48h</span>
              </div>
            </div>

            {/* Description (si disponible) */}
            {product.description && (
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Stock disponible */}
            {product.stock !== undefined && (
              <div className="flex items-center gap-2">
                <Package size={18} className="text-gray-600" />
                <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
                </span>
              </div>
            )}

            {/* Sélecteur de quantité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center font-semibold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-10 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-custom-blue hover:bg-custom-blue-hover text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Ajouter au panier
              </button>
              <button
                onClick={() => onToggleFavorite(product.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isFavorite
                    ? 'bg-red-50 border-red-500 text-red-500'
                    : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                }`}
                aria-label="Ajouter aux favoris"
              >
                <Heart
                  size={24}
                  className={isFavorite ? 'fill-current' : ''}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductModal;
