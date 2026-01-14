# Documentation API - Application Mobile Flutter

## URL de Base
```
https://commandesansfrontiere.com/api
```

## Format de Réponse
Toutes les réponses de l'API sont au format JSON avec la structure suivante:

### Réponse Réussie
```json
{
  "status": "success",
  "message": "Message descriptif",
  "data": { ... },
  "meta": { ... }  // Pour les listes paginées
}
```

### Réponse d'Erreur
```json
{
  "status": "error",
  "message": "Description de l'erreur",
  "errors": { ... }
}
```

---

## 1. Récupérer Toutes les Catégories

### Endpoint
```
GET /categories
```

### Description
Récupère la liste de toutes les catégories actives avec leurs sous-catégories.

### Paramètres Query (Optionnels)
| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `per_page` | integer | 10 | Nombre d'éléments par page |
| `page` | integer | 1 | Numéro de page |

### Exemple de Requête Flutter
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> getCategories({int perPage = 10, int page = 1}) async {
  final url = Uri.parse('https://commandesansfrontiere.com/api/categories?per_page=$perPage&page=$page');

  final response = await http.get(url);

  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Échec de récupération des catégories');
  }
}
```

### Exemple de Réponse RÉELLE
```json
{
  "status": "success",
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 2,
      "name": "Agriculture & Agroalimentaire",
      "description": "Céréales & Grains (riz, maïs, mil, blé…)\n\nFruits & Légumes frais\n\nProduits transformés (farine, huiles, épices)",
      "image": null,
      "is_active": true,
      "created_at": "2025-09-08T08:37:55.000000Z",
      "updated_at": "2025-09-08T08:37:55.000000Z",
      "subcategories": [
        {
          "id": 2,
          "name": "Céréales & Grains (riz, maïs, mil, blé…)",
          "description": null,
          "image": null,
          "category_id": 2,
          "is_active": true,
          "created_at": "2025-09-08T08:38:28.000000Z",
          "updated_at": "2025-09-08T08:38:28.000000Z"
        }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 10,
    "total": 25,
    "from": 1,
    "to": 10
  }
}
```

**⚠️ IMPORTANT - Structure des Champs:**
- `image`: Peut être `null` ou une chaîne de caractères
- `description`: Peut contenir des retours à la ligne (`\n`)
- Les subcategories ont aussi un champ `image` (peut être `null`)

### Structure de Données Category
```dart
class Category {
  final int id;
  final String name;
  final String? description;
  final String? image;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<Subcategory>? subcategories;

