'use client';

import React from 'react';
import { X, User, Phone, MapPin, Calendar, Package, CreditCard } from 'lucide-react';
import { Order } from '../../services/orderService';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onUpdateStatus: (orderId: number, status: Order['status']) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateStatus
}) => {
  if (!isOpen) return null;

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En attente' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmée' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Expédiée' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Livrée' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' CFA';
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            
            {/* Header */}
            <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Commande #{order.id}
                  </h3>
                  <div className="mt-2 flex items-center space-x-4">
                    {getStatusBadge(order.status)}
                    <span className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white px-6 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Customer Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Informations Client
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Nom</label>
                        <p className="text-gray-900">{order.user?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{order.user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Téléphone</label>
                        <p className="text-gray-900 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {order.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Adresses
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Adresse de livraison</label>
                        <p className="text-gray-900">{order.shipping_address}</p>
                      </div>
                      {order.billing_address && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Adresse de facturation</label>
                          <p className="text-gray-900">{order.billing_address}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Notes</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-900">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      Articles Commandés
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-4">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">
                                {item.product?.name || `Produit #${item.product_id}`}
                              </h5>
                              <p className="text-sm text-gray-600">
                                Quantité: {item.quantity} × {formatCurrency(item.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {formatCurrency(item.quantity * item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Résumé de la commande
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sous-total</span>
                          <span className="text-gray-900">{formatCurrency(order.total_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Livraison</span>
                          <span className="text-gray-900">Gratuite</span>
                        </div>
                        <hr className="border-gray-300" />
                        <div className="flex justify-between text-lg font-semibold">
                          <span className="text-gray-900">Total</span>
                          <span className="text-blue-600">{formatCurrency(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Changer le statut
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={order.status === 'delivered' || order.status === 'cancelled'}
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Imprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsModal;