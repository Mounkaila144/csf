<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SubcategoryController;
use App\Http\Controllers\Api\ProductController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    
    // Protected auth routes - use JWT middleware directly
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
});

// Protected routes examples
Route::middleware(['role:admin'])->group(function () {
    // Routes accessible only by admins
    Route::get('/admin/dashboard', function () {
        return response()->json(['message' => 'Admin dashboard access granted']);
    });
});

Route::middleware(['role:client'])->group(function () {
    // Routes accessible only by clients
    Route::get('/client/profile', function () {
        return response()->json(['message' => 'Client profile access granted']);
    });
});

Route::middleware(['role:admin,client'])->group(function () {
    // Routes accessible by both admins and clients
    Route::get('/shared/data', function () {
        return response()->json(['message' => 'Shared data access granted']);
    });
});

// Public routes (no authentication required)
Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/active', [CategoryController::class, 'getActiveCategories']);
Route::get('subcategories/active', [SubcategoryController::class, 'getActiveSubcategories']);
Route::get('subcategories/category/{categoryId}', [SubcategoryController::class, 'getByCategory']);
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{product}', [ProductController::class, 'show']);
Route::get('products/featured/list', [ProductController::class, 'getFeaturedProducts']);

// Admin only routes - use only role middleware which handles JWT auth internally
Route::middleware(['role:admin'])->prefix('admin')->group(function () {
    // Categories management
    Route::apiResource('categories', CategoryController::class);
    
    // Subcategories management
    Route::apiResource('subcategories', SubcategoryController::class);
    
    // Products management
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);
    Route::patch('products/{product}/stock', [ProductController::class, 'updateStock']);
    Route::get('products/low-stock/list', [ProductController::class, 'getLowStockProducts']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