  Category({
    required this.id,
    required this.name,
    this.description,
    this.image,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
    this.subcategories,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      image: json['image'],
      isActive: json['is_active'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      subcategories: json['subcategories'] != null
          ? (json['subcategories'] as List)
              .map((sub) => Subcategory.fromJson(sub))
              .toList()
          : null,
    );
  }

  // Construire l'URL complète de l'image
  String? get fullImageUrl {
    if (image == null) return null;
    return 'https://commandesansfrontiere.com/storage/$image';
  }
}

class Subcategory {
  final int id;
  final String name;
  final String? description;
  final String? image;
  final int categoryId;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  Subcategory({
    required this.id,
    required this.name,
    this.description,
    this.image,
    required this.categoryId,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Subcategory.fromJson(Map<String, dynamic> json) {
    return Subcategory(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      image: json['image'],
      categoryId: json['category_id'],
      isActive: json['is_active'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  // Construire l'URL complète de l'image
  String? get fullImageUrl {
    if (image == null) return null;
    return 'https://commandesansfrontiere.com/storage/$image';
  }
}
```

---

## 2. Récupérer Tous les Produits

### Endpoint
```
GET /products
```

### Description
Récupère la liste de tous les produits actifs avec leurs catégories et sous-catégories. Supporte le filtrage et la pagination.

### Paramètres Query (Tous Optionnels)
| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `category_id` | integer | - | Filtrer par ID de catégorie |
| `subcategory_id` | integer | - | Filtrer par ID de sous-catégorie |
| `search` | string | - | Rechercher par nom de produit |
| `min_price` | numeric | - | Prix minimum |
| `max_price` | numeric | - | Prix maximum |
| `in_stock` | boolean | - | Afficher seulement produits en stock (true) |
| `status_filter` | string | - | Filtrer par statut: `best_seller`, `new`, `on_sale` |
| `sort_by` | string | created_at | Trier par: `created_at`, `price`, `name`, `stock` |
| `sort_order` | string | desc | Ordre: `asc` ou `desc` |
| `per_page` | integer | 15 | Nombre de produits par page |
| `page` | integer | 1 | Numéro de page |

### Exemple de Requête Flutter (Sans Filtre)
```dart
Future<Map<String, dynamic>> getAllProducts({int perPage = 15, int page = 1}) async {
  final url = Uri.parse('https://commandesansfrontiere.com/api/products?per_page=$perPage&page=$page');

  final response = await http.get(url);

  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Échec de récupération des produits');
  }
}
```

### Exemple de Requête Flutter (Avec Filtres)
```dart
Future<Map<String, dynamic>> getProducts({
  int? categoryId,
  int? subcategoryId,
  String? search,
  double? minPrice,
  double? maxPrice,
  bool? inStock,
  String? statusFilter,
  String sortBy = 'created_at',
  String sortOrder = 'desc',
  int perPage = 15,
  int page = 1,
}) async {
  // Construire les paramètres query
  Map<String, String> queryParams = {
    'per_page': perPage.toString(),
    'page': page.toString(),
    'sort_by': sortBy,
    'sort_order': sortOrder,
  };

  if (categoryId != null) queryParams['category_id'] = categoryId.toString();
  if (subcategoryId != null) queryParams['subcategory_id'] = subcategoryId.toString();
  if (search != null && search.isNotEmpty) queryParams['search'] = search;
  if (minPrice != null) queryParams['min_price'] = minPrice.toString();
  if (maxPrice != null) queryParams['max_price'] = maxPrice.toString();
  if (inStock != null) queryParams['in_stock'] = inStock.toString();
  if (statusFilter != null) queryParams['status_filter'] = statusFilter;

  final url = Uri.parse('https://commandesansfrontiere.com/api/products')
      .replace(queryParameters: queryParams);

  final response = await http.get(url);

  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Échec de récupération des produits');
  }
}
```

### Exemple de Réponse RÉELLE
```json
{
  "status": "success",
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 17,
      "name": "HP EliteBook Série Pro – X360 1030 G3 / 1040 G5 / 830 G6",
      "description": "HP EliteBook Série Pro – X360 1030 G3 / 1040 G5 / 830 G6\n\n💻 Caractéristiques principales :\n\nProcesseur : Intel Core i5 – 8ᵉ génération",
      "price": "196500.00",
      "stock": 0,
      "images": [
        "/storage/images/1757791547_9EtgUZESDI.jpg"
      ],
      "is_active": true,
      "status": ["best_seller", "new", "on_sale"],
      "category_id": 4,
      "subcategory_id": 15,
      "created_at": "2025-09-13T19:25:48.000000Z",
      "updated_at": "2025-09-13T19:25:48.000000Z",
      "category": {
        "id": 4,
        "name": "Électronique & Électroménager",
        "description": "Téléphones & Tablettes\n...",
        "image": null,
        "is_active": true,
        "created_at": "2025-09-08T08:45:03.000000Z",
        "updated_at": "2025-09-08T08:45:03.000000Z"
      },
      "subcategory": {
        "id": 15,
        "name": "Ordinateurs & Accessoires",
        "description": null,
        "image": null,
        "category_id": 4,
        "is_active": true,
        "created_at": "2025-09-08T08:45:45.000000Z",
        "updated_at": "2025-09-08T08:45:45.000000Z"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 67,
    "from": 1,
    "to": 15
  }
}
```

**⚠️ CRITIQUE - Structure des Images:**
- Les URLs d'images des produits contiennent DÉJÀ `/storage/` au début
- Exemple: `"/storage/images/1757791547_9EtgUZESDI.jpg"`
- **NE PAS ajouter à nouveau `/storage/` lors de la construction de l'URL complète!**
- Le champ `status` peut contenir plusieurs valeurs simultanément
- Les sous-catégories ont aussi un champ `image` (peut être `null`)

### Structure de Données Product
```dart
class Product {
  final int id;
  final String name;
  final String? description;
  final double price;
  final int stock;
  final List<String>? images;
  final bool isActive;
  final List<String>? status;
  final int categoryId;
  final int? subcategoryId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Category? category;
  final Subcategory? subcategory;

  Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.stock,
    this.images,
    required this.isActive,
    this.status,
    required this.categoryId,
    this.subcategoryId,
    required this.createdAt,
    required this.updatedAt,
    this.category,
    this.subcategory,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      price: double.parse(json['price'].toString()),
      stock: json['stock'],
      images: json['images'] != null ? List<String>.from(json['images']) : null,
      isActive: json['is_active'],
      status: json['status'] != null ? List<String>.from(json['status']) : null,
      categoryId: json['category_id'],
      subcategoryId: json['subcategory_id'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      category: json['category'] != null ? Category.fromJson(json['category']) : null,
      subcategory: json['subcategory'] != null ? Subcategory.fromJson(json['subcategory']) : null,
    );
  }

  // Construire les URLs complètes des images
  // ⚠️ IMPORTANT: Les images contiennent déjà "/storage/" au début
  List<String>? get fullImageUrls {
    if (images == null) return null;
    return images!
        .map((img) {
          // Si l'image commence déjà par "/storage/", ne pas ajouter le domaine + /storage/
          if (img.startsWith('/storage/')) {
            return 'https://commandesansfrontiere.com$img';
          }
          // Sinon, ajouter le chemin complet (pour la compatibilité)
          return 'https://commandesansfrontiere.com/storage/$img';
        })
        .toList();
  }

  // Première image du produit
  // ⚠️ IMPORTANT: Les images contiennent déjà "/storage/" au début
  String? get firstImageUrl {
    if (images == null || images!.isEmpty) return null;
    final img = images!.first;
    // Si l'image commence déjà par "/storage/", ne pas ajouter /storage/
    if (img.startsWith('/storage/')) {
      return 'https://commandesansfrontiere.com$img';
    }
    // Sinon, ajouter le chemin complet (pour la compatibilité)
    return 'https://commandesansfrontiere.com/storage/$img';
  }

  // Vérifier si le produit est en stock
  bool get isInStock => stock > 0;

  // Vérifier si le produit est nouveau
  bool get isNew => status?.contains('new') ?? false;

  // Vérifier si le produit est best-seller
  bool get isBestSeller => status?.contains('best_seller') ?? false;

  // Vérifier si le produit est en promotion
  bool get isOnSale => status?.contains('on_sale') ?? false;
}
```

---

## 3. Filtrage par Catégorie

### Cas d'Usage 1: Récupérer Tous les Produits d'une Catégorie

### Endpoint
```
GET /products?category_id={category_id}
```

### Exemple de Requête Flutter
```dart
Future<Map<String, dynamic>> getProductsByCategory(int categoryId, {int page = 1}) async {
  final url = Uri.parse(
    'https://commandesansfrontiere.com/api/products?category_id=$categoryId&page=$page'
  );

  final response = await http.get(url);

  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Échec de récupération des produits par catégorie');
  }
}
```

### Exemple d'Utilisation
```dart
// Récupérer tous les produits de la catégorie "Électronique" (ID: 1)
final electronicsProducts = await getProductsByCategory(1);
```

---

### Cas d'Usage 2: Récupérer Tous les Produits d'une Sous-catégorie

### Endpoint
```
GET /products?subcategory_id={subcategory_id}
```

### Exemple de Requête Flutter
```dart
Future<Map<String, dynamic>> getProductsBySubcategory(int subcategoryId, {int page = 1}) async {
  final url = Uri.parse(
    'https://commandesansfrontiere.com/api/products?subcategory_id=$subcategoryId&page=$page'
  );

  final response = await http.get(url);

  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Échec de récupération des produits par sous-catégorie');
  }
}
```

### Exemple d'Utilisation
```dart
// Récupérer tous les smartphones (sous-catégorie ID: 1)
final smartphones = await getProductsBySubcategory(1);
```

---

### Cas d'Usage 3: Filtrage Combiné (Catégorie + Recherche + Prix)

### Exemple de Requête Flutter
```dart
Future<Map<String, dynamic>> searchProductsInCategory({
  required int categoryId,
  required String searchTerm,
  double? maxPrice,
}) async {
  Map<String, String> queryParams = {
    'category_id': categoryId.toString(),
    'search': searchTerm,
  };

  if (maxPrice != null) {
    queryParams['max_price'] = maxPrice.toString();
  }

  final url = Uri.parse('https://commandesansfrontiere.com/api/products')
      .replace(queryParameters: queryParams);

  final response = await http.get(url);

  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Échec de recherche des produits');
  }
}
```

### Exemple d'Utilisation
```dart
// Rechercher "iPhone" dans la catégorie "Électronique" avec un prix max de 1000€
final results = await searchProductsInCategory(
  categoryId: 1,
  searchTerm: 'iPhone',
  maxPrice: 1000.0,
);
```

---

## 4. Endpoints Spéciaux pour Produits

### 4.1 Produits à la Une (Featured)
```
GET /products/featured/list
```

Retourne 8 produits actifs en stock, triés par date de création (les plus récents).

```dart
Future<List<Product>> getFeaturedProducts() async {
  final url = Uri.parse('https://commandesansfrontiere.com/api/products/featured/list');
  final response = await http.get(url);

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return (data['data'] as List)
        .map((product) => Product.fromJson(product))
        .toList();
  } else {
    throw Exception('Échec de récupération des produits à la une');
  }
}
```

---

### 4.2 Best-Sellers
```
GET /products/best-sellers/list
```

Retourne jusqu'à 12 produits marqués comme "best_seller".

```dart
Future<List<Product>> getBestSellers() async {
  final url = Uri.parse('https://commandesansfrontiere.com/api/products/best-sellers/list');
  final response = await http.get(url);

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return (data['data'] as List)
        .map((product) => Product.fromJson(product))
        .toList();
  } else {
    throw Exception('Échec de récupération des best-sellers');
  }
}
```

---

### 4.3 Nouveaux Produits
```
GET /products/new/list
```

Retourne jusqu'à 12 produits marqués comme "new".

```dart
Future<List<Product>> getNewProducts() async {
  final url = Uri.parse('https://commandesansfrontiere.com/api/products/new/list');
  final response = await http.get(url);

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return (data['data'] as List)
        .map((product) => Product.fromJson(product))
        .toList();
  } else {
    throw Exception('Échec de récupération des nouveaux produits');
  }
}
```

---

### 4.4 Produits en Promotion
```
GET /products/on-sale/list
```

Retourne jusqu'à 12 produits marqués comme "on_sale".

```dart
Future<List<Product>> getOnSaleProducts() async {
  final url = Uri.parse('https://commandesansfrontiere.com/api/products/on-sale/list');
  final response = await http.get(url);

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return (data['data'] as List)
        .map((product) => Product.fromJson(product))
        .toList();
  } else {
    throw Exception('Échec de récupération des produits en promotion');
  }
}
```

---

### 4.5 Produits par Statut (avec Pagination)
```
GET /products/status/{status}
```

Statuts valides: `best_seller`, `new`, `on_sale`

```dart
Future<Map<String, dynamic>> getProductsByStatus(String status, {int page = 1}) async {
  final url = Uri.parse(
    'https://commandesansfrontiere.com/api/products/status/$status?page=$page'
  );

  final response = await http.get(url);

  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Échec de récupération des produits par statut');
  }
}
```

---

## 5. Récupérer un Produit Spécifique

### Endpoint
```
GET /products/{product_id}
```

### Exemple de Requête Flutter
```dart
Future<Product> getProduct(int productId) async {
  final url = Uri.parse('https://commandesansfrontiere.com/api/products/$productId');

  final response = await http.get(url);

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return Product.fromJson(data['data']);
  } else {
    throw Exception('Produit non trouvé');
  }
}
```

---

## 6. Service API Complet pour Flutter

Voici un service complet que vous pouvez utiliser dans votre application Flutter:

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'https://commandesansfrontiere.com/api';

  // ==================== CATÉGORIES ====================

  /// Récupérer toutes les catégories
  Future<Map<String, dynamic>> getCategories({int perPage = 10, int page = 1}) async {
    final url = Uri.parse('$baseUrl/categories?per_page=$perPage&page=$page');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Échec de récupération des catégories');
    }
  }

  /// Récupérer seulement les catégories actives
  Future<List<Category>> getActiveCategories() async {
    final url = Uri.parse('$baseUrl/categories/active');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((category) => Category.fromJson(category))
          .toList();
    } else {
      throw Exception('Échec de récupération des catégories actives');
    }
  }

  // ==================== PRODUITS ====================

  /// Récupérer tous les produits avec filtres optionnels
  Future<Map<String, dynamic>> getProducts({
    int? categoryId,
    int? subcategoryId,
    String? search,
    double? minPrice,
    double? maxPrice,
    bool? inStock,
    String? statusFilter,
    String sortBy = 'created_at',
    String sortOrder = 'desc',
    int perPage = 15,
    int page = 1,
  }) async {
    Map<String, String> queryParams = {
      'per_page': perPage.toString(),
      'page': page.toString(),
      'sort_by': sortBy,
      'sort_order': sortOrder,
    };

    if (categoryId != null) queryParams['category_id'] = categoryId.toString();
    if (subcategoryId != null) queryParams['subcategory_id'] = subcategoryId.toString();
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (minPrice != null) queryParams['min_price'] = minPrice.toString();
    if (maxPrice != null) queryParams['max_price'] = maxPrice.toString();
    if (inStock != null) queryParams['in_stock'] = inStock.toString();
    if (statusFilter != null) queryParams['status_filter'] = statusFilter;

    final url = Uri.parse('$baseUrl/products').replace(queryParameters: queryParams);
    final response = await http.get(url);

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Échec de récupération des produits');
    }
  }

  /// Récupérer un produit spécifique
  Future<Product> getProduct(int productId) async {
    final url = Uri.parse('$baseUrl/products/$productId');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Product.fromJson(data['data']);
    } else {
      throw Exception('Produit non trouvé');
    }
  }

  /// Récupérer les produits à la une
  Future<List<Product>> getFeaturedProducts() async {
    final url = Uri.parse('$baseUrl/products/featured/list');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((product) => Product.fromJson(product))
          .toList();
    } else {
      throw Exception('Échec de récupération des produits à la une');
    }
  }

  /// Récupérer les best-sellers
  Future<List<Product>> getBestSellers() async {
    final url = Uri.parse('$baseUrl/products/best-sellers/list');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((product) => Product.fromJson(product))
          .toList();
    } else {
      throw Exception('Échec de récupération des best-sellers');
    }
  }

  /// Récupérer les nouveaux produits
  Future<List<Product>> getNewProducts() async {
    final url = Uri.parse('$baseUrl/products/new/list');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((product) => Product.fromJson(product))
          .toList();
    } else {
      throw Exception('Échec de récupération des nouveaux produits');
    }
  }

  /// Récupérer les produits en promotion
  Future<List<Product>> getOnSaleProducts() async {
    final url = Uri.parse('$baseUrl/products/on-sale/list');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((product) => Product.fromJson(product))
          .toList();
    } else {
      throw Exception('Échec de récupération des produits en promotion');
    }
  }

  /// Récupérer les produits par catégorie
  Future<Map<String, dynamic>> getProductsByCategory(
    int categoryId, {
    int page = 1,
    int perPage = 15,
  }) async {
    return getProducts(
      categoryId: categoryId,
      page: page,
      perPage: perPage,
    );
  }

  /// Récupérer les produits par sous-catégorie
  Future<Map<String, dynamic>> getProductsBySubcategory(
    int subcategoryId, {
    int page = 1,
    int perPage = 15,
  }) async {
    return getProducts(
      subcategoryId: subcategoryId,
      page: page,
      perPage: perPage,
    );
  }

  /// Rechercher des produits
  Future<Map<String, dynamic>> searchProducts(
    String searchTerm, {
    int? categoryId,
    int page = 1,
    int perPage = 15,
  }) async {
    return getProducts(
      search: searchTerm,
      categoryId: categoryId,
      page: page,
      perPage: perPage,
    );
  }
}
```

