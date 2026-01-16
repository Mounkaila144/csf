'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import SubcategoryTable from '../../../src/components/admin/SubcategoryTable';
import SubcategoryForm from '../../../src/components/admin/SubcategoryForm';
import Pagination from '../../../src/components/admin/Pagination';
import { adminService } from '../../../src/services/adminService';
import { AdminSubcategory, SubcategoryFormData, PaginationMeta, AdminCategory } from '../../../src/types';

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<AdminSubcategory[]>([]);
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
  const [editingSubcategory, setEditingSubcategory] = useState<AdminSubcategory | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    loadSubcategories();
    loadCategories();
  }, [meta?.current_page, searchTerm, statusFilter, categoryFilter]);

  const loadSubcategories = async () => {
    try {
      setLoading(true);
      const filters = categoryFilter !== 'all' ? { category_id: categoryFilter } : {};
      const response = await adminService.getSubcategories(meta?.current_page || 1, meta?.per_page || 10, categoryFilter !== 'all' ? Number(categoryFilter) : undefined);
      setSubcategories(response.data);
      setMeta({
        ...response.meta,
        from: response.meta.from || 0,
        to: response.meta.to || 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des sous-catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await adminService.getCategories(1, 100); // Get all categories
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const handleCreateSubcategory = async (data: SubcategoryFormData) => {
    try {
      await adminService.createSubcategory(data);
      setShowForm(false);
      setEditingSubcategory(undefined);
      await loadSubcategories();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      throw error;
    }
  };

  const handleUpdateSubcategory = async (data: SubcategoryFormData) => {
    if (!editingSubcategory) return;
    
    try {
      await adminService.updateSubcategory(editingSubcategory.id, data);
      setShowForm(false);
      setEditingSubcategory(undefined);
      await loadSubcategories();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      throw error;
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    try {
      await adminService.deleteSubcategory(id);
      await loadSubcategories();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleStatusChange = async (id: number, status: 'active' | 'inactive') => {
    try {
      const subcategory = subcategories.find(s => s.id === id);
      if (subcategory) {
        await adminService.updateSubcategory(id, { ...subcategory, is_active: status === 'active' });
        await loadSubcategories();
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleEdit = (subcategory: AdminSubcategory) => {
    setEditingSubcategory(subcategory);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSubcategory(undefined);
  };

  const handlePageChange = (page: number) => {
    setMeta(prev => ({ ...prev, current_page: page }));
  };

  const filteredSubcategories = subcategories.filter(subcategory => {
    const matchesSearch = subcategory.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? subcategory.is_active : !subcategory.is_active);
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des sous-catégories</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez vos sous-catégories de produits
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Nouvelle sous-catégorie
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <SubcategoryForm
                subcategory={editingSubcategory}
                categories={categories}
                onSubmit={editingSubcategory ? handleUpdateSubcategory : handleCreateSubcategory}
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
                placeholder="Rechercher une sous-catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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
        <SubcategoryTable
          subcategories={filteredSubcategories}
          onEdit={handleEdit}
          onDelete={handleDeleteSubcategory}
          onStatusChange={handleStatusChange}
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
    </AdminLayout>
  );
}