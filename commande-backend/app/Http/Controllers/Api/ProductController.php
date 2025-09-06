<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'subcategory']);
        
        // Si c'est pour l'admin (route /api/admin/products), on montre tous les produits
        // Si c'est pour le public (route /api/products), on filtre les actifs
        if (str_contains($request->getPathInfo(), '/admin/')) {
            // Route admin - montrer tous les produits
            if ($request->has('status')) {
                $query->where('is_active', $request->status === 'active');
            }
        } else {
            // Route publique - montrer seulement les actifs
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

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
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

        return response()->json([
            'status' => 'success',
            'message' => 'Products retrieved successfully',
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
            'status.*' => 'in:best_seller,new,on_sale'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $productData = $request->only(['name', 'description', 'price', 'stock', 'category_id', 'subcategory_id', 'is_active', 'images', 'status']);

        $product = Product::create($productData);
        $product->load(['category', 'subcategory']);

        return response()->json([
            'status' => 'success',
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

    public function show(Product $product)
    {
        $product->load(['category', 'subcategory']);

        return response()->json([
            'status' => 'success',
            'data' => $product
        ]);
    }

    public function update(Request $request, Product $product)
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
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $productData = $request->only(['name', 'description', 'price', 'stock', 'category_id', 'subcategory_id', 'is_active', 'images', 'status']);

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

    public function getFeaturedProducts()
    {
        $products = Product::with(['category', 'subcategory'])
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function getLowStockProducts()
    {
        $products = Product::with(['category', 'subcategory'])
            ->where('is_active', true)
            ->where('stock', '<=', 10)
            ->where('stock', '>', 0)
            ->orderBy('stock', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function getBestSellers()
    {
        $products = Product::with(['category', 'subcategory'])
            ->where('is_active', true)
            ->where('stock', '>=', 0)
            ->whereJsonContains('status', 'best_seller')
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function getNewProducts()
    {
        $products = Product::with(['category', 'subcategory'])
            ->where('is_active', true)
            ->where('stock', '>=', 0)
            ->whereJsonContains('status', 'new')
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function getOnSaleProducts()
    {
        $products = Product::with(['category', 'subcategory'])
            ->where('is_active', true)
            ->where('stock', '>=', 0)
            ->whereJsonContains('status', 'on_sale')
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function getProductsByStatus($status)
    {
        $allowedStatuses = ['best_seller', 'new', 'on_sale'];
        
        if (!in_array($status, $allowedStatuses)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid status. Allowed statuses: ' . implode(', ', $allowedStatuses)
            ], 400);
        }

        $products = Product::with(['category', 'subcategory'])
            ->where('is_active', true)
            ->where('stock', '>=', 0)
            ->whereJsonContains('status', $status)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

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
}