---

## 7. Gestion des Images

Toutes les images retournées par l'API sont des chemins relatifs. Pour afficher les images dans votre application Flutter, vous devez construire l'URL complète:

### URL de Base pour les Images
```
https://commandesansfrontiere.com/storage/
```

### Exemples

**Pour une image de catégorie:**
```
categories/electronics.jpg
→ https://commandesansfrontiere.com/storage/categories/electronics.jpg
```

**Pour une image de produit:**
```
products/iphone15-1.jpg
→ https://commandesansfrontiere.com/storage/products/iphone15-1.jpg
```

### Widget Flutter pour Afficher les Images
```dart
import 'package:cached_network_image/cached_network_image.dart';

Widget buildProductImage(String? imagePath) {
  if (imagePath == null) {
    return Icon(Icons.image_not_supported, size: 100, color: Colors.grey);
  }

  final fullUrl = 'https://commandesansfrontiere.com/storage/$imagePath';

  return CachedNetworkImage(
    imageUrl: fullUrl,
    placeholder: (context, url) => CircularProgressIndicator(),
    errorWidget: (context, url, error) => Icon(Icons.error),
    fit: BoxFit.cover,
  );
}
```

**Note:** Ajoutez la dépendance `cached_network_image` dans votre `pubspec.yaml` pour un meilleur cache des images.

