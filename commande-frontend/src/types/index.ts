export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  isNew?: boolean;
  isPromo?: boolean;
  isBestSeller?: boolean;
  freeShipping?: boolean;
}

export interface Category {
  id: string;
  name: string;
  subcategories?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FilterOptions {
  priceRange: [number, number];
  categories: string[];
  rating: number;
  freeShipping: boolean;
  sort: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'bestseller';
}