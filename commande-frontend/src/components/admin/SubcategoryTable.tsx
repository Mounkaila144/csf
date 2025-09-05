'use client';

import { useState } from 'react';
import { AdminSubcategory } from '../../types';

interface SubcategoryTableProps {
  subcategories: AdminSubcategory[];
  onEdit: (subcategory: AdminSubcategory) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: 'active' | 'inactive') => void;
  isLoading: boolean;
}

export default function SubcategoryTable({
  subcategories,
  onEdit,
  onDelete,
  onStatusChange,
  isLoading
}: SubcategoryTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?')) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleStatusToggle = (id: number, currentStatus: boolean) => {
    const newStatus = currentStatus ? 'inactive' : 'active';
    onStatusChange(id, newStatus);
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des sous-catégories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de création
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subcategories.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0V3" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-2">Aucune sous-catégorie trouvée</p>
                    <p className="text-sm text-gray-500">Commencez par créer votre première sous-catégorie</p>
                  </div>
                </td>
              </tr>
            ) : (
              subcategories.map((subcategory) => (
                <tr key={subcategory.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {subcategory.image && (
                        <img
                          className="h-10 w-10 rounded-full object-cover mr-3"
                          src={subcategory.image}
                          alt={subcategory.name}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {subcategory.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {subcategory.category?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {subcategory.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusToggle(subcategory.id, subcategory.is_active)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        subcategory.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {subcategory.is_active ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subcategory.products_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(subcategory.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => onEdit(subcategory)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(subcategory.id)}
                      disabled={deletingId === subcategory.id}
                      className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                    >
                      {deletingId === subcategory.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}