---

## 8. Exemples de Cas d'Usage Complets

### Cas 1: Page d'Accueil avec Produits à la Une et Best-Sellers

```dart
class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final ApiService apiService = ApiService();
  List<Product> featuredProducts = [];
  List<Product> bestSellers = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    loadHomeData();
  }

  Future<void> loadHomeData() async {
    try {
      final featured = await apiService.getFeaturedProducts();
      final sellers = await apiService.getBestSellers();

      setState(() {
        featuredProducts = featured;
        bestSellers = sellers;
        isLoading = false;
      });
    } catch (e) {
      print('Erreur: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    return ListView(
      children: [
        // Section Produits à la Une
        _buildSection('Produits à la Une', featuredProducts),

        // Section Best-Sellers
        _buildSection('Best-Sellers', bestSellers),
      ],
    );
  }

  Widget _buildSection(String title, List<Product> products) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.all(16),
          child: Text(title, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        ),
        Container(
          height: 250,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: products.length,
            itemBuilder: (context, index) {
              return ProductCard(product: products[index]);
            },
          ),
        ),
      ],
    );
  }
}
```

---

### Cas 2: Page de Catégories avec Navigation vers les Produits

```dart
class CategoriesPage extends StatefulWidget {
  @override
  _CategoriesPageState createState() => _CategoriesPageState();
}

class _CategoriesPageState extends State<CategoriesPage> {
  final ApiService apiService = ApiService();
  List<Category> categories = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    loadCategories();
  }

  Future<void> loadCategories() async {
    try {
      final cats = await apiService.getActiveCategories();
      setState(() {
        categories = cats;
        isLoading = false;
      });
    } catch (e) {
      print('Erreur: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    return GridView.builder(
      padding: EdgeInsets.all(16),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: categories.length,
      itemBuilder: (context, index) {
        final category = categories[index];
        return GestureDetector(
          onTap: () {
            // Naviguer vers la page des produits de cette catégorie
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => CategoryProductsPage(category: category),
              ),
            );
          },
          child: Card(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                buildProductImage(category.image),
                SizedBox(height: 8),
                Text(category.name, style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        );
      },
    );
  }
}
```

