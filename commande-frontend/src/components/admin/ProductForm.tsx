'use client';

import { useState, useEffect } from 'react';
import { AdminProduct, ProductFormData, AdminCategory, AdminSubcategory, ProductStatus } from '../../types';
import { adminService, getFullImageUrl } from '../../services/adminService';
import { vendorService } from '../../services/vendorService';
import { PRODUCT_STATUSES } from '../../constants/productStatus';
import ImageUpload from './ImageUpload';

interface ProductFormProps {
  product?: AdminProduct;
  categories: AdminCategory[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  useVendorService?: boolean; // Nouveau prop pour déterminer quel service utiliser
}

export default function ProductForm({ 
  product, 
  categories,
  onSubmit, 
  onCancel, 
  isLoading = false,
  useVendorService = false
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
    status: [],
    supplier_company: '',
    supplier_phone: '',
    supplier_address: '',
    weight_kg: undefined,
    length_cm: undefined,
    width_cm: undefined,
    height_cm: undefined,
  });

  const [subcategories, setSubcategories] = useState<AdminSubcategory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<File[]>([]); // Fichiers en attente d'upload

  // Sélectionner le service approprié
  const service = useVendorService ? vendorService : adminService;

  const loadSubcategories = async (categoryId: number) => {
    try {
      const response = await service.getSubcategories(1, 100, categoryId);
      setSubcategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des sous-catégories:', error);
    }
  };

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category_id: product.category_id,
        subcategory_id: product.subcategory_id || 0,
        images: product.images?.map(img => getFullImageUrl(img)) || [],
        is_active: product.is_active,
        stock: product.stock,
        status: product.status || [],
        supplier_company: product.supplier_company || '',
        supplier_phone: product.supplier_phone || '',
        supplier_address: product.supplier_address || '',
        weight_kg: product.weight_kg || undefined,
        length_cm: product.length_cm || undefined,
        width_cm: product.width_cm || undefined,
        height_cm: product.height_cm || undefined,
      });

      // Charger les sous-catégories si une catégorie est sélectionnée
      if (product.category_id) {
        loadSubcategories(product.category_id);
      }
    }
  }, [product]);

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
      const finalFormData = { ...formData };

      // Si on a des fichiers en attente (mode création avec preview)
      if (pendingFiles.length > 0) {
        try {
          const uploadedUrls = await service.uploadMultipleImages(pendingFiles);
          finalFormData.images = uploadedUrls;
        } catch (error) {
          console.error('Erreur lors de l\'upload des images:', error);
          setErrors({ image: 'Erreur lors de l\'upload des images' });
          return;
        }
      }

      await onSubmit(finalFormData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean = value;

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

  const handleImagesChange = (images: string[], files?: File[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));

    // Ne PAS stocker les fichiers ici car handleFilesReady le fait déjà
    // Cela évite la duplication des fichiers
  };

  const handleImagesUpload = async (files: File[]): Promise<string[]> => {
    try {
      // Upload immédiat uniquement en mode édition
      const urls = await service.uploadMultipleImages(files);
      return urls;
    } catch (error) {
      console.error('Erreur lors de l\'upload des images:', error);
      throw error;
    }
  };

  const handleFilesReady = (files: File[]) => {
    // Stocker les fichiers compressés pour upload ultérieur (mode création uniquement)
    setPendingFiles(prev => [...prev, ...files]);
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

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images du produit
          </label>
          <ImageUpload
            images={formData.images || []}
            onImagesChange={handleImagesChange}
            onUpload={product ? handleImagesUpload : undefined}
            onFilesReady={handleFilesReady}
            maxImages={10}
            disabled={isLoading}
          />
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

        {/* Provenance du produit */}
        {!useVendorService && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Provenance du produit</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="supplier_company" className="block text-sm font-medium text-gray-700 mb-2">
                  Entreprise fournisseur
                </label>
                <input
                  type="text"
                  id="supplier_company"
                  name="supplier_company"
                  value={formData.supplier_company || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom de l'entreprise"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="supplier_phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telephone fournisseur
                </label>
                <input
                  type="text"
                  id="supplier_phone"
                  name="supplier_phone"
                  value={formData.supplier_phone || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+227 XX XX XX XX"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="supplier_address" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse fournisseur
                </label>
                <input
                  type="text"
                  id="supplier_address"
                  name="supplier_address"
                  value={formData.supplier_address || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adresse du fournisseur"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Dimensions du produit */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Dimensions du produit</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="weight_kg" className="block text-sm font-medium text-gray-700 mb-2">
                Poids (kg)
              </label>
              <input
                type="number"
                id="weight_kg"
                name="weight_kg"
                value={formData.weight_kg ?? ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="length_cm" className="block text-sm font-medium text-gray-700 mb-2">
                Longueur (cm)
              </label>
              <input
                type="number"
                id="length_cm"
                name="length_cm"
                value={formData.length_cm ?? ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="width_cm" className="block text-sm font-medium text-gray-700 mb-2">
                Largeur (cm)
              </label>
              <input
                type="number"
                id="width_cm"
                name="width_cm"
                value={formData.width_cm ?? ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="height_cm" className="block text-sm font-medium text-gray-700 mb-2">
                Hauteur (cm)
              </label>
              <input
                type="number"
                id="height_cm"
                name="height_cm"
                value={formData.height_cm ?? ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
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
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enregistrement...
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
