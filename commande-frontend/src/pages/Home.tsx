import React, { useState, useEffect } from 'react';
import CategoryMenu from '../components/CategoryMenu';
import Banner from '../components/Banner';
import Sidebar from '../components/Sidebar';
import ProductGrid from '../components/ProductGrid';
import FeaturedSections from '../components/FeaturedSections';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { banners } from '../data/mockData'; // On garde les banners mockées pour l'instant
import { FilterOptions, Product, Category } from '../types';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { publicService, PublicProduct, PublicCategory } from '../services/publicService';

interface HomeProps {
  searchQuery?: string;
}

export const Home: React.FC<HomeProps> = ({ searchQuery = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 1000],
    categories: [],
    rating: 0,
    freeShipping: false,
    sort: 'bestseller'
  });

  // États pour les données API
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();

  // Charger les données depuis l'API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les produits et catégories en parallèle
      const [productsResponse, categoriesResponse] = await Promise.all([
        publicService.getProducts(1, 50), // Charger plus de produits pour la page d'accueil
        publicService.getActiveCategories()
      ]);

      // Convertir les produits vers le format attendu par les composants
      const convertedProducts = productsResponse.data.map(product => 
        publicService.convertToFrontendProduct(product)
      );

      // Convertir les catégories vers le format attendu par les composants
      const convertedCategories = categoriesResponse.data.map(category =>
        publicService.convertToFrontendCategory(category)
      );

      setProducts(convertedProducts);
      setCategories(convertedCategories);
      
      // Définir les produits vedettes (pour l'instant, on prend les premiers)
      setFeaturedProducts(convertedProducts.slice(0, 8));

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    console.log('Category selected:', categoryId);
    console.log('Available categories:', categories);
    console.log('Available products:', products);
    
    setSelectedCategory(categoryId);
    
    // Si c'est une sous-catégorie (format: "categoryId-subcategoryId")
    if (categoryId.includes('-')) {
      const [catId, subId] = categoryId.split('-');
      console.log('Subcategory filter - catId:', catId, 'subId:', subId);
      setFilters(prev => ({ 
        ...prev, 
        categories: [catId],
        subcategoryId: parseInt(subId)
      }));
    } else {
      // Si c'est une catégorie principale
      console.log('Category filter - catId:', categoryId);
      setFilters(prev => ({ 
        ...prev, 
        categories: [categoryId],
        subcategoryId: undefined
      }));
    }
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    console.log('Filtering product:', product.name, 'categoryId:', product.categoryId, 'subcategoryId:', product.subcategoryId);
    
    if (searchQuery) {
      return product.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (selectedCategory) {
      if (selectedCategory.includes('-')) {
        // Filtrage par sous-catégorie
        const [catId, subId] = selectedCategory.split('-');
        console.log('Subcategory filter - looking for catId:', catId, 'subId:', subId);
        return product.categoryId === catId && product.subcategoryId === subId;
      } else {
        // Filtrage par catégorie
        console.log('Category filter - looking for catId:', selectedCategory);
        return product.categoryId === selectedCategory;
      }
    }
    return true;
  });

  console.log('Filtered products count:', filteredProducts.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Menu */}
      <CategoryMenu 
        categories={categories}
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />
      
      {/* Banner */}
      <Banner banners={banners} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <Sidebar
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </aside>
          
          {/* Products Grid */}
          <main className="lg:w-3/4">
            <ProductGrid
              products={filteredProducts}
              filters={filters}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onAddToCart={addToCart}
            />
          </main>
        </div>
      </div>
      
      {/* Featured Sections */}
      <FeaturedSections
        products={featuredProducts}
        onAddToCart={addToCart}
        onToggleFavorite={toggleFavorite}
        favorites={favorites}
      />
      
      {/* Footer */}
      <Footer />
      
      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};