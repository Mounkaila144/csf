'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Pagination from '@/components/admin/Pagination';
import { adminService } from '@/services/adminService';
import { DeliveryZone, City, PaginationMeta } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface DeliveryZoneFormData {
  name: string;
  city_id: number | '';
  base_price: number | '';
  price_per_kg: number | '';
  price_per_m3: number | '';
  max_weight_kg: number | '';
  max_volume_m3: number | '';
  is_active: boolean;
}

const emptyFormData: DeliveryZoneFormData = {
  name: '',
  city_id: '',
  base_price: '',
  price_per_kg: '',
  price_per_m3: '',
  max_weight_kg: '',
  max_volume_m3: '',
  is_active: true,
};

function formatCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' CFA';
}

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [formData, setFormData] = useState<DeliveryZoneFormData>(emptyFormData);
  const [filterCityId, setFilterCityId] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Charger les villes pour le dropdown
  const loadCities = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cities`);
      const result = await response.json();
      if (result.data) {
        setCities(Array.isArray(result.data) ? result.data : []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des villes:', err);
    }
  }, []);

  // Charger les zones de livraison
  const loadZones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getDeliveryZones(
        meta.current_page,
        meta.per_page,
        filterCityId
      );
      setZones(response.data);
      setMeta({
        ...response.meta,
        from: response.meta.from || 0,
        to: response.meta.to || 0,
      });
    } catch (err) {
      console.error('Erreur lors du chargement des zones:', err);
      setError('Impossible de charger les zones de livraison.');
    } finally {
      setLoading(false);
    }
  }, [meta.current_page, meta.per_page, filterCityId]);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  // Masquer le message de succes apres 3 secondes
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const getCityName = (cityId: number): string => {
    const city = cities.find((c) => c.id === cityId);
    return city ? city.name : `Ville #${cityId}`;
  };

  const handleOpenCreate = () => {
    setEditingZone(null);
    setFormData(emptyFormData);
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      city_id: zone.city_id,
      base_price: zone.base_price,
      price_per_kg: zone.price_per_kg,
      price_per_m3: zone.price_per_m3,
      max_weight_kg: zone.max_weight_kg,
      max_volume_m3: zone.max_volume_m3,
      is_active: zone.is_active,
    });
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingZone(null);
    setFormData(emptyFormData);
    setError(null);
  };

  const handleFormChange = (field: keyof DeliveryZoneFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Le nom est obligatoire.');
      return;
    }
    if (!formData.city_id) {
      setError('Veuillez sélectionner une ville.');
      return;
    }
    if (formData.base_price === '' || Number(formData.base_price) < 0) {
      setError('Le prix de base doit être un nombre positif.');
      return;
    }

    const payload: Partial<DeliveryZone> = {
      name: formData.name.trim(),
      city_id: Number(formData.city_id),
      base_price: Number(formData.base_price) || 0,
      price_per_kg: Number(formData.price_per_kg) || 0,
      price_per_m3: Number(formData.price_per_m3) || 0,
      max_weight_kg: Number(formData.max_weight_kg) || 0,
      max_volume_m3: Number(formData.max_volume_m3) || 0,
      is_active: formData.is_active,
    };

    try {
      setSubmitting(true);
      if (editingZone) {
        await adminService.updateDeliveryZone(editingZone.id, payload);
        setSuccessMessage('Zone de livraison modifiée avec succès.');
      } else {
        await adminService.createDeliveryZone(payload);
        setSuccessMessage('Zone de livraison créée avec succès.');
      }
      handleCloseModal();
      await loadZones();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (zone: DeliveryZone) => {
    if (!window.confirm(`Supprimer la zone "${zone.name}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await adminService.deleteDeliveryZone(zone.id);
      setSuccessMessage('Zone de livraison supprimée avec succès.');
      await loadZones();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Impossible de supprimer cette zone de livraison.');
    }
  };

  const handlePageChange = (page: number) => {
    setMeta((prev) => ({ ...prev, current_page: page }));
  };

  const handleFilterCityChange = (value: string) => {
    setFilterCityId(value ? Number(value) : undefined);
    setMeta((prev) => ({ ...prev, current_page: 1 }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Zones de livraison</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez les zones et tarifs de livraison
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Nouvelle zone
          </button>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Erreur globale */}
        {error && !showModal && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Filtre par ville */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="filter-city" className="block text-sm font-medium text-gray-700 mb-1">
                Filtrer par ville
              </label>
              <select
                id="filter-city"
                value={filterCityId || ''}
                onChange={(e) => handleFilterCityChange(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les villes</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <span className="text-sm text-gray-500">
                {meta.total} zone{meta.total !== 1 ? 's' : ''} au total
              </span>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ville
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix de base
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix/kg
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix/m3
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poids max
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume max
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center space-x-2">
                        <svg
                          className="animate-spin h-5 w-5 text-blue-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : zones.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      Aucune zone de livraison trouvée.
                    </td>
                  </tr>
                ) : (
                  zones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {zone.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {zone.city ? zone.city.name : getCityName(zone.city_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCFA(zone.base_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCFA(zone.price_per_kg)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCFA(zone.price_per_m3)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                        {zone.max_weight_kg} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                        {zone.max_volume_m3} m&sup3;
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            zone.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {zone.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(zone)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            title="Modifier"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(zone)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                            title="Supprimer"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <Pagination meta={meta} onPageChange={handlePageChange} />
        )}
      </div>

      {/* Modal de création / modification */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-1/2 xl:w-2/5 shadow-lg rounded-md bg-white mb-10">
            {/* En-tête du modal */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingZone ? 'Modifier la zone de livraison' : 'Nouvelle zone de livraison'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Erreur dans le modal */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom */}
              <div>
                <label htmlFor="zone-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  id="zone-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Ex: Zone Centre-Ville"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Ville */}
              <div>
                <label htmlFor="zone-city" className="block text-sm font-medium text-gray-700 mb-1">
                  Ville <span className="text-red-500">*</span>
                </label>
                <select
                  id="zone-city"
                  value={formData.city_id}
                  onChange={(e) =>
                    handleFormChange('city_id', e.target.value ? Number(e.target.value) : '')
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Sélectionner une ville --</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prix de base et Prix/kg */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zone-base-price" className="block text-sm font-medium text-gray-700 mb-1">
                    Prix de base (CFA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="zone-base-price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.base_price}
                    onChange={(e) =>
                      handleFormChange('base_price', e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="zone-price-per-kg" className="block text-sm font-medium text-gray-700 mb-1">
                    Prix par kg (CFA)
                  </label>
                  <input
                    id="zone-price-per-kg"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price_per_kg}
                    onChange={(e) =>
                      handleFormChange('price_per_kg', e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Prix/m3 */}
              <div>
                <label htmlFor="zone-price-per-m3" className="block text-sm font-medium text-gray-700 mb-1">
                  Prix par m&sup3; (CFA)
                </label>
                <input
                  id="zone-price-per-m3"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.price_per_m3}
                  onChange={(e) =>
                    handleFormChange('price_per_m3', e.target.value ? Number(e.target.value) : '')
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Poids max et Volume max */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zone-max-weight" className="block text-sm font-medium text-gray-700 mb-1">
                    Poids maximum (kg)
                  </label>
                  <input
                    id="zone-max-weight"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.max_weight_kg}
                    onChange={(e) =>
                      handleFormChange('max_weight_kg', e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="zone-max-volume" className="block text-sm font-medium text-gray-700 mb-1">
                    Volume maximum (m&sup3;)
                  </label>
                  <input
                    id="zone-max-volume"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.max_volume_m3}
                    onChange={(e) =>
                      handleFormChange('max_volume_m3', e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Statut actif */}
              <div className="flex items-center">
                <input
                  id="zone-is-active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleFormChange('is_active', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="zone-is-active" className="ml-2 block text-sm text-gray-700">
                  Zone active
                </label>
              </div>

              {/* Boutons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? 'Enregistrement...'
                    : editingZone
                    ? 'Modifier'
                    : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
