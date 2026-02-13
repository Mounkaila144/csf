'use client';

import React, { useState } from 'react';
import { orderService } from '../services/orderService';

interface PaymentCodeInputProps {
  orderId: number;
  onSuccess: () => void;
}

const PaymentCodeInput: React.FC<PaymentCodeInputProps> = ({ orderId, onSuccess }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formatCode = (value: string) => {
    // Remove non-alphanumeric characters except hyphens
    const clean = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    return clean;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;

    try {
      setLoading(true);
      setError(null);
      await orderService.validatePayment(orderId, code.trim());
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation du code');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-green-700 font-semibold">Paiement valide avec succes !</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-blue-800 mb-2">Valider le paiement</h4>
      <p className="text-sm text-blue-600 mb-3">
        Saisissez le code de paiement fourni par votre partenaire de paiement.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded mb-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(formatCode(e.target.value))}
          placeholder="CSF-XXXX-XXXX"
          className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center tracking-wider uppercase"
          maxLength={14}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium whitespace-nowrap"
        >
          {loading ? 'Validation...' : 'Valider'}
        </button>
      </form>
    </div>
  );
};

export default PaymentCodeInput;
