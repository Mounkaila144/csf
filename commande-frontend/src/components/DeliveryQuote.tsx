'use client';

import React, { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { quoteService, QuoteCalculation } from '../services/quoteService';
import { DeliveryZone } from '../types';

interface CartItemForQuote {
  id: number;
  quantity: number;
}

interface DeliveryQuoteProps {
  cartItems: CartItemForQuote[];
  onDeliveryCostChange?: (cost: number) => void;
}

const DeliveryQuote: React.FC<DeliveryQuoteProps> = ({ cartItems, onDeliveryCostChange }) => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [calculation, setCalculation] = useState<QuoteCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadZones();
  }, []);

  useEffect(() => {
    if (selectedZoneId && cartItems.length > 0) {
      calculateDelivery();
    } else {
      setCalculation(null);
      onDeliveryCostChange?.(0);
    }
  }, [selectedZoneId, cartItems]);

  const loadZones = async () => {
    try {
      setZonesLoading(true);
      const response = await quoteService.getDeliveryZones();
      setZones(response.data);
    } catch (err) {
      console.error('Erreur chargement zones:', err);
    } finally {
      setZonesLoading(false);
    }
  };

  const calculateDelivery = async () => {
    if (!selectedZoneId) return;

    try {
      setLoading(true);
      setError(null);
      const items = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      }));
      const response = await quoteService.calculateQuote(selectedZoneId, items);
      setCalculation(response.data);
      onDeliveryCostChange?.(response.data.delivery_cost);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du calcul');
      setCalculation(null);
      onDeliveryCostChange?.(0);
    } finally {
      setLoading(false);
    }
  };

  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' CFA';
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
      <div className="flex items-center gap-2 text-gray-700">
        <Truck className="w-4 h-4" />
        <span className="text-sm font-medium">Estimation livraison</span>
      </div>

      {zonesLoading ? (
        <div className="text-sm text-gray-500">Chargement des zones...</div>
      ) : zones.length === 0 ? (
        <div className="text-sm text-gray-500">Aucune zone de livraison disponible</div>
      ) : (
        <>
          <select
            value={selectedZoneId || ''}
            onChange={(e) => setSelectedZoneId(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selectionnez votre zone</option>
            {zones.map(zone => (
              <option key={zone.id} value={zone.id}>
                {zone.name} {zone.city ? `(${zone.city.name})` : ''}
              </option>
            ))}
          </select>

          {loading && (
            <div className="text-sm text-gray-500 text-center py-1">
              Calcul en cours...
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
              {error}
            </div>
          )}

          {calculation && !loading && (
            <div className="space-y-1 text-sm">
              {calculation.total_weight_kg > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Poids total</span>
                  <span>{calculation.total_weight_kg.toFixed(2)} kg</span>
                </div>
              )}
              {calculation.total_volume_m3 > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Volume total</span>
                  <span>{calculation.total_volume_m3.toFixed(4)} m3</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-gray-800 border-t pt-1">
                <span>Frais de livraison</span>
                <span className="text-blue-600">{formatCFA(calculation.delivery_cost)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DeliveryQuote;
