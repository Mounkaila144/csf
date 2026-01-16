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
    description: 'Smartphone haut de gamme avec écran AMOLED 6.5", processeur octa-core, 8GB RAM, 128GB stockage. Appareil photo triple 64MP + 12MP + 5MP. Batterie 5000mAh avec charge rapide 65W. Compatible 5G, NFC, et reconnaissance faciale.',
    price: 196500,
    originalPrice: 262000,
    image: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    rating: 4.5,
    reviews: 1247,
    category: 'electronics',
    stock: 45,
    isPromo: true,
    isBestSeller: true,
    freeShipping: true
  },
  {
    id: '2',
    name: 'Écouteurs Bluetooth Premium',
    description: 'Écouteurs sans fil avec réduction de bruit active (ANC), autonomie 30h, étui de charge USB-C. Son Hi-Fi stéréo, microphone intégré pour appels clairs. Résistants à l\'eau IPX5. Connexion Bluetooth 5.2 stable jusqu\'à 10m.',
    price: 52400,
    originalPrice: 85200,
    image: 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/8000621/pexels-photo-8000621.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    rating: 4.7,
    reviews: 892,
    category: 'electronics',
    stock: 120,
    isPromo: true,
    freeShipping: true
  },
  {
    id: '3',
    name: 'Montre Connectée Sport',
    description: 'Montre intelligente avec écran tactile AMOLED 1.4", suivi d\'activité 24/7, moniteur de fréquence cardiaque, GPS intégré. Étanche 5ATM, autonomie 7 jours. Compatible iOS et Android. Plus de 100 modes sportifs.',
    price: 98200,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    rating: 4.3,
    reviews: 654,
    category: 'electronics',
    stock: 89,
    isNew: true,
    freeShipping: true
  },
  {
    id: '4',
    name: 'Tissu Wax Africain Premium - 6 yards',
    description: 'Tissu wax 100% coton de qualité supérieure, motifs traditionnels africains authentiques. Dimensions: 6 yards (environ 5.5m) x 1.2m de largeur. Couleurs vives et résistantes au lavage. Idéal pour confection de vêtements, accessoires et décoration. Importé directement d\'Afrique de l\'Ouest.',
    price: 30100,
    originalPrice: 45800,
    image: 'https://images.pexels.com/photos/1130623/pexels-photo-1130623.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/1130623/pexels-photo-1130623.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/6069002/pexels-photo-6069002.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/5709667/pexels-photo-5709667.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/5709670/pexels-photo-5709670.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    rating: 4.6,
    reviews: 423,
    category: 'fashion',
    stock: 78,
    isPromo: true,
    freeShipping: false
  },
  {
    id: '5',
    name: 'Générateur Solaire Portable 500W',
    description: 'Station d\'énergie portable 500W avec batterie lithium 518Wh. Panneau solaire inclus. Sorties: 2x AC 220V, 4x USB, 2x USB-C PD, 1x DC 12V. Recharge solaire, secteur ou voiture. Idéal camping, urgences, coupures électriques.',
    price: 229000,
    image: 'https://images.pexels.com/photos/1164778/pexels-photo-1164778.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/1164778/pexels-photo-1164778.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    rating: 4.4,
    reviews: 267,
    category: 'home',
    stock: 23,
    isNew: true,
    freeShipping: true
  },
  {
    id: '6',
    name: 'Machine à Coudre Industrielle',
    description: 'Machine à coudre industrielle professionnelle, moteur 550W, vitesse jusqu\'à 5000 points/min. Table de travail en acier robuste 120x60cm. Système d\'entraînement automatique du tissu. Idéale pour ateliers de couture, confection textile, maroquinerie. Garantie 2 ans, pièces détachées disponibles.',
    price: 589000,
    image: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3738382/pexels-photo-3738382.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/6474471/pexels-photo-6474471.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    rating: 4.8,
    reviews: 156,
    category: 'industrial',
    stock: 12,
    isBestSeller: true,
    freeShipping: true
  },
  {
    id: '7',
    name: 'Pièces Détachées Auto - Kit Freinage',
    description: 'Kit de freinage complet: 4 plaquettes avant + 4 plaquettes arrière. Compatible avec la plupart des véhicules. Matériau céramique haute performance, faible bruit, longue durée de vie. Certification ISO 9001. Installation facile.',
    price: 39300,
    originalPrice: 58900,
    image: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/13065690/pexels-photo-13065690.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    rating: 4.5,
    reviews: 789,
    category: 'auto',
    stock: 156,
    isPromo: true,
    freeShipping: false
  },
  {
    id: '8',
    name: 'Service Transport Maritime - Container 20ft',
    description: 'Service de transport maritime professionnel. Container 20 pieds (6m x 2.4m x 2.4m), capacité 28m³. Départ Chine vers Afrique de l\'Ouest. Délai 25-35 jours. Assurance incluse. Suivi en temps réel. Dédouanement assisté disponible.',
    price: 1965000,
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    rating: 4.6,
    reviews: 334,
    category: 'business',
    stock: 5,
    isNew: true,
    freeShipping: true
  },
  {
    id: '9',
    name: 'Équipement Médical - Stéthoscope Digital',
    description: 'Stéthoscope électronique professionnel avec amplification sonore 20x. Écran LCD, enregistrement audio, connexion Bluetooth. Batterie rechargeable autonomie 18h. Embouts interchangeables. Idéal médecins, infirmiers, étudiants. Certification CE.',
    price: 131000,
    image: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    rating: 4.2,
    reviews: 445,
    category: 'industrial',
    stock: 34,
    isBestSeller: true,
    freeShipping: true
  },
  {
    id: '10',
    name: 'Ordinateur Portable Gaming',
    description: 'PC portable gaming haute performance. Écran 15.6" 144Hz Full HD, processeur Intel i7 11ème gen, RTX 3060 6GB, 16GB RAM DDR4, SSD 512GB NVMe. Clavier rétroéclairé RGB, refroidissement avancé. Windows 11 préinstallé.',
    price: 589000,
    originalPrice: 786000,
    image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    rating: 4.7,
    reviews: 567,
    category: 'electronics',
    stock: 18,
    isPromo: true,
    isBestSeller: true,
    freeShipping: true
  },
  {
    id: '11',
    name: 'Chaussures de Sécurité Industrielles',
    description: 'Chaussures de sécurité S3 avec embout acier, semelle anti-perforation, antistatique. Cuir véritable résistant, doublure respirante. Semelle antidérapante caoutchouc. Tailles 38-47. Normes EN ISO 20345. Confort toute la journée.',
    price: 52400,
    image: 'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    rating: 4.4,
    reviews: 278,
    category: 'industrial',
    stock: 203,
    isNew: true,
    freeShipping: false
  },
  {
    id: '12',
    name: 'Service Transport Aérien Express',
    description: 'Transport aérien express international. Livraison 3-7 jours depuis la Chine. Suivi en temps réel, assurance tous risques incluse. Poids max 100kg par colis. Dédouanement rapide. Service porte-à-porte disponible. Support client 24/7.',
    price: 163800,
    image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/62623/wing-plane-flying-airplane-62623.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    rating: 4.9,
    reviews: 1023,
    category: 'business',
    stock: 999,
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