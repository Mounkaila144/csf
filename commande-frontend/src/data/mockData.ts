import { Product, Category } from '../types';

export const categories: Category[] = [
  {
    id: 'electronics',
    name: 'Électronique',
    subcategories: ['Smartphones', 'Ordinateurs', 'Audio', 'Photo', 'Gaming', 'Accessoires']
  },
  {
    id: 'fashion',
    name: 'Mode',
    subcategories: ['Femme', 'Homme', 'Enfants', 'Chaussures', 'Sacs', 'Bijoux']
  },
  {
    id: 'home',
    name: 'Maison & Jardin',
    subcategories: ['Décoration', 'Cuisine', 'Meubles', 'Jardin', 'Bricolage', 'Électroménager']
  },
  {
    id: 'industrial',
    name: 'Équipements Industriels',
    subcategories: ['Machines', 'Outils', 'Matériaux', 'Équipements', 'Pièces détachées', 'Sécurité']
  },
  {
    id: 'auto',
    name: 'Auto & Transport',
    subcategories: ['Pièces Auto', 'Accessoires', 'Outils', 'Moto', 'Vélo', 'Logistique']
  },
  {
    id: 'business',
    name: 'Services Logistiques',
    subcategories: ['Transport Maritime', 'Transport Aérien', 'Transport Routier', 'Douanes', 'Assurance', 'Sourcing']
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Smartphone Android 5G - 128GB',
    price: 196500,
    originalPrice: 262000,
    image: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.5,
    reviews: 1247,
    category: 'electronics',
    isPromo: true,
    isBestSeller: true,
    freeShipping: true
  },
  {
    id: '2',
    name: 'Écouteurs Bluetooth Premium',
    price: 52400,
    originalPrice: 85200,
    image: 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.7,
    reviews: 892,
    category: 'electronics',
    isPromo: true,
    freeShipping: true
  },
  {
    id: '3',
    name: 'Montre Connectée Sport',
    price: 98200,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.3,
    reviews: 654,
    category: 'electronics',
    isNew: true,
    freeShipping: true
  },
  {
    id: '4',
    name: 'Tissu Wax Africain Premium - 6 yards',
    price: 30100,
    originalPrice: 45800,
    image: 'https://images.pexels.com/photos/1130623/pexels-photo-1130623.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.6,
    reviews: 423,
    category: 'fashion',
    isPromo: true,
    freeShipping: false
  },
  {
    id: '5',
    name: 'Générateur Solaire Portable 500W',
    price: 229000,
    image: 'https://images.pexels.com/photos/1164778/pexels-photo-1164778.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.4,
    reviews: 267,
    category: 'home',
    isNew: true,
    freeShipping: true
  },
  {
    id: '6',
    name: 'Machine à Coudre Industrielle',
    price: 589000,
    image: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.8,
    reviews: 156,
    category: 'industrial',
    isBestSeller: true,
    freeShipping: true
  },
  {
    id: '7',
    name: 'Pièces Détachées Auto - Kit Freinage',
    price: 39300,
    originalPrice: 58900,
    image: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.5,
    reviews: 789,
    category: 'auto',
    isPromo: true,
    freeShipping: false
  },
  {
    id: '8',
    name: 'Service Transport Maritime - Container 20ft',
    price: 1965000,
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.6,
    reviews: 334,
    category: 'business',
    isNew: true,
    freeShipping: true
  },
  {
    id: '9',
    name: 'Équipement Médical - Stéthoscope Digital',
    price: 131000,
    image: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.2,
    reviews: 445,
    category: 'industrial',
    isBestSeller: true,
    freeShipping: true
  },
  {
    id: '10',
    name: 'Ordinateur Portable Gaming',
    price: 589000,
    originalPrice: 786000,
    image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.7,
    reviews: 567,
    category: 'electronics',
    isPromo: true,
    isBestSeller: true,
    freeShipping: true
  },
  {
    id: '11',
    name: 'Chaussures de Sécurité Industrielles',
    price: 52400,
    image: 'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.4,
    reviews: 278,
    category: 'industrial',
    isNew: true,
    freeShipping: false
  },
  {
    id: '12',
    name: 'Service Transport Aérien Express',
    price: 163800,
    image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.9,
    reviews: 1023,
    category: 'business',
    isBestSeller: true,
    freeShipping: true
  }
];

export const banners = [
  {
    id: 1,
    title: 'Commerce International & Transport',
    subtitle: 'Plus de 5 ans d\'expérience - Livraison rapide et sécurisée depuis la Chine',
    image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=1200',
    cta: 'Découvrir nos services',
    color: 'blue',
    action: 'scroll' // Scroll vers les produits
  },
  {
    id: 2,
    title: 'Opportunités d\'Affaires',
    subtitle: 'Devenez ambassadeur et profitez d\'une source de revenus avec nos partenaires chinois',
    image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=1200',
    cta: 'Devenir Ambassadeur',
    color: 'blue',
    action: 'register-vendor' // Ouvrir le modal d'inscription vendeur
  },
  {
    id: 3,
    title: 'Transport Multimodal',
    subtitle: 'Transport aérien, maritime et routier - Solutions sur mesure pour vos besoins',
    image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1200',
    cta: 'Demander un devis',
    color: 'blue',
    action: 'whatsapp' // Rediriger vers WhatsApp
  }
];