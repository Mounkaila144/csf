import React, { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle, Truck, XCircle, Eye } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import { orderService, Order } from '../services/orderService';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    images?: string[];
  };
}

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { formatXOF } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const orders = await orderService.getOrders();
      setOrders(orders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Impossible de charger vos commandes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: 'En attente',
          icon: Clock,
          color: 'text-yellow-600 bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'confirmed':
        return {
          label: 'Confirmée',
          icon: CheckCircle,
          color: 'text-blue-600 bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'shipped':
        return {
          label: 'Expédiée',
          icon: Truck,
          color: 'text-purple-600 bg-purple-50',
          borderColor: 'border-purple-200'
        };
      case 'delivered':
        return {
          label: 'Livrée',
          icon: CheckCircle,
          color: 'text-green-600 bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'cancelled':
        return {
          label: 'Annulée',
          icon: XCircle,
          color: 'text-red-600 bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          label: status,
          icon: Package,
          color: 'text-gray-600 bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Mes Commandes</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Vous n'avez pas encore de commandes</p>
              <p className="text-gray-400 mt-2">Commencez vos achats dès maintenant !</p>
            </div>
          ) : selectedOrder ? (
            /* Détails de la commande */
            <div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                ← Retour à la liste
              </button>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                {/* En-tête de la commande */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Commande #{selectedOrder.id}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(selectedOrder.created_at)}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusInfo(selectedOrder.status).color}`}>
                    {React.createElement(getStatusInfo(selectedOrder.status).icon, { className: 'w-5 h-5' })}
                    <span className="font-semibold">{getStatusInfo(selectedOrder.status).label}</span>
                  </div>
                </div>

                {/* Produits */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Produits</h4>
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-lg">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-16 h-16 bg-gray-200 rounded flex items-center justify-center ${item.product.images && item.product.images.length > 0 ? 'hidden' : ''}`}>
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-800">{item.product.name}</h5>
                          <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">
                            {formatXOF(item.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatXOF(item.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informations de livraison */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Adresse de livraison</h4>
                    <p className="text-gray-600">{selectedOrder.shipping_address}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Téléphone</h4>
                    <p className="text-gray-600">{selectedOrder.phone}</p>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
                    <p className="text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Total */}
                <div className="bg-white p-4 rounded-lg border-t-2 border-blue-600">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatXOF(selectedOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Liste des commandes */
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <div
                    key={order.id}
                    className={`bg-white border-2 ${statusInfo.borderColor} rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800">
                          Commande #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.color}`}>
                        {React.createElement(statusInfo.icon, { className: 'w-4 h-4' })}
                        <span className="text-sm font-semibold">{statusInfo.label}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {order.order_items.length} article{order.order_items.length > 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-blue-600">
                          {formatXOF(order.total_amount)}
                        </span>
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                          <Eye className="w-4 h-4" />
                          Voir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersModal;
