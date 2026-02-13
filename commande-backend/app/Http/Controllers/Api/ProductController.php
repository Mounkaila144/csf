<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\CurrencyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    protected $currencyService;

    public function __construct(CurrencyService $currencyService)
    {
        $this->currencyService = $currencyService;
    }

    /**
     * Enrichir un produit avec les informations de prix multi-devises
     */
    private function enrichProductWithCurrency($product, $hideSupplier = false)
    {
        if (is_array($product)) {
            $product = (object) $product;
        }

        $priceInfo = $this->currencyService->getPriceInfo($product->price);

        $enriched = $product->toArray();
        $enriched['price_info'] = $priceInfo;

        // Garder le prix original pour la compatibilité
        $enriched['price_rmb'] = $product->price;
        $enriched['price_xof'] = $priceInfo['xof']['amount'];

        // Cacher les champs fournisseur pour les routes non-admin
        if ($hideSupplier) {
            unset($enriched['supplier_company'], $enriched['supplier_phone'], $enriched['supplier_address']);
        }

        return $enriched;
    }

    /**
     * Enrichir une collection de produits
     */
    private function enrichProductsWithCurrency($products, $hideSupplier = false)
    {
        return array_map(function($product) use ($hideSupplier) {
            return $this->enrichProductWithCurrency($product, $hideSupplier);
        }, $products);
    }

    public function index(Request $request)
    {
        $query = Product::with(['category', 'subcategory']);

        // Si c'est un vendeur (route /api/vendor/products), filtrer par vendor_id
        if (str_contains($request->getPathInfo(), '/vendor/')) {
            $query->where('vendor_id', auth()->id());
        }
        // Si c'est pour l'admin (route /api/admin/products), on montre tous les produits
        // Si c'est pour le public (route /api/products), on filtre les actifs
        elseif (str_contains($request->getPathInfo(), '/admin/')) {
            // Route admin - montrer tous les produits (admin voit tout)
            if ($request->has('status')) {
                $query->where('is_active', $request->status === 'active');
            }
        } else {
            // Route publique - montrer seulement les actifs (tous vendeurs confondus)
            $query->where('is_active', true);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by subcategory
        if ($request->has('subcategory_id')) {
            $query->where('subcategory_id', $request->subcategory_id);
        }

        // Advanced search - recherche dans nom, description, catégorie et sous-catégorie
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                // Recherche dans le nom du produit
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  // Recherche dans la description du produit
                  ->orWhere('description', 'like', '%' . $searchTerm . '%')
                  // Recherche dans le nom de la catégorie
                  ->orWhereHas('category', function ($categoryQuery) use ($searchTerm) {
                      $categoryQuery->where('name', 'like', '%' . $searchTerm . '%');
                  })
                  // Recherche dans le nom de la sous-catégorie
                  ->orWhereHas('subcategory', function ($subcategoryQuery) use ($searchTerm) {
                      $subcategoryQuery->where('name', 'like', '%' . $searchTerm . '%');
                  });
            });
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by stock availability
        if ($request->has('in_stock') && $request->in_stock) {
            $query->where('stock', '>', 0);
        }

        // Filter by status
        if ($request->has('status_filter')) {
            $statusFilter = $request->status_filter;
            $query->whereJsonContains('status', $statusFilter);
        }

        // Sort products
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $products = $query->paginate($request->get('per_page', 15));

        // Cacher les champs fournisseur pour les routes non-admin
        $hideSupplier = !str_contains($request->getPathInfo(), '/admin/');

        // Enrichir les produits avec les informations de devise
        $enrichedProducts = $this->enrichProductsWithCurrency($products->items(), $hideSupplier);

        return response()->json([
            'status' => 'success',
            'message' => 'Products retrieved successfully',
            'data' => $enrichedProducts,
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem()
            ],
            'exchange_rate' => $this->currencyService->getExchangeRate()
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'is_active' => 'boolean',
            'status' => 'nullable|array',
            'status.*' => 'in:best_seller,new,on_sale',
            'supplier_company' => 'nullable|string|max:255',
            'supplier_phone' => 'nullable|string|max:50',
            'supplier_address' => 'nullable|string|max:500',
            'weight_kg' => 'nullable|numeric|min:0',
            'length_cm' => 'nullable|numeric|min:0',
            'width_cm' => 'nullable|numeric|min:0',
            'height_cm' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $productData = $request->only(['name', 'description', 'price', 'stock', 'category_id', 'subcategory_id', 'is_active', 'images', 'status', 'supplier_company', 'supplier_phone', 'supplier_address', 'weight_kg', 'length_cm', 'width_cm', 'height_cm']);

        // Si c'est un vendeur, ajouter automatiquement vendor_id
        if (auth()->user()->isVendor()) {
            $productData['vendor_id'] = auth()->id();
        }

        $product = Product::create($productData);
        $product->load(['category', 'subcategory']);

        return response()->json([
            'status' => 'success',
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

    public function show(Request $request, Product $product)
    {
        // Vérifier que le vendeur peut voir ce produit
        if (auth()->check() && auth()->user()->isVendor() && $product->vendor_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view this product'
            ], 403);
        }

        $product->load(['category', 'subcategory']);

        // Cacher les champs fournisseur pour les routes non-admin
        if (!str_contains($request->getPathInfo(), '/admin/')) {
            $product->makeHidden(['supplier_company', 'supplier_phone', 'supplier_address']);
        }

        return response()->json([
            'status' => 'success',
            'data' => $product
        ]);
    }

    public function update(Request $request, Product $product)
    {
        // Vérifier que le vendeur peut modifier ce produit
        if (auth()->user()->isVendor() && $product->vendor_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update this product'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'is_active' => 'boolean',
            'status' => 'nullable|array',
            'status.*' => 'in:best_seller,new,on_sale',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'string',
            'supplier_company' => 'nullable|string|max:255',
            'supplier_phone' => 'nullable|string|max:50',
            'supplier_address' => 'nullable|string|max:500',
            'weight_kg' => 'nullable|numeric|min:0',
            'length_cm' => 'nullable|numeric|min:0',
            'width_cm' => 'nullable|numeric|min:0',
            'height_cm' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $productData = $request->only(['name', 'description', 'price', 'stock', 'category_id', 'subcategory_id', 'is_active', 'images', 'status', 'supplier_company', 'supplier_phone', 'supplier_address', 'weight_kg', 'length_cm', 'width_cm', 'height_cm']);

        $product->update($productData);
        $product->load(['category', 'subcategory']);

        return response()->json([
            'status' => 'success',
            'message' => 'Product updated successfully',
            'data' => $product
        ]);
    }

    public function destroy(Product $product)
    {
        // Vérifier que le vendeur peut supprimer ce produit
        if (auth()->user()->isVendor() && $product->vendor_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to delete this product'
            ], 403);
        }

        // Delete all product images
        if ($product->images) {
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Product deleted successfully'
        ]);
    }

    public function updateStock(Request $request, Product $product)
    {
        // Vérifier que le vendeur peut modifier ce produit
        if (auth()->user()->isVendor() && $product->vendor_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update this product'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'stock' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $product->update(['stock' => $request->stock]);

        return response()->json([
            'status' => 'success',
            'message' => 'Stock updated successfully',
            'data' => $product
        ]);
    }

    public function getFeaturedProducts(Request $request)
    {
        $query = Product::with(['category', 'subcategory'])
            ->where('is_active', true)
            ->where('stock', '>', 0);

        // Si c'est un vendeur, filtrer par vendor_id
        if (auth()->check() && auth()->user()->isVendor()) {
            $query->where('vendor_id', auth()->id());
        }

        $products = $query->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function getLowStockProducts(Request $request)
    {
        $query = Product::with(['category', 'subcategory'])
            ->where('is_active', true)
            ->where('stock', '<=', 10)
            ->where('stock', '>', 0);

        // Si c'est un vendeur, filtrer par vendor_id
        if (auth()->check() && auth()->user()->isVendor()) {
            $query->where('vendor_id', auth()->id());
        }

        $products = $query->orderBy('stock', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function getBestSellers(Request $request)
    {
        $query = Product::with(['category', 'subcategory'])
            ->where('is_active', true)
            ->where('stock', '>=', 0)
            ->whereJsonContains('status', 'best_seller');

        // Si c'est un vendeur, filtrer par vendor_id
        if (auth()->check() && auth()->user()->isVendor()) {
            $query->where('vendor_id', auth()->id());
        }

        $products = $query->orderBy('created_at', 'desc')
            ->limit(12)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function getNewProducts(Request $request)
    {
        $query = Product::with(['category', 'subcategory'])
            ->where('is_active', true)
            ->where('stock', '>=', 0)
            ->whereJsonContains('status', 'new');

        // Si c'est un vendeur, filtrer par vendor_id
        if (auth()->check() && auth()->user()->isVendor()) {
            $query->where('vendor_id', auth()->id());
        }

        $products = $query->orderBy('created_at', 'desc')
            ->limit(12)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function getOnSaleProducts(Request $request)
    {
        $query = Product::with(['category', 'subcategory'])
            ->where('is_active', true)
            ->where('stock', '>=', 0)
            ->whereJsonContains('status', 'on_sale');

        // Si c'est un vendeur, filtrer par vendor_id
        if (auth()->check() && auth()->user()->isVendor()) {
            $query->where('vendor_id', auth()->id());
        }

        $products = $query->orderBy('created_at', 'desc')
            ->limit(12)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function getProductsByStatus(Request $request, $status)
    {
        $allowedStatuses = ['best_seller', 'new', 'on_sale'];

        if (!in_array($status, $allowedStatuses)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid status. Allowed statuses: ' . implode(', ', $allowedStatuses)
            ], 400);
        }

        $query = Product::with(['category', 'subcategory'])
            ->where('is_active', true)
            ->where('stock', '>=', 0)
            ->whereJsonContains('status', $status);

        // Si c'est un vendeur, filtrer par vendor_id
        if (auth()->check() && auth()->user()->isVendor()) {
            $query->where('vendor_id', auth()->id());
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem()
            ]
        ]);
    }

    /**
     * Recherche avancée de produits
     * Recherche dans: nom, description, catégorie, sous-catégorie
     */
    public function advancedSearch(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:2',
            'category_id' => 'nullable|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'in_stock' => 'nullable|boolean',
            'sort_by' => 'nullable|in:name,price,created_at,stock',
            'sort_order' => 'nullable|in:asc,desc',
            'per_page' => 'nullable|integer|min:1|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $searchQuery = $request->input('query');
        $query = Product::with(['category', 'subcategory'])
            ->where('is_active', true);

        // Recherche avancée dans plusieurs champs
        $query->where(function ($q) use ($searchQuery) {
            // Recherche dans le nom du produit (priorité haute)
            $q->where('name', 'like', '%' . $searchQuery . '%')
              // Recherche dans la description
              ->orWhere('description', 'like', '%' . $searchQuery . '%')
              // Recherche dans le nom de la catégorie
              ->orWhereHas('category', function ($categoryQuery) use ($searchQuery) {
                  $categoryQuery->where('name', 'like', '%' . $searchQuery . '%')
                                ->orWhere('description', 'like', '%' . $searchQuery . '%');
              })
              // Recherche dans le nom de la sous-catégorie
              ->orWhereHas('subcategory', function ($subcategoryQuery) use ($searchQuery) {
                  $subcategoryQuery->where('name', 'like', '%' . $searchQuery . '%')
                                   ->orWhere('description', 'like', '%' . $searchQuery . '%');
              });
        });

        // Filtres additionnels
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('subcategory_id')) {
            $query->where('subcategory_id', $request->subcategory_id);
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->has('in_stock') && $request->in_stock) {
            $query->where('stock', '>', 0);
        }

        // Tri des résultats
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Tri spécial pour la pertinence (produits avec nom correspondant en premier)
        if ($sortBy === 'name') {
            $query->orderByRaw("CASE WHEN name LIKE ? THEN 0 ELSE 1 END", ['%' . $searchQuery . '%']);
        }
        
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $products = $query->paginate($perPage);

        // Enrichir les produits avec les informations de devise
        $enrichedProducts = $this->enrichProductsWithCurrency($products->items());

        return response()->json([
            'status' => 'success',
            'message' => 'Search completed successfully',
            'query' => $searchQuery,
            'data' => $enrichedProducts,
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem()
            ],
            'exchange_rate' => $this->currencyService->getExchangeRate()
        ]);
    }
}