---

### Cas 3: Page de Produits Filtrés par Catégorie

```dart
class CategoryProductsPage extends StatefulWidget {
  final Category category;

  CategoryProductsPage({required this.category});

  @override
  _CategoryProductsPageState createState() => _CategoryProductsPageState();
}

class _CategoryProductsPageState extends State<CategoryProductsPage> {
  final ApiService apiService = ApiService();
  List<Product> products = [];
  bool isLoading = true;
  int currentPage = 1;
  int totalPages = 1;

  @override
  void initState() {
    super.initState();
    loadProducts();
  }

  Future<void> loadProducts() async {
    try {
      final response = await apiService.getProductsByCategory(
        widget.category.id,
        page: currentPage,
      );

      setState(() {
        products = (response['data'] as List)
            .map((product) => Product.fromJson(product))
            .toList();
        totalPages = response['meta']['last_page'];
        isLoading = false;
      });
    } catch (e) {
      print('Erreur: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.category.name),
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Expanded(
                  child: GridView.builder(
                    padding: EdgeInsets.all(16),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.7,
                    ),
                    itemCount: products.length,
                    itemBuilder: (context, index) {
                      return ProductCard(product: products[index]);
                    },
                  ),
                ),
                // Pagination
                if (totalPages > 1)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        icon: Icon(Icons.arrow_back),
                        onPressed: currentPage > 1
                            ? () {
                                setState(() {
                                  currentPage--;
                                  isLoading = true;
                                });
                                loadProducts();
                              }
                            : null,
                      ),
                      Text('Page $currentPage / $totalPages'),
                      IconButton(
                        icon: Icon(Icons.arrow_forward),
                        onPressed: currentPage < totalPages
                            ? () {
                                setState(() {
                                  currentPage++;
                                  isLoading = true;
                                });
                                loadProducts();
                              }
                            : null,
                      ),
                    ],
                  ),
              ],
            ),
    );
  }
}
```

