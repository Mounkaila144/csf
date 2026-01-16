'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { Check, X, Ban, RotateCcw, Trash2, Store, Package, Layers, Search } from 'lucide-react';

interface Vendor {
  id: number;
  name: string;
  email: string;
  shop_name: string;
  shop_description?: string;
  phone?: string;
  address?: string;
  vendor_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  products_count: number;
  categories_count: number;
  created_at: string;
  approved_at?: string;
  rejection_reason?: string;
  approved_by?: {
    id: number;
    name: string;
  };
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonAction, setReasonAction] = useState<{ type: 'reject' | 'suspend', vendorId: number } | null>(null);
  const [reason, setReason] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadVendors();
    loadStats();
  }, [currentPage, selectedStatus, searchTerm]);

  const loadVendors = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getVendors(currentPage, 10, {
        status: selectedStatus,
        search: searchTerm
      });
      setVendors(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Erreur lors du chargement des vendeurs:', error);
      alert('Erreur lors du chargement des vendeurs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminService.getVendorStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleApprove = async (vendorId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir approuver ce vendeur ?')) return;

    try {
      await adminService.approveVendor(vendorId);
      alert('Vendeur approuvé avec succès');
      loadVendors();
      loadStats();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleReject = (vendorId: number) => {
    setReasonAction({ type: 'reject', vendorId });
    setShowReasonModal(true);
    setReason('');
  };

  const handleSuspend = (vendorId: number) => {
    setReasonAction({ type: 'suspend', vendorId });
    setShowReasonModal(true);
    setReason('');
  };

  const handleReasonSubmit = async () => {
    if (!reasonAction || !reason.trim()) {
      alert('Veuillez fournir une raison');
      return;
    }

    try {
      if (reasonAction.type === 'reject') {
        await adminService.rejectVendor(reasonAction.vendorId, reason);
        alert('Vendeur rejeté avec succès');
      } else {
        await adminService.suspendVendor(reasonAction.vendorId, reason);
        alert('Vendeur suspendu avec succès');
      }

      setShowReasonModal(false);
      setReasonAction(null);
      setReason('');
      loadVendors();
      loadStats();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    }
  };

  const handleReactivate = async (vendorId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir réactiver ce vendeur ?')) return;

    try {
      await adminService.reactivateVendor(vendorId);
      alert('Vendeur réactivé avec succès');
      loadVendors();
      loadStats();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la réactivation');
    }
  };

  const handleDelete = async (vendorId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce vendeur ? Tous ses produits et catégories seront également supprimés.')) return;

    try {
      await adminService.deleteVendor(vendorId);
      alert('Vendeur supprimé avec succès');
      loadVendors();
      loadStats();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      suspended: 'Suspendu',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Gestion des Vendeurs</h1>
        <p className="text-gray-600">Gérez les comptes vendeurs et leurs demandes d'inscription</p>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <Store className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">En attente</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                <span className="text-yellow-700 font-bold">!</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Approuvés</p>
                <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Rejetés</p>
                <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
              </div>
              <X className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">Suspendus</p>
                <p className="text-2xl font-bold text-gray-800">{stats.suspended}</p>
              </div>
              <Ban className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un vendeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtre statut */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvés</option>
            <option value="rejected">Rejetés</option>
            <option value="suspended">Suspendus</option>
          </select>
        </div>
      </div>

      {/* Liste des vendeurs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun vendeur trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Boutique
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{vendor.name}</div>
                        <div className="text-sm text-gray-500">{vendor.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{vendor.shop_name}</div>
                      {vendor.shop_description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {vendor.shop_description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(vendor.vendor_status)}
                      {vendor.rejection_reason && (
                        <div className="text-xs text-red-600 mt-1">
                          {vendor.rejection_reason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          {vendor.products_count}
                        </div>
                        <div className="flex items-center">
                          <Layers className="w-4 h-4 mr-1" />
                          {vendor.categories_count}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vendor.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {vendor.vendor_status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(vendor.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approuver"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(vendor.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Rejeter"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}

                        {vendor.vendor_status === 'approved' && (
                          <button
                            onClick={() => handleSuspend(vendor.id)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Suspendre"
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        )}

                        {vendor.vendor_status === 'suspended' && (
                          <button
                            onClick={() => handleReactivate(vendor.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Réactiver"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(vendor.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> sur{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal pour raison */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {reasonAction?.type === 'reject' ? 'Raison du rejet' : 'Raison de la suspension'}
            </h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Expliquez la raison..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setReasonAction(null);
                  setReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleReasonSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
