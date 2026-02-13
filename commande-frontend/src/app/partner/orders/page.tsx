'use client';

import { useState, useEffect } from 'react';
import PartnerLayout from '@/components/partner/PartnerLayout';
import { partnerService, PartnerOrder, PartnerPaymentCode } from '@/services/partnerService';

export default function PartnerOrdersPage() {
  const [orders, setOrders] = useState<PartnerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<number | null>(null);
  const [generatedCode, setGeneratedCode] = useState<PartnerPaymentCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await partnerService.getOrders();
      setOrders(response.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async (orderId: number) => {
    try {
      setGenerating(orderId);
      setError(null);
      const response = await partnerService.generatePaymentCode(orderId);
      setGeneratedCode(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la generation du code');
    } finally {
      setGenerating(null);
    }
  };

  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' CFA';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <PartnerLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Commandes disponibles</h1>
        <p className="text-gray-500">Commandes non payees pour lesquelles vous pouvez generer un code de paiement.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Generated code display */}
        {generatedCode && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Code de paiement genere</h3>
            <p className="text-4xl font-mono font-bold text-green-700 tracking-wider mb-4">
              {generatedCode.code}
            </p>
            <div className="text-sm text-green-600 space-y-1">
              <p>Montant: {formatCFA(generatedCode.amount)}</p>
              <p>Commande #{generatedCode.order_id}</p>
              <p>Expire le: {formatDate(generatedCode.expires_at)}</p>
            </div>
            <button
              onClick={() => setGeneratedCode(null)}
              className="mt-4 text-sm text-green-700 underline hover:text-green-800"
            >
              Fermer
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <p className="text-gray-500">Aucune commande non payee disponible.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Articles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.user?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCFA(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.order_items?.length || 0} article(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleGenerateCode(order.id)}
                        disabled={generating === order.id}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        {generating === order.id ? 'Generation...' : 'Generer un code'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}
