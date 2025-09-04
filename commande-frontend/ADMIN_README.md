# Interface d'Administration - Frontend

Cette documentation décrit l'interface d'administration créée pour gérer les catégories et produits de votre boutique en ligne.

## 🏗️ Architecture

L'interface d'administration est construite avec :
- **Next.js 14** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **Composants réutilisables** pour la cohérence

## 📁 Structure des fichiers

```
src/
├── components/admin/           # Composants d'administration
│   ├── AdminLayout.tsx        # Layout principal admin
│   ├── AdminProtectedRoute.tsx # Protection des routes
│   ├── CategoryForm.tsx       # Formulaire catégories
│   ├── SubcategoryForm.tsx    # Formulaire sous-catégories
│   ├── ProductForm.tsx        # Formulaire produits
│   ├── CategoryTable.tsx      # Tableau catégories
│   ├── ProductTable.tsx       # Tableau produits
│   ├── Pagination.tsx         # Composant pagination
│   ├── Toast.tsx              # Système de notifications
│   └── index.ts               # Exports centralisés
├── services/
│   └── adminService.ts        # Service API admin
├── hooks/
│   └── useAdminAuth.ts        # Hook authentification admin
└── types/index.ts             # Types TypeScript étendus

app/admin/                     # Pages d'administration
├── layout.tsx                 # Layout avec contexte toast
├── page.tsx                   # Tableau de bord
├── categories/
│   └── page.tsx              # Gestion catégories
└── products/
    └── page.tsx              # Gestion produits
```

## 🔐 Sécurité et Authentification

### Protection des routes
- **Middleware Next.js** : Vérification au niveau routeur
- **Hook useAdminAuth** : Vérification côté client
- **AdminProtectedRoute** : Composant de protection
- **Redirection automatique** si non autorisé

### Vérifications
1. Utilisateur connecté (token présent)
2. Rôle admin vérifié
3. Redirection vers accueil si non autorisé

## 🎨 Composants Principaux

### AdminLayout
Layout principal avec :
- Navigation latérale responsive
- Header avec informations utilisateur
- Menu de navigation contextuel
- Déconnexion sécurisée

### Formulaires
- **CategoryForm** : Création/édition catégories
- **SubcategoryForm** : Création/édition sous-catégories  
- **ProductForm** : Création/édition produits avec upload d'images

### Tableaux
- **CategoryTable** : Liste des catégories avec actions
- **ProductTable** : Liste des produits avec aperçu images
- Actions : Modifier, Supprimer, Changer statut

### Utilitaires
- **Pagination** : Navigation entre pages
- **Toast** : Notifications succès/erreur
- **Filtres** : Recherche et filtrage des données

## 🔧 Services API

### AdminService
Service centralisé pour toutes les opérations CRUD :

```typescript
// Catégories
adminService.getCategories(page, perPage)
adminService.createCategory(data)
adminService.updateCategory(id, data)
adminService.deleteCategory(id)

// Produits
adminService.getProducts(page, perPage, filters)
adminService.createProduct(data)
adminService.updateProduct(id, data)
adminService.deleteProduct(id)

// Upload
adminService.uploadImage(file)
```

## 📊 Fonctionnalités

### Tableau de bord
- Statistiques en temps réel
- Compteurs : catégories, produits actifs/inactifs
- Actions rapides vers les sections
- Vue d'ensemble de la boutique

### Gestion des catégories
- ✅ Créer/modifier/supprimer catégories
- ✅ Changer le statut (actif/inactif)
- ✅ Recherche et filtrage
- ✅ Pagination
- ✅ Compteur de produits par catégorie

### Gestion des produits
- ✅ Créer/modifier/supprimer produits
- ✅ Upload et gestion d'images
- ✅ Association catégories/sous-catégories
- ✅ Gestion des prix et stock
- ✅ Produits vedettes
- ✅ Filtres avancés (statut, catégorie, recherche)
- ✅ Aperçu images dans le tableau

## 🎯 Types TypeScript

### Types principaux
```typescript
interface AdminCategory {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  products_count?: number;
}

interface AdminProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category_id: number;
  subcategory_id?: number;
  image?: string;
  status: 'active' | 'inactive';
  is_featured: boolean;
  stock_quantity: number;
  // ... relations et timestamps
}
```

## 🚀 Utilisation

### Accès à l'administration
1. Se connecter avec un compte admin
2. Naviguer vers `/admin`
3. Utiliser la navigation latérale

### Créer une catégorie
1. Aller dans "Catégories"
2. Cliquer "Nouvelle catégorie"
3. Remplir le formulaire
4. Sauvegarder

### Créer un produit
1. Aller dans "Produits"
2. Cliquer "Nouveau produit"
3. Remplir les informations
4. Sélectionner catégorie/sous-catégorie
5. Uploader une image (optionnel)
6. Sauvegarder

## 🔄 Gestion des états

### Loading states
- Spinners pendant les chargements
- États de chargement pour chaque action
- Feedback visuel pour les uploads

### Error handling
- Gestion centralisée des erreurs
- Messages d'erreur contextuels
- Validation côté client et serveur

### Success feedback
- Notifications toast pour les succès
- Mise à jour automatique des listes
- Feedback visuel pour les actions

## 🎨 Responsive Design

- **Mobile-first** : Interface adaptée mobile
- **Sidebar responsive** : Menu hamburger sur mobile
- **Tableaux scrollables** : Gestion overflow horizontal
- **Formulaires adaptatifs** : Layout flexible

## 🔧 Configuration

### Variables d'environnement
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Personnalisation
- Couleurs dans `tailwind.config.js`
- Breakpoints responsive
- Composants modulaires et réutilisables

## 📝 Bonnes pratiques

### Code
- Composants TypeScript stricts
- Hooks personnalisés pour la logique
- Services centralisés pour les API
- Gestion d'état locale avec useState

### UX/UI
- Confirmations pour les suppressions
- Loading states pour toutes les actions
- Messages d'erreur clairs
- Navigation intuitive

### Performance
- Pagination pour les grandes listes
- Lazy loading des images
- Optimisation des re-renders
- Mise en cache des données utilisateur

## 🚧 Extensions futures

- Gestion des commandes
- Statistiques avancées
- Gestion des utilisateurs
- Système de permissions granulaires
- Export/Import de données
- Historique des modifications
