<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SubcategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CurrencyController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\NeighborhoodController;
use App\Http\Controllers\Api\PartnerController;
use App\Http\Controllers\Api\PartnerDashboardController;
use App\Http\Controllers\Api\PaymentCodeController;
use App\Http\Controllers\Api\DeliveryZoneController;
use App\Http\Controllers\Api\QuoteController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('register/vendor', [AuthController::class, 'registerVendor']);
    Route::post('register/partner', [AuthController::class, 'registerPartner']);
    Route::post('login', [AuthController::class, 'login']);

    // Protected auth routes - use JWT middleware directly
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
});

// Protected routes examples
Route::middleware(['role:admin'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return response()->json(['message' => 'Admin dashboard access granted']);
    });
});

Route::middleware(['role:client'])->group(function () {
    Route::get('/client/profile', function () {
        return response()->json(['message' => 'Client profile access granted']);
    });
});

Route::middleware(['role:admin,client'])->group(function () {
    Route::get('/shared/data', function () {
        return response()->json(['message' => 'Shared data access granted']);
    });

    // Orders management
    Route::apiResource('orders', OrderController::class);

    // Payment validation (client validates code on their order)
    Route::post('orders/{id}/validate-payment', [PaymentCodeController::class, 'validate']);
});

// Public routes (no authentication required)
Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/active', [CategoryController::class, 'getActiveCategories']);
Route::get('subcategories/active', [SubcategoryController::class, 'getActiveSubcategories']);
Route::get('subcategories/category/{categoryId}', [SubcategoryController::class, 'getByCategory']);
Route::get('products', [ProductController::class, 'index']);
Route::get('products/search', [ProductController::class, 'advancedSearch']);
Route::get('products/{product}', [ProductController::class, 'show']);
Route::get('products/featured/list', [ProductController::class, 'getFeaturedProducts']);
Route::get('products/best-sellers/list', [ProductController::class, 'getBestSellers']);
Route::get('products/new/list', [ProductController::class, 'getNewProducts']);
Route::get('products/on-sale/list', [ProductController::class, 'getOnSaleProducts']);
Route::get('products/status/{status}', [ProductController::class, 'getProductsByStatus']);

// Currency conversion routes (public)
Route::prefix('currency')->group(function () {
    Route::get('rate', [CurrencyController::class, 'getExchangeRate']);
    Route::post('convert', [CurrencyController::class, 'convert']);
    Route::post('price-info', [CurrencyController::class, 'getPriceInfo']);
});

// Public cities and neighborhoods
Route::get('cities', [CityController::class, 'publicList']);
Route::get('cities/{city}/neighborhoods', [NeighborhoodController::class, 'byCity']);

// Public delivery zones and quote calculation
Route::get('delivery-zones', [DeliveryZoneController::class, 'publicList']);
Route::post('quotes/calculate', [QuoteController::class, 'calculate']);
Route::post('quotes', [QuoteController::class, 'store']);

// Admin only routes
Route::middleware(['role:admin'])->prefix('admin')->group(function () {
    // Categories management
    Route::apiResource('categories', CategoryController::class);

    // Subcategories management
    Route::apiResource('subcategories', SubcategoryController::class);

    // Products management
    Route::apiResource('products', ProductController::class);
    Route::patch('products/{product}/stock', [ProductController::class, 'updateStock']);
    Route::get('products/low-stock/list', [ProductController::class, 'getLowStockProducts']);

    // Vendor management
    Route::prefix('vendors')->group(function () {
        Route::get('/', [VendorController::class, 'index']);
        Route::get('/statistics', [VendorController::class, 'statistics']);
        Route::get('/{id}', [VendorController::class, 'show']);
        Route::post('/{id}/approve', [VendorController::class, 'approve']);
        Route::post('/{id}/reject', [VendorController::class, 'reject']);
        Route::post('/{id}/suspend', [VendorController::class, 'suspend']);
        Route::post('/{id}/reactivate', [VendorController::class, 'reactivate']);
        Route::delete('/{id}', [VendorController::class, 'destroy']);
    });

    // Cities management
    Route::apiResource('cities', CityController::class);

    // Neighborhoods management
    Route::apiResource('neighborhoods', NeighborhoodController::class);

    // Partners management
    Route::prefix('partners')->group(function () {
        Route::get('/', [PartnerController::class, 'index']);
        Route::get('/statistics', [PartnerController::class, 'statistics']);
        Route::get('/{id}', [PartnerController::class, 'show']);
        Route::post('/{id}/approve', [PartnerController::class, 'approve']);
        Route::post('/{id}/reject', [PartnerController::class, 'reject']);
        Route::post('/{id}/suspend', [PartnerController::class, 'suspend']);
        Route::post('/{id}/reactivate', [PartnerController::class, 'reactivate']);
    });

    // Payments management
    Route::get('payments', [PaymentCodeController::class, 'adminPayments']);

    // Delivery zones management
    Route::apiResource('delivery-zones', DeliveryZoneController::class);

    // Quotes management
    Route::get('quotes', [QuoteController::class, 'index']);
    Route::get('quotes/{quote}', [QuoteController::class, 'show']);
});

// Vendor routes - Requires vendor role AND approved status
Route::middleware(['role:vendor', 'vendor.approved'])->prefix('vendor')->group(function () {
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('subcategories', SubcategoryController::class);
    Route::apiResource('products', ProductController::class);
    Route::patch('products/{product}/stock', [ProductController::class, 'updateStock']);
    Route::get('products/low-stock/list', [ProductController::class, 'getLowStockProducts']);
});

// Partner routes - Requires partner role AND approved status
Route::middleware(['role:partner', 'partner.approved'])->prefix('partner')->group(function () {
    Route::get('dashboard', [PartnerDashboardController::class, 'dashboard']);
    Route::get('orders', [PartnerDashboardController::class, 'orders']);
    Route::post('payment-codes/generate', [PaymentCodeController::class, 'generate']);
    Route::get('payment-codes', [PartnerDashboardController::class, 'paymentCodes']);
    Route::get('payments', [PartnerDashboardController::class, 'payments']);
});

// Upload routes (admin and approved vendors)
Route::middleware(['role:admin,vendor', 'vendor.approved'])->group(function () {
    Route::post('upload/image', [UploadController::class, 'uploadImage']);
    Route::post('upload/images', [UploadController::class, 'uploadMultipleImages']);
    Route::delete('upload/image', [UploadController::class, 'deleteImage']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
