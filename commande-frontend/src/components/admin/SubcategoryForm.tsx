'use client';

import { useState, useEffect } from 'react';
import { AdminSubcategory, SubcategoryFormData, AdminCategory } from '../../types';

interface SubcategoryFormProps {
  subcategory?: AdminSubcategory;
  categories: AdminCategory[];
  onSubmit: (data: SubcategoryFormData) => Promise<void>;
  onCancel: () => void;
}

export default function SubcategoryForm({
  subcategory,
  categories,
  onSubmit,
  onCancel
}: SubcategoryFormProps) {
  const [formData, setFormData] = useState<SubcategoryFormData>({
    name: '',
    description: '',
    category_id: 0,
    is_active: true,
    image: ''
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name,
        description: subcategory.description || '',
        category_id: subcategory.category_id,
        is_active: subcategory.is_active,
        image: subcategory.image || ''
      });
    }
  }, [subcategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = (error as { response: { data: { errors: Record<string, string[]> } } }).response;
        setErrors(errorResponse.data.errors);
      } else {
        setErrors({ general: ['Une erreur est survenue lors de la sauvegarde.'] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked 
              : name === 'category_id' ? parseInt(value) || 0
              : value
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {subcategory ? 'Modifier la sous-catégorie' : 'Nouvelle sous-catégorie'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {errors.general && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-600">
            {errors.general.join(', ')}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nom de la sous-catégorie *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Entrez le nom de la sous-catégorie"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.name.join(', ')}
            </p>
          )}
        </div>

        {/* Catégorie parente */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie parente *
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.category_id ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value={0}>Sélectionnez une catégorie</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category_id.join(', ')}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Description de la sous-catégorie (optionnel)"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.join(', ')}
            </p>
          )}
        </div>

        {/* Image */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
            URL de l&apos;image
          </label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.image ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="https://exemple.com/image.jpg"
          />
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">
              {errors.image.join(', ')}
            </p>
          )}
        </div>

        {/* Statut */}
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Sous-catégorie active
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Les sous-catégories inactives ne seront pas affichées sur le site
          </p>
          {errors.is_active && (
            <p className="mt-1 text-sm text-red-600">
              {errors.is_active.join(', ')}
            </p>
          )}
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || formData.category_id === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}