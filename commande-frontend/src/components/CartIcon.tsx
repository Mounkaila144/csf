'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartIconProps {
  className?: string;
  showBadge?: boolean;
}

const CartIcon: React.FC<CartIconProps> = ({ 
  className = "w-6 h-6", 
  showBadge = true 
}) => {
  const { totalItems } = useCart();

  return (
    <div className="relative">
      <ShoppingCart className={className} />
      {showBadge && totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </div>
  );
};

export default CartIcon;