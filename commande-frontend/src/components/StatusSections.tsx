import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, ArrowRight } from 'lucide-react';
import { Product, ProductStatus } from '../types';
import { PRODUCT_STATUSES, getStatusInfo } from '../constants/productStatus';
import { publicService, PublicProduct } from '../services/publicService';

interface StatusSectionsProps {
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  favorites: string[];
}

const StatusSections: React.FC<StatusSectionsProps> = ({
  onAddToCart,
  onToggleFavorite,
  favorites
}) => {
  const [productsData, setProductsData] = useState<{
    [key in ProductStatus]: Product[];
  }>({
    best_seller: [],
    new: [],
    on_sale: []
  });
  const [loading, setLoading] = useState<{
    [key in ProductStatus]: boolean;
  }>({
    best_seller: true,
    new: true,
    on_sale: true
  });

  useEffect(() => {
    loadProductsByStatus();
  }, []);

  const loadProductsByStatus = async () => {
    try {
      console.log('🔍 Début du chargement des produits par statut...');
      
      const promises = PRODUCT_STATUSES.map(async (status) => {
        try {
          console.log(`📡 Chargement des produits pour le statut: ${status.value} (${status.label})`);
          
          let response;
          switch (status.value) {
            case 'best_seller':
              response = await publicService.getBestSellers();
              break;
            case 'new':
              response = await publicService.getNewProducts();
              break;
            case 'on_sale':
              response = await publicService.getOnSaleProducts();
              break;
            default:
              throw new Error(`Statut non supporté: ${status.value}`);
          }
          
          console.log(`✅ Réponse API pour ${status.value}:`, response);
          console.log(`📊 Nombre de produits récupérés pour ${status.value}:`, response.data.length);
          
          const convertedProducts = response.data.map((product: PublicProduct) => {
            const converted = publicService.convertToFrontendProduct(product);
            console.log(`🔄 Produit converti:`, {
              id: converted.id,
              name: converted.name,
              status: product.status,
              convertedStatus: converted.status
            });
            return converted;
          });
          
          console.log(`✨ Produits convertis pour ${status.value}:`, convertedProducts);
          
          return { status: status.value, products: convertedProducts };
        } catch (error) {
          console.error(`❌ Erreur lors du chargement des produits ${status.label}:`, error);
          return { status: status.value, products: [] };
        }
      });

      const results = await Promise.all(promises);
      console.log('📦 Tous les résultats:', results);
      
      const newProductsData = { ...productsData };
      const newLoading = { ...loading };
      
      results.forEach(({ status, products }) => {
        console.log(`🎯 Attribution des produits pour ${status}:`, products.length, 'produits');
        newProductsData[status] = products.slice(0, 8); // Limiter à 8 produits par section
        newLoading[status] = false;
      });

      console.log('🏁 Données finales:', newProductsData);
      setProductsData(newProductsData);
      setLoading(newLoading);
    } catch (error) {
      console.error('💥 Erreur globale lors du chargement des produits par statut:', error);
      // Set all loading to false in case of global error
      setLoading({
        best_seller: false,
        new: false,
        on_sale: false
      });
    }
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={() => onToggleFavorite(product.id)}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-colors ${
            favorites.includes(product.id)
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
        </button>
        {product.isPromo && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
            PROMO
          </div>
        )}
        {product.isNew && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs font-bold rounded">
            NOUVEAU
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">({product.reviews})</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-blue-600">
              {product.price.toFixed(2)} CFA
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {product.originalPrice.toFixed(2)} CFA
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onAddToCart(product)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Ajouter au panier</span>
        </button>
      </div>
    </div>
  );

  const StatusSection: React.FC<{ status: ProductStatus }> = ({ status }) => {
    const statusInfo = getStatusInfo(status);
    const products = productsData[status];
    const isLoading = loading[status];

    console.log(`🎨 Rendu de StatusSection pour ${status}:`, {
      statusInfo,
      products,
      productsLength: products?.length,
      isLoading
    });

    if (!statusInfo) {
      console.log(`❌ StatusInfo non trouvé pour: ${status}`);
      return null;
    }

    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{statusInfo.emoji}</span>
            <h2 className="text-2xl font-bold text-gray-900">{statusInfo.label}</h2>
          </div>
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
            <span>Voir tout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="bg-gray-300 h-48 rounded-md mb-4"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-4 rounded w-3/4 mb-4"></div>
                <div className="bg-gray-300 h-8 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">{statusInfo.emoji}</div>
            <p className="text-gray-600 text-lg">
              Aucun produit dans cette catégorie pour le moment
            </p>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {PRODUCT_STATUSES.map((status) => (
        <StatusSection key={status.value} status={status.value} />
      ))}
    </div>
  );
};

export default StatusSections;