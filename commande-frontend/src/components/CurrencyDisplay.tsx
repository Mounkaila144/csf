import React from 'react';
import { useCurrency } from '../hooks/useCurrency';

interface CurrencyDisplayProps {
  priceRMB: number;
  showBothCurrencies?: boolean;
  primaryCurrency?: 'RMB' | 'XOF';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  priceRMB,
  showBothCurrencies = true,
  primaryCurrency = 'XOF',
  size = 'md',
  className = ''
}) => {
  const { formatRMB, formatXOF, convertToXOF, loading } = useCurrency();

  const priceXOF = convertToXOF(priceRMB);

  // Tailles de texte selon la prop size
  const sizeClasses = {
    sm: {
      primary: 'text-sm font-semibold',
      secondary: 'text-xs',
      divider: 'text-xs'
    },
    md: {
      primary: 'text-lg font-bold',
      secondary: 'text-sm',
      divider: 'text-sm'
    },
    lg: {
      primary: 'text-2xl font-bold',
      secondary: 'text-base',
      divider: 'text-base'
    }
  };

  const currentSize = sizeClasses[size];

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!showBothCurrencies) {
    // Afficher seulement la devise primaire
    return (
      <div className={`${currentSize.primary} text-blue-600 ${className}`}>
        {primaryCurrency === 'XOF' ? formatXOF(priceXOF) : formatRMB(priceRMB)}
      </div>
    );
  }

  // Afficher les deux devises
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {primaryCurrency === 'XOF' ? (
        <>
          {/* Prix principal en XOF */}
          <div className={`${currentSize.primary} text-blue-600`}>
            {formatXOF(priceXOF)}
          </div>
          {/* Prix secondaire en RMB */}
          <div className={`${currentSize.secondary} text-gray-500`}>
            ≈ {formatRMB(priceRMB)}
          </div>
        </>
      ) : (
        <>
          {/* Prix principal en RMB */}
          <div className={`${currentSize.primary} text-blue-600`}>
            {formatRMB(priceRMB)}
          </div>
          {/* Prix secondaire en XOF */}
          <div className={`${currentSize.secondary} text-gray-500`}>
            ≈ {formatXOF(priceXOF)}
          </div>
        </>
      )}
    </div>
  );
};

// Composant compact pour afficher le prix en ligne
export const InlineCurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  priceRMB,
  showBothCurrencies = true,
  primaryCurrency = 'XOF',
  size = 'md',
  className = ''
}) => {
  const { formatRMB, formatXOF, convertToXOF, loading } = useCurrency();

  const priceXOF = convertToXOF(priceRMB);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (loading) {
    return (
      <span className={`animate-pulse inline-block ${className}`}>
        <span className="inline-block h-4 bg-gray-200 rounded w-20"></span>
      </span>
    );
  }

  if (!showBothCurrencies) {
    return (
      <span className={`${sizeClasses[size]} font-bold text-blue-600 ${className}`}>
        {primaryCurrency === 'XOF' ? formatXOF(priceXOF) : formatRMB(priceRMB)}
      </span>
    );
  }

  return (
    <span className={`${sizeClasses[size]} ${className}`}>
      <span className="font-bold text-blue-600">
        {primaryCurrency === 'XOF' ? formatXOF(priceXOF) : formatRMB(priceRMB)}
      </span>
      <span className="text-gray-500 text-sm ml-2">
        (≈ {primaryCurrency === 'XOF' ? formatRMB(priceRMB) : formatXOF(priceXOF)})
      </span>
    </span>
  );
};

export default CurrencyDisplay;
