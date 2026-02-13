'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminService } from '@/services/adminService';
import { PartnerData } from '@/types';
import { Check, X, Ban, RotateCcw, Search, Briefcase } from 'lucide-react';

interface PartnerStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonAction, setReasonAction] = useState<{ type: 'reject' | 'suspend'; partnerId: number } | null>(null);
  const [reason, setReason] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadPartners = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getPartners(currentPage, 15, {
        status: selectedStatus,
        search: searchTerm,
      });
      setPartners(response.data);
      setTotalPages(response.meta.last_page);
      setTotalItems(response.meta.total);
    } catch (error) {
      console.error('Erreur lors du chargement des partenaires:', error);
      alert('Erreur lors du chargement des partenaires');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedStatus, searchTerm]);

  const loadStats = useCallback(async () => {
    try {
      const response = await adminService.getPartnerStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  }, []);

  useEffect(() => {
    loadPartners();
    loadStats();
  }, [loadPartners, loadStats]);

  const handleApprove = async (partnerId: number) => {
    if (!confirm('Etes-vous sur de vouloir approuver ce partenaire ?')) return;

    try {
      await adminService.approvePartner(partnerId);
      alert('Partenaire approuve avec succes');
      loadPartners();
      loadStats();
    } catch (error) {
      console.error('Erreur:', error);
      alert("Erreur lors de l'approbation");
    }
  };

  const handleReject = (partnerId: number) => {
    setReasonAction({ type: 'reject', partnerId });
    setShowReasonModal(true);
    setReason('');
  };

  const handleSuspend = (partnerId: number) => {
    setReasonAction({ type: 'suspend', partnerId });
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
        await adminService.rejectPartner(reasonAction.partnerId, reason);
        alert('Partenaire rejete avec succes');
      } else {
        await adminService.suspendPartner(reasonAction.partnerId, reason);
        alert('Partenaire suspendu avec succes');
      }

      setShowReasonModal(false);
      setReasonAction(null);
      setReason('');
      loadPartners();
      loadStats();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    }
  };

  const handleReactivate = async (partnerId: number) => {
    if (!confirm('Etes-vous sur de vouloir reactiver ce partenaire ?')) return;

    try {
      await adminService.reactivatePartner(partnerId);
      alert('Partenaire reactive avec succes');
      loadPartners();
      loadStats();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la reactivation');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      pending: 'En attente',
      approved: 'Approuve',
      rejected: 'Rejete',
      suspended: 'Suspendu',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gestion des Partenaires</h1>
          <p className="text-gray-600">Gerez les comptes partenaires et leurs demandes d&apos;inscription</p>
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
                <Briefcase className="w-8 h-8 text-blue-500" />
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
                  <p className="text-sm text-green-700">Approuves</p>
                  <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
                </div>
                <Check className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-red-50 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">Rejetes</p>
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
                placeholder="Rechercher un partenaire..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtre statut */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuves</option>
              <option value="rejected">Rejetes</option>
              <option value="suspended">Suspendus</option>
            </select>
          </div>
        </div>

        {/* Liste des partenaires */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : partners.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucun partenaire trouve
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Partenaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ville / Quartier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
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
                  {partners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{partner.business_name}</div>
                          {partner.user && (
                            <div className="text-sm text-gray-500">
                              {partner.user.name} &mdash; {partner.user.email}
                            </div>
                          )}
                          {partner.business_phone && (
                            <div className="text-sm text-gray-400">{partner.business_phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {partner.city?.name || '—'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {partner.neighborhood?.name || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(partner.status)}
                        {partner.rejection_reason && (
                          <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={partner.rejection_reason}>
                            {partner.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {partner.commission_rate != null ? `${partner.commission_rate}%` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(partner.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {partner.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(partner.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approuver"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleReject(partner.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Rejeter"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}

                          {partner.status === 'approved' && (
                            <button
                              onClick={() => handleSuspend(partner.id)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Suspendre"
                            >
                              <Ban className="w-5 h-5" />
                            </button>
                          )}

                          {partner.status === 'suspended' && (
                            <button
                              onClick={() => handleReactivate(partner.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Reactiver"
                            >
                              <RotateCcw className="w-5 h-5" />
                            </button>
                          )}
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
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Precedent
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> sur{' '}
                    <span className="font-medium">{totalPages}</span>
                    {' '}({totalItems} partenaire{totalItems > 1 ? 's' : ''})
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Precedent
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal pour raison de rejet / suspension */}
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
    </AdminLayout>
  );
}
