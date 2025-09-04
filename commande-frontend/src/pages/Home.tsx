import React, { useState } from 'react';
import CategoryMenu from '../components/CategoryMenu';
import Banner from '../components/Banner';
import Sidebar from '../components/Sidebar';
import ProductGrid from '../components/ProductGrid';
import FeaturedSections from '../components/FeaturedSections';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { products, categories, banners } from '../data/mockData';
import { FilterOptions } from '../types';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';

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

  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFilters(prev => ({ ...prev, categories: [categoryId] }));
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    if (searchQuery) {
      return product.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (selectedCategory) {
      return product.category === selectedCategory;
    }
    return true;
  });

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
        products={products}
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