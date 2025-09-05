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
        
        $query = Subcategory::with(['category', 'products'])
            ->where('is_active', true);
            
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
        $subcategory->load(['category', 'products']);

        return response()->json([
            'status' => 'success',
            'data' => $subcategory
        ]);
    }

    public function update(Request $request, Subcategory $subcategory)
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

    public function getByCategory($categoryId)
    {
        $category = Category::findOrFail($categoryId);
        $subcategories = $category->subcategories()->where('is_active', true)->get();

        return response()->json([
            'status' => 'success',
            'data' => $subcategories
        ]);
    }

    public function getActiveSubcategories()
    {
        $subcategories = Subcategory::with('category')
            ->where('is_active', true)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $subcategories
        ]);
    }
}