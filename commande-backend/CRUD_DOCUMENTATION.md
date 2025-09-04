# Documentation CRUD - Catégories, Sous-catégories et Produits

## Base URL
```
http://localhost:8000/api
```

---

## 📁 CATEGORIES

### Routes Publiques

#### 1. Lister les catégories actives
**URL:** `GET /categories/active`

**Response:**
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "Électronique",
            "description": "Produits électroniques",
            "image": "categories/image.jpg",
            "is_active": true,
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        }
    ]
}
```

### Routes Admin (Auth + Role:admin requis)

#### 2. Créer une catégorie
**URL:** `POST /categories`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```

**Body (FormData):**
```
name: "Nouvelle catégorie"
description: "Description de la catégorie"
image: [file] (optionnel)
is_active: true (optionnel, défaut: true)
```

#### 3. Afficher une catégorie
**URL:** `GET /categories/{id}`

#### 4. Modifier une catégorie
**URL:** `PUT /categories/{id}`

#### 5. Supprimer une catégorie
**URL:** `DELETE /categories/{id}`

---

## 📂 SOUS-CATEGORIES

### Routes Publiques

#### 1. Lister les sous-catégories actives
**URL:** `GET /subcategories/active`

#### 2. Sous-catégories par catégorie
**URL:** `GET /subcategories/category/{categoryId}`

**Response:**
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "Smartphones",
            "description": "Téléphones intelligents",
            "image": "subcategories/image.jpg",
            "category_id": 1,
            "is_active": true,
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z",
            "category": {
                "id": 1,
                "name": "Électronique"
            }
        }
    ]
}
```

### Routes Admin

#### 3. Créer une sous-catégorie
**URL:** `POST /subcategories`

**Body (FormData):**
```
name: "Nouvelle sous-catégorie"
description: "Description"
category_id: 1
image: [file] (optionnel)
is_active: true (optionnel)
```

#### 4. CRUD complet sous-catégories
- `GET /subcategories` - Lister toutes
- `GET /subcategories/{id}` - Afficher une
- `PUT /subcategories/{id}` - Modifier
- `DELETE /subcategories/{id}` - Supprimer

---

## 🛒 PRODUITS

### Routes Publiques

#### 1. Lister les produits (avec filtres)
**URL:** `GET /products`

**Paramètres de requête:**
```
?category_id=1              // Filtrer par catégorie
&subcategory_id=1          // Filtrer par sous-catégorie
&search=iphone             // Recherche par nom
&min_price=100             // Prix minimum
&max_price=500             // Prix maximum
&in_stock=1                // Seulement les produits en stock
&sort_by=price             // Trier par (price, name, created_at)
&sort_order=asc            // Ordre (asc, desc)
&per_page=10               // Nombre par page
&page=1                    // Page
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "name": "iPhone 15 Pro",
                "description": "Dernier iPhone d'Apple",
                "price": "1299.99",
                "images": [
                    "products/image1.jpg",
                    "products/image2.jpg"
                ],
                "stock": 50,
                "category_id": 1,
                "subcategory_id": 1,
                "is_active": true,
                "category": {
                    "id": 1,
                    "name": "Électronique"
                },
                "subcategory": {
                    "id": 1,
                    "name": "Smartphones"
                }
            }
        ],
        "total": 100,
        "per_page": 15,
        "last_page": 7
    }
}
```

#### 2. Afficher un produit
**URL:** `GET /products/{id}`

#### 3. Produits mis en avant
**URL:** `GET /products/featured/list`

### Routes Admin

#### 4. Créer un produit
**URL:** `POST /products`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```

**Body (FormData):**
```
name: "Nouveau produit"
description: "Description du produit"
price: 99.99
stock: 100
category_id: 1
subcategory_id: 1 (optionnel)
images[]: [file1, file2, file3] (optionnel, multiple)
is_active: true (optionnel)
```

#### 5. Modifier un produit
**URL:** `PUT /products/{id}`

**Body (FormData):**
```
name: "Produit modifié"
description: "Description modifiée"
price: 149.99
stock: 75
category_id: 1
subcategory_id: 1
images[]: [nouveaux files] (optionnel)
remove_images[]: ["products/old_image1.jpg"] (optionnel)
is_active: true
```

#### 6. Supprimer un produit
**URL:** `DELETE /products/{id}`

#### 7. Mettre à jour le stock
**URL:** `PATCH /products/{id}/stock`

**Body:**
```json
{
    "stock": 25
}
```

#### 8. Produits en stock faible
**URL:** `GET /products/low-stock/list`

**Response:**
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "Produit en rupture",
            "stock": 5,
            "category": {...},
            "subcategory": {...}
        }
    ]
}
```

---

## 🔐 Authentification Requise

### Routes Admin
Toutes les routes de création, modification et suppression nécessitent :
```
Headers:
Authorization: Bearer {token_admin}
```

### Routes Publiques
Aucune authentification requise pour :
- Lister les catégories/sous-catégories/produits actifs
- Afficher un produit spécifique
- Produits mis en avant

---

## 📷 Gestion des Images

### Upload d'images
- **Formats acceptés:** jpeg, png, jpg, gif
- **Taille max:** 2MB par image
- **Stockage:** `storage/app/public/`
- **Dossiers:** 
  - Categories: `categories/`
  - Subcategories: `subcategories/`
  - Products: `products/`

### URLs d'accès aux images
```
http://localhost:8000/storage/categories/image.jpg
http://localhost:8000/storage/subcategories/image.jpg
http://localhost:8000/storage/products/image.jpg
```

### Suppression automatique
Les images sont automatiquement supprimées lors de :
- Suppression d'une entité
- Remplacement d'une image existante
- Suppression manuelle via `remove_images[]`

---

## ❌ Codes d'Erreur

- **400:** Erreur de validation
- **401:** Non authentifié
- **403:** Accès refusé (rôle insuffisant)
- **404:** Ressource non trouvée
- **500:** Erreur serveur

**Format des erreurs:**
```json
{
    "status": "error",
    "message": "Description de l'erreur",
    "errors": {
        "field": ["Message d'erreur spécifique"]
    }
}
```