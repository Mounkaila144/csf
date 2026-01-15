import { useState, useEffect } from 'react';

interface PriceInfo {
  rmb: {
    amount: number;
    formatted: string;
    currency: string;
    symbol: string;
  };
  xof: {
    amount: number;
    formatted: string;
    currency: string;
    symbol: string;
  };
  exchange_rate: number;
  updated_at: string;
}

interface CurrencyHook {
  exchangeRate: number;
  loading: boolean;
  error: string | null;
  convertToXOF: (amountRMB: number) => number;
  formatRMB: (amount: number) => string;
  formatXOF: (amount: number) => string;
  getPriceInfo: (amountRMB: number) => PriceInfo | null;
  refreshRate: () => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;

export const useCurrency = (): CurrencyHook => {
  const [exchangeRate, setExchangeRate] = useState<number>(85); // Taux par défaut
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExchangeRate = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/currency/rate?from=CNY&to=XOF`);

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
      }

      const data = await response.json();

      if (data.status === 'success' && data.data.rate) {
        setExchangeRate(data.data.rate);

        // Sauvegarder en localStorage pour usage offline
        localStorage.setItem('currency_rate', JSON.stringify({
          rate: data.data.rate,
          updated_at: new Date().toISOString()
        }));
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
      setError('Impossible de récupérer le taux de change');

      // Essayer de charger depuis le localStorage
      const cached = localStorage.getItem('currency_rate');
      if (cached) {
        try {
          const { rate } = JSON.parse(cached);
          setExchangeRate(rate);
        } catch (e) {
          console.error('Error parsing cached rate:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();

    // Mettre à jour le taux toutes les heures
    const interval = setInterval(fetchExchangeRate, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const convertToXOF = (amountRMB: number): number => {
    return Math.round(amountRMB * exchangeRate);
  };

  const formatRMB = (amount: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace('CN¥', '¥');
  };

  const formatXOF = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  };

  const getPriceInfo = (amountRMB: number): PriceInfo | null => {
    if (!exchangeRate) return null;

    const amountXOF = convertToXOF(amountRMB);

    return {
      rmb: {
        amount: amountRMB,
        formatted: formatRMB(amountRMB),
        currency: 'CNY',
        symbol: '¥'
      },
      xof: {
        amount: amountXOF,
        formatted: formatXOF(amountXOF),
        currency: 'XOF',
        symbol: 'FCFA'
      },
      exchange_rate: exchangeRate,
      updated_at: new Date().toISOString()
    };
  };

  const refreshRate = async () => {
    await fetchExchangeRate();
  };

  return {
    exchangeRate,
    loading,
    error,
    convertToXOF,
    formatRMB,
    formatXOF,
    getPriceInfo,
    refreshRate
  };
};
