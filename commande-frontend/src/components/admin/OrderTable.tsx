'use client';

import React from 'react';
import { Eye, Edit, Trash2, Calendar, User, MapPin, Phone } from 'lucide-react';
import { Order } from '../../services/orderService';

interface OrderTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onUpdateStatus: (orderId: number, status: Order['status']) => void;
  onDeleteOrder: (orderId: number) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onViewOrder,
  onUpdateStatus,
  onDeleteOrder
}) => {
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
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

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900">Aucune commande</h3>
        <p className="text-sm text-gray-500 mt-1">
          Aucune commande ne correspond à vos critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commande
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Articles
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Commande #{order.id}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Phone className="w-3 h-3 mr-1" />
                      {order.phone}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <User className="w-4 h-4 mr-1" />
                      {order.user?.name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.user?.email || 'N/A'}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(order.created_at)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                    disabled={order.status === 'delivered' || order.status === 'cancelled'}
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {order.order_items?.length || 0} article(s)
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} unité(s)
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => onViewOrder(order)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {order.status === 'pending' && (
                    <button
                      onClick={() => onDeleteOrder(order.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <div className="space-y-4 p-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Commande #{order.id}</h3>
                  <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{order.user?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{order.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{order.order_items?.length || 0} article(s)</span>
                  <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => onViewOrder(order)}
                  className="text-blue-600 hover:text-blue-900 p-2 rounded"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {order.status === 'pending' && (
                  <button
                    onClick={() => onDeleteOrder(order.id)}
                    className="text-red-600 hover:text-red-900 p-2 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTable;