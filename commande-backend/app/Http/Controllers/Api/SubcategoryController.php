<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subcategory;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SubcategoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $categoryId = $request->get('category_id');

        $query = Subcategory::with(['category', 'products']);

        // Si c'est un vendeur (route /api/vendor/subcategories), filtrer par vendor_id
        if (str_contains($request->getPathInfo(), '/vendor/')) {
            $query->where('vendor_id', auth()->id());
        }
        // Si c'est pour l'admin (route /api/admin/subcategories), on montre toutes les sous-catégories
        elseif (str_contains($request->getPathInfo(), '/admin/')) {
            // Admin voit tout - pas de filtre
            if ($request->has('status')) {
                $query->where('is_active', $request->status === 'active');
            }
        } else {
            // Route publique - montrer seulement les actives
            $query->where('is_active', true);
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        $subcategories = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'message' => 'Subcategories retrieved successfully',
            'data' => $subcategories->items(),
            'meta' => [
                'current_page' => $subcategories->currentPage(),
                'last_page' => $subcategories->lastPage(),
                'per_page' => $subcategories->perPage(),
                'total' => $subcategories->total(),
                'from' => $subcategories->firstItem(),
                'to' => $subcategories->lastItem()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
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

        $subcategoryData = $request->only(['name', 'description', 'category_id', 'is_active']);

        // Si c'est un vendeur, vérifier que la catégorie parent lui appartient et ajouter vendor_id
        if (auth()->user()->isVendor()) {
            $category = Category::find($request->category_id);

            // Vérifier que la catégorie existe et appartient au vendeur
            if (!$category || ($category->vendor_id && $category->vendor_id !== auth()->id())) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Vous ne pouvez créer une sous-catégorie que pour vos propres catégories'
                ], 403);
            }

            $subcategoryData['vendor_id'] = auth()->id();
        }

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('subcategories', 'public');
            $subcategoryData['image'] = $imagePath;
        }

        $subcategory = Subcategory::create($subcategoryData);
        $subcategory->load('category');

        return response()->json([
            'status' => 'success',
            'message' => 'Subcategory created successfully',
            'data' => $subcategory
        ], 201);
    }

    public function show(Subcategory $subcategory)
    {
        // Vérifier que le vendeur peut voir cette sous-catégorie
        if (auth()->user()->isVendor() && $subcategory->vendor_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view this subcategory'
            ], 403);
        }

        $subcategory->load(['category', 'products']);

        return response()->json([
            'status' => 'success',
            'data' => $subcategory
        ]);
    }

    public function update(Request $request, Subcategory $subcategory)
    {
        // Vérifier que le vendeur peut modifier cette sous-catégorie
        if (auth()->user()->isVendor() && $subcategory->vendor_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update this subcategory'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
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

        $subcategoryData = $request->only(['name', 'description', 'category_id', 'is_active']);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($subcategory->image) {
                Storage::disk('public')->delete($subcategory->image);
            }
            
            $imagePath = $request->file('image')->store('subcategories', 'public');
            $subcategoryData['image'] = $imagePath;
        }

        $subcategory->update($subcategoryData);
        $subcategory->load('category');

        return response()->json([
            'status' => 'success',
            'message' => 'Subcategory updated successfully',
            'data' => $subcategory
        ]);
    }

    public function destroy(Subcategory $subcategory)
    {
        // Vérifier que le vendeur peut supprimer cette sous-catégorie
        if (auth()->user()->isVendor() && $subcategory->vendor_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to delete this subcategory'
            ], 403);
        }

        // Delete image if exists
        if ($subcategory->image) {
            Storage::disk('public')->delete($subcategory->image);
        }

        $subcategory->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Subcategory deleted successfully'
        ]);
    }

    public function getByCategory(Request $request, $categoryId)
    {
        $category = Category::findOrFail($categoryId);
        $query = $category->subcategories()->where('is_active', true);

        // Si c'est un vendeur, filtrer par vendor_id
        if (auth()->check() && auth()->user()->isVendor()) {
            $query->where('vendor_id', auth()->id());
        }

        $subcategories = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $subcategories
        ]);
    }

    public function getActiveSubcategories(Request $request)
    {
        $query = Subcategory::with('category')
            ->where('is_active', true);

        // Si c'est un vendeur, filtrer par vendor_id
        if (auth()->check() && auth()->user()->isVendor()) {
            $query->where('vendor_id', auth()->id());
        }

        $subcategories = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $subcategories
        ]);
    }
}