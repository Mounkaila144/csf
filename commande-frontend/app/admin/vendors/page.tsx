'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../../src/components/admin/AdminLayout';
import VendorTable from '../../../src/components/admin/VendorTable';
import VendorDetailsModal from '../../../src/components/admin/VendorDetailsModal';
import Pagination from '../../../src/components/admin/Pagination';
import { adminService } from '../../../src/services/adminService';
import { PaginationMeta } from '../../../src/types';

interface Vendor {
  id: number;
  name: string;
  email: string;
  shop_name: string;
  shop_description?: string;
  phone?: string;
  address?: string;
  vendor_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  approved_at?: string;
  rejection_reason?: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVendors();
  }, [meta.current_page, statusFilter, searchTerm]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await adminService.getVendors(
        meta.current_page,
        meta.per_page,
        {
          status: statusFilter || undefined,
          search: searchTerm || undefined
        }
      );
      setVendors(response.data);
      setMeta({
        ...response.meta,
        from: response.meta.from || 0,
        to: response.meta.to || 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des vendeurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir approuver ce vendeur ?')) return;
    
    try {
      await adminService.approveVendor(id);
      await loadVendors();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      alert('Erreur lors de l\'approbation du vendeur');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Raison du rejet :');
    if (!reason) return;
    
    try {
      await adminService.rejectVendor(id, reason);
      await loadVendors();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur lors du rejet du vendeur');
    }
  };

  const handleSuspend = async (id: number) => {
    const reason = prompt('Raison de la suspension :');
    if (!reason) return;
    
    try {
      await adminService.suspendVendor(id, reason);
      await loadVendors();
    } catch (error) {
      console.error('Erreur lors de la suspension:', error);
      alert('Erreur lors de la suspension du vendeur');
    }
  };

  const handleReactivate = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir réactiver ce vendeur ?')) return;
    
    try {
      await adminService.reactivateVendor(id);
      await loadVendors();
    } catch (error) {
      console.error('Erreur lors de la réactivation:', error);
      alert('Erreur lors de la réactivation du vendeur');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce vendeur ? Cette action est irréversible.')) return;
    
    try {
      await adminService.deleteVendor(id);
      await loadVendors();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du vendeur');
    }
  };

  const handleViewDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowDetailsModal(true);
  };

  const handlePageChange = (page: number) => {
    setMeta(prev => ({ ...prev, current_page: page }));
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.shop_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || vendor.vendor_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: vendors.length,
    pending: vendors.filter(v => v.vendor_status === 'pending').length,
    approved: vendors.filter(v => v.vendor_status === 'approved').length,
    rejected: vendors.filter(v => v.vendor_status === 'rejected').length,
    suspended: vendors.filter(v => v.vendor_status === 'suspended').length
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des vendeurs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Approuvez, rejetez ou gérez les comptes vendeurs
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approuvés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejetés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspendus</p>
                <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher un vendeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
                <option value="rejected">Rejetés</option>
                <option value="suspended">Suspendus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <VendorTable
          vendors={filteredVendors}
          onApprove={handleApprove}
          onReject={handleReject}
          onSuspend={handleSuspend}
          onReactivate={handleReactivate}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          isLoading={loading}
        />

        {/* Pagination */}
        {meta.last_page > 1 && (
          <Pagination
            meta={meta}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modal détails */}
      {selectedVendor && (
        <VendorDetailsModal
          vendor={selectedVendor}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedVendor(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onSuspend={handleSuspend}
          onReactivate={handleReactivate}
        />
      )}
    </AdminLayout>
  );
}
