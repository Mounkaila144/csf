import { ProductStatus, ProductStatusInfo } from '../types';

export const PRODUCT_STATUSES: ProductStatusInfo[] = [
  {
    value: 'best_seller',
    label: 'Meilleures Ventes',
    emoji: '🏆',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    value: 'new',
    label: 'Nouveautés',
    emoji: '✨',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    value: 'on_sale',
    label: 'Promotions Spéciales',
    emoji: '🔥',
    color: 'bg-red-100 text-red-800'
  }
];

export const getStatusInfo = (status: ProductStatus): ProductStatusInfo | undefined => {
  return PRODUCT_STATUSES.find(s => s.value === status);
};

export const getStatusLabel = (status: ProductStatus): string => {
  const info = getStatusInfo(status);
  return info ? `${info.emoji} ${info.label}` : status;
};