'use client';

import React, { useState } from 'react';
import { X, User, Phone, MapPin, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { orderService, OrderData } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose }) => {
  const { items, totalAmount, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    shipping_address: '',
    billing_address: '',
    phone: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Vous devez être connecté pour passer une commande');
      return;
    }

    if (items.length === 0) {
      setError('Votre panier est vide');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData: OrderData = {
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        shipping_address: formData.shipping_address,
        billing_address: formData.billing_address || formData.shipping_address,
        phone: formData.phone,
        notes: formData.notes,
      };

      await orderService.createOrder(orderData);
      
      setSuccess(true);
      clearCart();
      
      // Fermer le modal après 3 secondes
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setFormData({
          shipping_address: '',
          billing_address: '',
          phone: '',
          notes: '',
        });
      }, 3000);

    } catch (err) {
      console.error('Erreur lors de la création de la commande:', err);
      setError('Erreur lors de la création de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' CFA';
  };

  if (success) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
              <div className="mb-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Commande confirmée !
              </h3>
              <p className="text-gray-600 mb-4">
                Votre commande a été créée avec succès. Vous recevrez une confirmation par email.
              </p>
              <div className="animate-pulse text-sm text-gray-500">
                Fermeture automatique dans quelques secondes...
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Finaliser la commande</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    Vous devez être connecté pour passer une commande.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Récapitulatif de la commande */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Récapitulatif
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                          </div>
                          <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      ))}
                      <hr className="border-gray-300" />
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total</span>
                        <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations de livraison */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Adresse de livraison
                  </h3>
                  <textarea
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleInputChange}
                    placeholder="Adresse complète de livraison..."
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Adresse de facturation */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Adresse de facturation (optionnel)
                  </h3>
                  <textarea
                    name="billing_address"
                    value={formData.billing_address}
                    onChange={handleInputChange}
                    placeholder="Si différente de l'adresse de livraison..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Téléphone
                  </h3>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Numéro de téléphone"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Notes (optionnel)
                  </h3>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Instructions spéciales, préférences de livraison..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Boutons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isAuthenticated}
                    className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                      loading || !isAuthenticated
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Traitement...' : 'Confirmer la commande'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderModal;