'use client';

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

interface VendorDetailsModalProps {
  vendor: Vendor;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onSuspend: (id: number) => void;
  onReactivate: (id: number) => void;
}

export default function VendorDetailsModal({
  vendor,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onSuspend,
  onReactivate
}: VendorDetailsModalProps) {
  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-orange-100 text-orange-800'
    };
    
    const labels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      suspended: 'Suspendu'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Détails du vendeur</h2>
            <p className="text-sm text-gray-500 mt-1">Informations complètes sur le compte vendeur</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Statut */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Statut actuel</span>
            {getStatusBadge(vendor.vendor_status)}
          </div>

          {/* Informations personnelles */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <p className="text-sm text-gray-900">{vendor.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-sm text-gray-900">{vendor.email}</p>
              </div>
              {vendor.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <p className="text-sm text-gray-900">{vendor.phone}</p>
                </div>
              )}
              {vendor.address && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <p className="text-sm text-gray-900">{vendor.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Informations boutique */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations boutique</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique</label>
                <p className="text-sm text-gray-900">{vendor.shop_name}</p>
              </div>
              {vendor.shop_description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-sm text-gray-900">{vendor.shop_description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dates importantes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'inscription</label>
                <p className="text-sm text-gray-900">
                  {new Date(vendor.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {vendor.approved_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'approbation</label>
                  <p className="text-sm text-gray-900">
                    {new Date(vendor.approved_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Raison de rejet/suspension */}
          {vendor.rejection_reason && (vendor.vendor_status === 'rejected' || vendor.vendor_status === 'suspended') && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-sm font-medium text-red-900 mb-2">
                {vendor.vendor_status === 'rejected' ? 'Raison du rejet' : 'Raison de la suspension'}
              </h3>
              <p className="text-sm text-red-700">{vendor.rejection_reason}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Fermer
            </button>
            
            {vendor.vendor_status === 'pending' && (
              <>
                <button
                  onClick={() => handleAction(() => onReject(vendor.id))}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Rejeter
                </button>
                <button
                  onClick={() => handleAction(() => onApprove(vendor.id))}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Approuver
                </button>
              </>
            )}
            
            {vendor.vendor_status === 'approved' && (
              <button
                onClick={() => handleAction(() => onSuspend(vendor.id))}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Suspendre
              </button>
            )}
            
            {(vendor.vendor_status === 'suspended' || vendor.vendor_status === 'rejected') && (
              <button
                onClick={() => handleAction(() => onReactivate(vendor.id))}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Réactiver
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
