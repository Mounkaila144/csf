<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);

        $query = Category::with('subcategories');

        // Si c'est un vendeur (route /api/vendor/categories), filtrer par vendor_id
        if (str_contains($request->getPathInfo(), '/vendor/')) {
            $query->where('vendor_id', auth()->id());
        }
        // Si c'est pour l'admin (route /api/admin/categories), on montre toutes les catégories
        elseif (str_contains($request->getPathInfo(), '/admin/')) {
            // Admin voit tout - pas de filtre
            if ($request->has('status')) {
                $query->where('is_active', $request->status === 'active');
            }
        } else {
            // Route publique - montrer seulement les actives
            $query->where('is_active', true);
        }

        $categories = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'message' => 'Categories retrieved successfully',
            'data' => $categories->items(),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
                'from' => $categories->firstItem(),
                'to' => $categories->lastItem()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $categoryData = $request->only(['name', 'description', 'is_active']);

        // Si c'est un vendeur, ajouter automatiquement vendor_id
        if (auth()->user()->isVendor()) {
            $categoryData['vendor_id'] = auth()->id();
        }

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('categories', 'public');
            $categoryData['image'] = $imagePath;
        }

        $category = Category::create($categoryData);

        return response()->json([
            'status' => 'success',
            'message' => 'Category created successfully',
            'data' => $category
        ], 201);
    }

    public function show(Category $category)
    {
        // Vérifier que le vendeur peut voir cette catégorie
        if (auth()->user()->isVendor() && $category->vendor_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view this category'
            ], 403);
        }

        $category->load(['subcategories', 'products']);

        return response()->json([
            'status' => 'success',
            'data' => $category
        ]);
    }

    public function update(Request $request, Category $category)
    {
        // Vérifier que le vendeur peut modifier cette catégorie
        if (auth()->user()->isVendor() && $category->vendor_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update this category'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $categoryData = $request->only(['name', 'description', 'is_active']);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            
            $imagePath = $request->file('image')->store('categories', 'public');
            $categoryData['image'] = $imagePath;
        }

        $category->update($categoryData);

        return response()->json([
            'status' => 'success',
            'message' => 'Category updated successfully',
            'data' => $category
        ]);
    }

    public function destroy(Category $category)
    {
        // Vérifier que le vendeur peut supprimer cette catégorie
        if (auth()->user()->isVendor() && $category->vendor_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to delete this category'
            ], 403);
        }

        // Delete image if exists
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Category deleted successfully'
        ]);
    }

    public function getActiveCategories(Request $request)
    {
        $query = Category::with(['subcategories' => function($query) {
            $query->where('is_active', true);
        }])->where('is_active', true);

        // Si c'est un vendeur, filtrer par vendor_id
        if (auth()->check() && auth()->user()->isVendor()) {
            $query->where('vendor_id', auth()->id());
        }

        $categories = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);
    }
}