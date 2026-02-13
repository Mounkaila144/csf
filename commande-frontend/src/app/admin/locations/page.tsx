'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminService } from '@/services/adminService';
import { City, Neighborhood, PaginationMeta } from '@/types';

type ActiveTab = 'cities' | 'neighborhoods';

interface CityFormData {
  name: string;
  code: string;
  country: string;
  is_active: boolean;
}

interface NeighborhoodFormData {
  name: string;
  city_id: number;
  is_active: boolean;
}

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cities');

  // ---------- Cities state ----------
  const [cities, setCities] = useState<City[]>([]);
  const [citiesMeta, setCitiesMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesSearch, setCitiesSearch] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityForm, setCityForm] = useState<CityFormData>({
    name: '',
    code: '',
    country: 'Niger',
    is_active: true,
  });
  const [citySubmitting, setCitySubmitting] = useState(false);

  // ---------- Neighborhoods state ----------
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [neighborhoodsMeta, setNeighborhoodsMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });
  const [neighborhoodsLoading, setNeighborhoodsLoading] = useState(true);
  const [neighborhoodCityFilter, setNeighborhoodCityFilter] = useState<number | undefined>(undefined);
  const [neighborhoodsSearch, setNeighborhoodsSearch] = useState('');
  const [showNeighborhoodModal, setShowNeighborhoodModal] = useState(false);
  const [editingNeighborhood, setEditingNeighborhood] = useState<Neighborhood | null>(null);
  const [neighborhoodForm, setNeighborhoodForm] = useState<NeighborhoodFormData>({
    name: '',
    city_id: 0,
    is_active: true,
  });
  const [neighborhoodSubmitting, setNeighborhoodSubmitting] = useState(false);

  // All cities for dropdown (neighborhoods tab)
  const [allCities, setAllCities] = useState<City[]>([]);

  // ==================== LOAD DATA ====================

  const loadCities = useCallback(async () => {
    try {
      setCitiesLoading(true);
      const response = await adminService.getCities(
        citiesMeta.current_page,
        citiesMeta.per_page,
        citiesSearch ? { search: citiesSearch } : undefined
      );
      setCities(response.data);
      setCitiesMeta({
        ...response.meta,
        from: response.meta.from || 0,
        to: response.meta.to || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des villes:', error);
    } finally {
      setCitiesLoading(false);
    }
  }, [citiesMeta.current_page, citiesMeta.per_page, citiesSearch]);

  const loadAllCities = useCallback(async () => {
    try {
      const response = await adminService.getCities(1, 100);
      setAllCities(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des villes:', error);
    }
  }, []);

  const loadNeighborhoods = useCallback(async () => {
    try {
      setNeighborhoodsLoading(true);
      const response = await adminService.getNeighborhoods(
        neighborhoodsMeta.current_page,
        neighborhoodsMeta.per_page,
        neighborhoodCityFilter
      );
      setNeighborhoods(response.data);
      setNeighborhoodsMeta({
        ...response.meta,
        from: response.meta.from || 0,
        to: response.meta.to || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des quartiers:', error);
    } finally {
      setNeighborhoodsLoading(false);
    }
  }, [neighborhoodsMeta.current_page, neighborhoodsMeta.per_page, neighborhoodCityFilter]);

  useEffect(() => {
    if (activeTab === 'cities') {
      loadCities();
    }
  }, [activeTab, loadCities]);

  useEffect(() => {
    if (activeTab === 'neighborhoods') {
      loadNeighborhoods();
      loadAllCities();
    }
  }, [activeTab, loadNeighborhoods, loadAllCities]);

  // ==================== CITY HANDLERS ====================

  const openCityCreateModal = () => {
    setEditingCity(null);
    setCityForm({ name: '', code: '', country: 'Niger', is_active: true });
    setShowCityModal(true);
  };

  const openCityEditModal = (city: City) => {
    setEditingCity(city);
    setCityForm({
      name: city.name,
      code: city.code,
      country: city.country,
      is_active: city.is_active,
    });
    setShowCityModal(true);
  };

  const closeCityModal = () => {
    setShowCityModal(false);
    setEditingCity(null);
    setCityForm({ name: '', code: '', country: 'Niger', is_active: true });
  };

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (citySubmitting) return;

    try {
      setCitySubmitting(true);
      if (editingCity) {
        await adminService.updateCity(editingCity.id, cityForm);
      } else {
        await adminService.createCity(cityForm);
      }
      closeCityModal();
      await loadCities();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la ville:', error);
      alert('Erreur lors de la sauvegarde de la ville');
    } finally {
      setCitySubmitting(false);
    }
  };

  const handleDeleteCity = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ville ? Les quartiers associés seront également supprimés.')) return;

    try {
      await adminService.deleteCity(id);
      await loadCities();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la ville');
    }
  };

  const handleCitiesPageChange = (page: number) => {
    setCitiesMeta(prev => ({ ...prev, current_page: page }));
  };

  // ==================== NEIGHBORHOOD HANDLERS ====================

  const openNeighborhoodCreateModal = () => {
    setEditingNeighborhood(null);
    setNeighborhoodForm({
      name: '',
      city_id: allCities.length > 0 ? allCities[0].id : 0,
      is_active: true,
    });
    setShowNeighborhoodModal(true);
  };

  const openNeighborhoodEditModal = (neighborhood: Neighborhood) => {
    setEditingNeighborhood(neighborhood);
    setNeighborhoodForm({
      name: neighborhood.name,
      city_id: neighborhood.city_id,
      is_active: neighborhood.is_active,
    });
    setShowNeighborhoodModal(true);
  };

  const closeNeighborhoodModal = () => {
    setShowNeighborhoodModal(false);
    setEditingNeighborhood(null);
    setNeighborhoodForm({ name: '', city_id: 0, is_active: true });
  };

  const handleNeighborhoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (neighborhoodSubmitting) return;

    try {
      setNeighborhoodSubmitting(true);
      if (editingNeighborhood) {
        await adminService.updateNeighborhood(editingNeighborhood.id, neighborhoodForm);
      } else {
        await adminService.createNeighborhood(neighborhoodForm);
      }
      closeNeighborhoodModal();
      await loadNeighborhoods();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du quartier:', error);
      alert('Erreur lors de la sauvegarde du quartier');
    } finally {
      setNeighborhoodSubmitting(false);
    }
  };

  const handleDeleteNeighborhood = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce quartier ?')) return;

    try {
      await adminService.deleteNeighborhood(id);
      await loadNeighborhoods();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du quartier');
    }
  };

  const handleNeighborhoodsPageChange = (page: number) => {
    setNeighborhoodsMeta(prev => ({ ...prev, current_page: page }));
  };

  // ==================== FILTERED DATA ====================

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(citiesSearch.toLowerCase()) ||
    city.code.toLowerCase().includes(citiesSearch.toLowerCase()) ||
    city.country.toLowerCase().includes(citiesSearch.toLowerCase())
  );

  const filteredNeighborhoods = neighborhoods.filter(neighborhood =>
    neighborhood.name.toLowerCase().includes(neighborhoodsSearch.toLowerCase())
  );

  // ==================== PAGINATION COMPONENT ====================

  const renderPagination = (
    meta: PaginationMeta,
    onPageChange: (page: number) => void
  ) => {
    if (meta.last_page <= 1) return null;

    const pages: number[] = [];
    for (let i = 1; i <= meta.last_page; i++) {
      pages.push(i);
    }

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(Math.max(meta.current_page - 1, 1))}
            disabled={meta.current_page === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            onClick={() => onPageChange(Math.min(meta.current_page + 1, meta.last_page))}
            disabled={meta.current_page === meta.last_page}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Page <span className="font-medium">{meta.current_page}</span> sur{' '}
              <span className="font-medium">{meta.last_page}</span>
              {' '} — <span className="font-medium">{meta.total}</span> résultats
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(Math.max(meta.current_page - 1, 1))}
                disabled={meta.current_page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              {pages.map(page => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === meta.current_page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => onPageChange(Math.min(meta.current_page + 1, meta.last_page))}
                disabled={meta.current_page === meta.last_page}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RENDER ====================

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Villes & Quartiers</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez les villes et les quartiers de livraison
            </p>
          </div>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('cities')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Villes
            </button>
            <button
              onClick={() => setActiveTab('neighborhoods')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'neighborhoods'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quartiers
            </button>
          </nav>
        </div>

        {/* ==================== TAB: VILLES ==================== */}
        {activeTab === 'cities' && (
          <>
            {/* Barre d'actions */}
            <div className="flex justify-between items-center">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Rechercher une ville..."
                  value={citiesSearch}
                  onChange={(e) => setCitiesSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={openCityCreateModal}
                className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Ajouter une ville
              </button>
            </div>

            {/* Tableau des villes */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {citiesLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
              ) : filteredCities.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Aucune ville trouvée
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pays
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCities.map((city) => (
                        <tr key={city.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{city.name}</div>
                            {city.neighborhoods_count !== undefined && (
                              <div className="text-xs text-gray-500">
                                {city.neighborhoods_count} quartier{city.neighborhoods_count !== 1 ? 's' : ''}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {city.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {city.country}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                city.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {city.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openCityEditModal(city)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteCity(city.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination villes */}
              {renderPagination(citiesMeta, handleCitiesPageChange)}
            </div>
          </>
        )}

        {/* ==================== TAB: QUARTIERS ==================== */}
        {activeTab === 'neighborhoods' && (
          <>
            {/* Barre d'actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Rechercher un quartier..."
                    value={neighborhoodsSearch}
                    onChange={(e) => setNeighborhoodsSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <select
                    value={neighborhoodCityFilter || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNeighborhoodCityFilter(val ? Number(val) : undefined);
                      setNeighborhoodsMeta(prev => ({ ...prev, current_page: 1 }));
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Toutes les villes</option>
                    {allCities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={openNeighborhoodCreateModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Ajouter un quartier
              </button>
            </div>

            {/* Tableau des quartiers */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {neighborhoodsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
              ) : filteredNeighborhoods.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Aucun quartier trouvé
                </div>
              ) : (
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredNeighborhoods.map((neighborhood) => (
                        <tr key={neighborhood.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{neighborhood.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {neighborhood.city?.name || `Ville #${neighborhood.city_id}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                neighborhood.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {neighborhood.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openNeighborhoodEditModal(neighborhood)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteNeighborhood(neighborhood.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination quartiers */}
              {renderPagination(neighborhoodsMeta, handleNeighborhoodsPageChange)}
            </div>
          </>
        )}
      </div>

      {/* ==================== MODAL: CITY ==================== */}
      {showCityModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCity ? 'Modifier la ville' : 'Ajouter une ville'}
              </h3>
              <button
                onClick={closeCityModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCitySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cityForm.name}
                  onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom de la ville"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cityForm.code}
                  onChange={(e) => setCityForm({ ...cityForm, code: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Code de la ville (ex: NIA)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <input
                  type="text"
                  value={cityForm.country}
                  onChange={(e) => setCityForm({ ...cityForm, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pays"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="city_is_active"
                  checked={cityForm.is_active}
                  onChange={(e) => setCityForm({ ...cityForm, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="city_is_active" className="ml-2 block text-sm text-gray-900">
                  Actif
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeCityModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={citySubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  {citySubmitting
                    ? 'Enregistrement...'
                    : editingCity
                    ? 'Modifier'
                    : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: NEIGHBORHOOD ==================== */}
      {showNeighborhoodModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingNeighborhood ? 'Modifier le quartier' : 'Ajouter un quartier'}
              </h3>
              <button
                onClick={closeNeighborhoodModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleNeighborhoodSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={neighborhoodForm.name}
                  onChange={(e) => setNeighborhoodForm({ ...neighborhoodForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du quartier"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville <span className="text-red-500">*</span>
                </label>
                <select
                  value={neighborhoodForm.city_id}
                  onChange={(e) => setNeighborhoodForm({ ...neighborhoodForm, city_id: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0} disabled>
                    Sélectionner une ville
                  </option>
                  {allCities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="neighborhood_is_active"
                  checked={neighborhoodForm.is_active}
                  onChange={(e) => setNeighborhoodForm({ ...neighborhoodForm, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="neighborhood_is_active" className="ml-2 block text-sm text-gray-900">
                  Actif
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeNeighborhoodModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={neighborhoodSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  {neighborhoodSubmitting
                    ? 'Enregistrement...'
                    : editingNeighborhood
                    ? 'Modifier'
                    : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
