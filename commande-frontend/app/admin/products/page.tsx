'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import ProductTable from '../../../src/components/admin/ProductTable';
import ProductForm from '../../../src/components/admin/ProductForm';
import Pagination from '../../../src/components/admin/Pagination';
import { adminService } from '../../../src/services/adminService';
import { AdminProduct, ProductFormData, AdminCategory, PaginationMeta, AdminFilters } from '../../../src/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | undefined>();
  const [filters, setFilters] = useState<AdminFilters>({
    search: '',
    status: '',
    category_id: undefined,
    page: 1,
    per_page: 10
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters.page, filters.search, filters.status, filters.category_id]);

  const loadCategories = async () => {
    try {
      const response = await adminService.getCategories(1, 100);
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getProducts(
        filters.page || 1,
        filters.per_page || 10,
        {
          search: filters.search,
          status: filters.status || undefined,
          category_id: filters.category_id
        }
      );
      // Normalise la réponse pour garantir un tableau
      setProducts(Array.isArray(response.data) ? response.data : (response.data ? [response.data as unknown as AdminProduct] : []));
      // Assure que meta est toujours défini pour éviter les erreurs d'accès
      setMeta(
        response.meta ?? {
          current_page: filters.page || 1,
          last_page: 1,
          per_page: filters.per_page || 10,
          total: response.data?.length ?? 0,
          from: 0,
          to: 0
        }
      );
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (data: ProductFormData) => {
    try {
      await adminService.createProduct(data);
      setShowForm(false);
      setEditingProduct(undefined);
      await loadProducts();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      throw error;
    }
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;
    
    try {
      await adminService.updateProduct(editingProduct.id, data);
      setShowForm(false);
      setEditingProduct(undefined);
      await loadProducts();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      throw error;
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await adminService.deleteProduct(id);
      await loadProducts();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleStatusChange = async (id: number, status: 'active' | 'inactive') => {
    try {
      const product = products.find(p => p.id === id);
      if (product) {
        await adminService.updateProduct(id, { ...product, status });
        await loadProducts();
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleStatusFilterChange = (status: string) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handleCategoryFilterChange = (category_id: string) => {
    setFilters(prev => ({ 
      ...prev, 
      category_id: category_id ? parseInt(category_id) : undefined, 
      page: 1 
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des produits</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez votre catalogue de produits
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Nouveau produit
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
              <ProductForm
                product={editingProduct}
                categories={categories}
                onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                onCancel={handleCancel}
              />
            </div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filters.status || ''}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            <div>
              <select
                value={filters.category_id || ''}
                onChange={(e) => handleCategoryFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total produits</p>
                <p className="text-2xl font-bold text-gray-900">{meta?.total ?? 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produits actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(products) ? products.filter(p => p.status === 'active').length : 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produits vedettes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(products) ? products.filter(p => p.is_featured).length : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDeleteProduct}
          onStatusChange={handleStatusChange}
          isLoading={loading}
        />

        {/* Pagination */}
        {meta?.last_page > 1 && (
          <Pagination
            meta={meta}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </AdminLayout>
  );
}