---

### Cas 4: Recherche de Produits avec Filtres

```dart
class SearchPage extends StatefulWidget {
  @override
  _SearchPageState createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final ApiService apiService = ApiService();
  final TextEditingController searchController = TextEditingController();

  List<Product> searchResults = [];
  List<Category> categories = [];
  int? selectedCategoryId;
  double? maxPrice;
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    loadCategories();
  }

  Future<void> loadCategories() async {
    final cats = await apiService.getActiveCategories();
    setState(() {
      categories = cats;
    });
  }

  Future<void> performSearch() async {
    if (searchController.text.isEmpty) return;

    setState(() {
      isLoading = true;
    });

    try {
      final response = await apiService.searchProducts(
        searchController.text,
        categoryId: selectedCategoryId,
      );

      setState(() {
        searchResults = (response['data'] as List)
            .map((product) => Product.fromJson(product))
            .toList();
        isLoading = false;
      });
    } catch (e) {
      print('Erreur: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Rechercher'),
      ),
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              children: [
                // Barre de recherche
                TextField(
                  controller: searchController,
                  decoration: InputDecoration(
                    hintText: 'Rechercher un produit...',
                    suffixIcon: IconButton(
                      icon: Icon(Icons.search),
                      onPressed: performSearch,
                    ),
                  ),
                  onSubmitted: (_) => performSearch(),
                ),
                SizedBox(height: 16),

                // Filtre par catégorie
                DropdownButton<int>(
                  value: selectedCategoryId,
                  hint: Text('Toutes les catégories'),
                  isExpanded: true,
                  items: categories.map((category) {
                    return DropdownMenuItem<int>(
                      value: category.id,
                      child: Text(category.name),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      selectedCategoryId = value;
                    });
                    performSearch();
                  },
                ),
              ],
            ),
          ),

          Expanded(
            child: isLoading
                ? Center(child: CircularProgressIndicator())
                : searchResults.isEmpty
                    ? Center(child: Text('Aucun résultat'))
                    : ListView.builder(
                        itemCount: searchResults.length,
                        itemBuilder: (context, index) {
                          return ProductListItem(product: searchResults[index]);
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
```

---

## 9. Gestion des Erreurs

### Codes d'État HTTP Courants

| Code | Signification | Action Recommandée |
|------|---------------|-------------------|
| 200 | Succès | Traiter les données |
| 400 | Mauvaise requête | Vérifier les paramètres |
| 404 | Non trouvé | Afficher message "Non trouvé" |
| 500 | Erreur serveur | Réessayer plus tard |

### Exemple de Gestion d'Erreurs

```dart
Future<Map<String, dynamic>> getProductsSafe({
  int? categoryId,
  int page = 1,
}) async {
  try {
    final response = await apiService.getProducts(
      categoryId: categoryId,
      page: page,
    );
    return response;
  } on SocketException {
    throw Exception('Pas de connexion Internet');
  } on HttpException {
    throw Exception('Erreur de serveur');
  } on FormatException {
    throw Exception('Réponse invalide');
  } catch (e) {
    throw Exception('Erreur inconnue: $e');
  }
}
```

---
