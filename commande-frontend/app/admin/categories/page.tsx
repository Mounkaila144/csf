'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import CategoryTable from '../../../src/components/admin/CategoryTable';
import CategoryForm from '../../../src/components/admin/CategoryForm';
import Pagination from '../../../src/components/admin/Pagination';
import SubcategoriesModal from '../../../src/components/admin/SubcategoriesModal';
import { adminService } from '../../../src/services/adminService';
import { AdminCategory, CategoryFormData, PaginationMeta } from '../../../src/types';

export default function CategoriesPage() {
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
  const [editingCategory, setEditingCategory] = useState<AdminCategory | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedCategoryForSubcategories, setSelectedCategoryForSubcategories] = useState<AdminCategory | null>(null);
  const [showSubcategoriesModal, setShowSubcategoriesModal] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [meta?.current_page, searchTerm, statusFilter]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCategories(meta?.current_page || 1, meta?.per_page || 10);
      setCategories(response.data);
      setMeta({
        ...response.meta,
        from: response.meta.from || 0,
        to: response.meta.to || 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      await adminService.createCategory(data);
      setShowForm(false);
      setEditingCategory(undefined);
      await loadCategories();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      throw error;
    }
  };

  const handleUpdateCategory = async (data: CategoryFormData) => {
    if (!editingCategory) return;
    
    try {
      await adminService.updateCategory(editingCategory.id, data);
      setShowForm(false);
      setEditingCategory(undefined);
      await loadCategories();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      throw error;
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await adminService.deleteCategory(id);
      await loadCategories();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleStatusChange = async (id: number, status: 'active' | 'inactive') => {
    try {
      const category = categories.find(c => c.id === id);
      if (category) {
        await adminService.updateCategory(id, { ...category, is_active: status === 'active' });
        await loadCategories();
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleEdit = (category: AdminCategory) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(undefined);
  };

  const handlePageChange = (page: number) => {
    setMeta(prev => ({ ...prev, current_page: page }));
  };

  const handleManageSubcategories = (category: AdminCategory) => {
    setSelectedCategoryForSubcategories(category);
    setShowSubcategoriesModal(true);
  };

  const handleCloseSubcategoriesModal = () => {
    setShowSubcategoriesModal(false);
    setSelectedCategoryForSubcategories(null);
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && category.is_active) || 
      (statusFilter === 'inactive' && !category.is_active);
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des catégories</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez vos catégories de produits
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Nouvelle catégorie
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <CategoryForm
                category={editingCategory}
                onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
                onCancel={handleCancel}
              />
            </div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <CategoryTable
          categories={filteredCategories}
          onEdit={handleEdit}
          onDelete={handleDeleteCategory}
          onStatusChange={handleStatusChange}
          onManageSubcategories={handleManageSubcategories}
          isLoading={loading}
        />

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <Pagination
            meta={meta}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modal des sous-catégories */}
      {selectedCategoryForSubcategories && (
        <SubcategoriesModal
          category={selectedCategoryForSubcategories}
          isOpen={showSubcategoriesModal}
          onClose={handleCloseSubcategoriesModal}
        />
      )}
    </AdminLayout>
  );
}
