'use client';

import { useState, useEffect } from 'react';
import { AdminProduct, ProductFormData, AdminCategory, AdminSubcategory, ProductStatus } from '../../types';
import { adminService, getFullImageUrl } from '../../services/adminService';
import { PRODUCT_STATUSES } from '../../constants/productStatus';

interface ProductFormProps {
  product?: AdminProduct;
  categories: AdminCategory[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProductForm({ 
  product, 
  categories,
  onSubmit, 
  onCancel, 
  isLoading = false 
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category_id: 0,
    subcategory_id: 0,
    images: [],
    is_active: true,
    stock: 0,
    status: []
  });

  const [subcategories, setSubcategories] = useState<AdminSubcategory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category_id: product.category_id,
        subcategory_id: product.subcategory_id || 0,
        images: product.images || [],
        is_active: product.is_active,
        stock: product.stock,
        status: product.status || []
      });
      
      if (product.images && product.images.length > 0) {
        setImagePreview(getFullImageUrl(product.images[0]));
      }
      
      // Charger les sous-catégories si une catégorie est sélectionnée
      if (product.category_id) {
        loadSubcategories(product.category_id);
      }
    }
  }, [product]);

  const loadSubcategories = async (categoryId: number) => {
    try {
      const response = await adminService.getSubcategories(1, 100, categoryId);
      setSubcategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des sous-catégories:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Le prix doit être supérieur à 0';
    }

    if (!formData.category_id || formData.category_id === 0) {
      newErrors.category_id = 'Veuillez sélectionner une catégorie';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'La quantité en stock ne peut pas être négative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      let finalFormData = { ...formData };
      
      // Upload de l'image si nécessaire
      if (imageFile) {
        setUploadingImage(true);
        try {
          const uploadResponse = await adminService.uploadImage(imageFile);
          finalFormData.images = [uploadResponse.data.url];
        } catch (error) {
          console.error('Erreur lors de l\'upload de l\'image:', error);
          setErrors({ image: 'Erreur lors de l\'upload de l\'image' });
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      await onSubmit(finalFormData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    if (type === 'number') {
      processedValue = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'category_id' || name === 'subcategory_id') {
      processedValue = parseInt(value) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Charger les sous-catégories quand la catégorie change
    if (name === 'category_id' && processedValue > 0) {
      loadSubcategories(processedValue);
      setFormData(prev => ({ ...prev, subcategory_id: 0 }));
    }
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStatusChange = (statusValue: ProductStatus) => {
    const currentStatus = formData.status || [];
    const newStatus = currentStatus.includes(statusValue)
      ? currentStatus.filter(s => s !== statusValue)
      : [...currentStatus, statusValue];
    
    setFormData(prev => ({
      ...prev,
      status: newStatus
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {product ? 'Modifier le produit' : 'Nouveau produit'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nom du produit"
              disabled={isLoading}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Prix */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Prix *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>


          {/* Quantité en stock */}
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
              Quantité en stock *
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.stock ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
          </div>

          {/* Catégorie */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value={0}>Sélectionnez une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
          </div>

          {/* Sous-catégorie */}
          <div>
            <label htmlFor="subcategory_id" className="block text-sm font-medium text-gray-700 mb-2">
              Sous-catégorie
            </label>
            <select
              id="subcategory_id"
              name="subcategory_id"
              value={formData.subcategory_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || subcategories.length === 0}
            >
              <option value={0}>Aucune sous-catégorie</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
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
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description du produit"
            disabled={isLoading}
          />
        </div>

        {/* Image */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
            Image du produit
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Aperçu"
                className="w-32 h-32 object-cover rounded-md border"
              />
            </div>
          )}
          {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
        </div>

        {/* Statuts */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Statuts du produit
          </label>
          <div className="space-y-3">
            {PRODUCT_STATUSES.map((status) => (
              <div key={status.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`status_${status.value}`}
                  checked={formData.status?.includes(status.value) || false}
                  onChange={() => handleStatusChange(status.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label 
                  htmlFor={`status_${status.value}`} 
                  className="ml-3 flex items-center space-x-2"
                >
                  <span className="text-xl">{status.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{status.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Actif/Inactif */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isLoading}
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Produit actif
          </label>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            disabled={isLoading || uploadingImage}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || uploadingImage}
          >
            {isLoading || uploadingImage ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {uploadingImage ? 'Upload en cours...' : 'Enregistrement...'}
              </div>
            ) : (
              product ? 'Modifier' : 'Créer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
