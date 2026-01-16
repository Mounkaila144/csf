import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Product, ProductStatus } from '../types';
import { PRODUCT_STATUSES, getStatusInfo } from '../constants/productStatus';
import { publicService, PublicProduct } from '../services/publicService';
import ProductCard from './ProductCard';

interface StatusSectionsProps {
  onToggleFavorite: (productId: string) => void;
  favorites: string[];
}

const StatusSections: React.FC<StatusSectionsProps> = ({
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
    console.log('🔍 [StatusSections] Début du chargement des produits par statut');
    
    try {
      const promises = PRODUCT_STATUSES.map(async (status) => {
        try {
          console.log(`📡 [StatusSections] Chargement des produits ${status.label}...`);
          
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
          
          console.log(`✅ [StatusSections] Réponse API pour ${status.label}:`, response);
          console.log(`📦 [StatusSections] Nombre de produits reçus pour ${status.label}:`, response.data?.length || 0);
          
          if (response.data && response.data.length > 0) {
            console.log(`🔍 [StatusSections] Premier produit brut pour ${status.label}:`, response.data[0]);
            console.log(`💰 [StatusSections] Prix du premier produit pour ${status.label}:`, response.data[0]?.price);
          }
          
          const convertedProducts = response.data.map((product: PublicProduct) =>
            publicService.convertToFrontendProduct(product)
          );
          
          console.log(`🔄 [StatusSections] Produits convertis pour ${status.label}:`, convertedProducts);
          
          if (convertedProducts.length > 0) {
            console.log(`💵 [StatusSections] Prix du premier produit converti pour ${status.label}:`, convertedProducts[0]?.price);
          }
          
          return { status: status.value, products: convertedProducts };
        } catch (error) {
          console.error(`❌ [StatusSections] Erreur lors du chargement des produits ${status.label}:`, error);
          return { status: status.value, products: [] };
        }
      });

      const results = await Promise.all(promises);
      
      console.log('📊 [StatusSections] Résultats finaux:', results);
      
      const newProductsData = { ...productsData };
      const newLoading = { ...loading };
      
      results.forEach(({ status, products }) => {
        newProductsData[status] = products.slice(0, 8); // Limiter à 8 produits par section
        newLoading[status] = false;
        
        console.log(`✂️ [StatusSections] Produits pour ${status} après slice:`, newProductsData[status].length);
        if (newProductsData[status].length > 0) {
          console.log(`💰 [StatusSections] Prix du premier produit final pour ${status}:`, newProductsData[status][0]?.price);
        }
      });

      setProductsData(newProductsData);
      setLoading(newLoading);
      
      console.log('✅ [StatusSections] Chargement terminé, state mis à jour');
    } catch (error) {
      console.error('❌ [StatusSections] Erreur globale lors du chargement des produits par statut:', error);
      // Set all loading to false in case of global error
      setLoading({
        best_seller: false,
        new: false,
        on_sale: false
      });
    }
  };

  const StatusSection: React.FC<{ status: ProductStatus }> = ({ status }) => {
    const statusInfo = getStatusInfo(status);
    const products = productsData[status];
    const isLoading = loading[status];

    if (!statusInfo) return null;

    return (
      <section className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-2xl sm:text-3xl">{statusInfo.emoji}</span>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{statusInfo.label}</h2>
          </div>
          <button className="flex items-center space-x-1 sm:space-x-2 text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base">
            <span>Voir tout</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-3 sm:p-4 animate-pulse">
                <div className="bg-gray-300 h-40 sm:h-48 rounded-md mb-3 sm:mb-4"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-4 rounded w-3/4 mb-3 sm:mb-4"></div>
                <div className="bg-gray-300 h-8 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favorites.includes(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">{statusInfo.emoji}</div>
            <p className="text-gray-600 text-base sm:text-lg px-4">
              Aucun produit dans cette catégorie pour le moment
            </p>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12">
      {PRODUCT_STATUSES.map((status) => (
        <StatusSection key={status.value} status={status.value} />
      ))}
    </div>
  );
};

export default StatusSections;