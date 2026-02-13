<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use App\Models\Product;
use App\Models\Quote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuoteController extends Controller
{
    /**
     * Calculate delivery cost without creating a quote
     */
    public function calculate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'delivery_zone_id' => 'required|exists:delivery_zones,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $zone = DeliveryZone::findOrFail($request->delivery_zone_id);

        if (!$zone->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'This delivery zone is not available'
            ], 400);
        }

        $totalWeight = 0;
        $totalVolume = 0;
        $subtotal = 0;
        $itemDetails = [];

        foreach ($request->items as $item) {
            $product = Product::findOrFail($item['product_id']);
            $qty = $item['quantity'];

            $weight = ($product->weight_kg ?? 0) * $qty;
            $volume = $product->getVolumeM3() * $qty;

            $totalWeight += $weight;
            $totalVolume += $volume;
            $subtotal += $product->price * $qty;

            $itemDetails[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $qty,
                'unit_price' => $product->price,
                'weight_kg' => $weight,
                'volume_m3' => $volume,
            ];
        }

        // Check weight and volume limits
        if ($totalWeight > $zone->max_weight_kg) {
            return response()->json([
                'status' => 'error',
                'message' => "Total weight ({$totalWeight} kg) exceeds zone limit ({$zone->max_weight_kg} kg)"
            ], 400);
        }

        if ($totalVolume > $zone->max_volume_m3) {
            return response()->json([
                'status' => 'error',
                'message' => "Total volume ({$totalVolume} m3) exceeds zone limit ({$zone->max_volume_m3} m3)"
            ], 400);
        }

        $deliveryCost = $zone->calculateDeliveryCost($totalWeight, $totalVolume);
        $totalAmount = $subtotal + $deliveryCost;

        return response()->json([
            'status' => 'success',
            'data' => [
                'items' => $itemDetails,
                'subtotal_products' => round($subtotal, 2),
                'total_weight_kg' => round($totalWeight, 2),
                'total_volume_m3' => round($totalVolume, 4),
                'delivery_cost' => round($deliveryCost, 2),
                'total_amount' => round($totalAmount, 2),
                'delivery_zone' => $zone->load('city'),
            ]
        ]);
    }

    /**
     * Create a formal quote
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'delivery_zone_id' => 'required|exists:delivery_zones,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $zone = DeliveryZone::findOrFail($request->delivery_zone_id);

        $totalWeight = 0;
        $totalVolume = 0;
        $subtotal = 0;
        $itemDetails = [];

        foreach ($request->items as $item) {
            $product = Product::findOrFail($item['product_id']);
            $qty = $item['quantity'];

            $weight = ($product->weight_kg ?? 0) * $qty;
            $volume = $product->getVolumeM3() * $qty;

            $totalWeight += $weight;
            $totalVolume += $volume;
            $subtotal += $product->price * $qty;

            $itemDetails[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $qty,
                'unit_price' => $product->price,
                'weight_kg' => $weight,
                'volume_m3' => $volume,
            ];
        }

        $deliveryCost = $zone->calculateDeliveryCost($totalWeight, $totalVolume);
        $totalAmount = $subtotal + $deliveryCost;

        $quote = Quote::create([
            'reference' => Quote::generateReference(),
            'user_id' => auth()->check() ? auth()->id() : null,
            'delivery_zone_id' => $zone->id,
            'items' => $itemDetails,
            'subtotal_products' => $subtotal,
            'total_weight_kg' => $totalWeight,
            'total_volume_m3' => $totalVolume,
            'delivery_cost' => $deliveryCost,
            'total_amount' => $totalAmount,
            'status' => 'draft',
            'expires_at' => now()->addDays(7),
            'notes' => $request->notes,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Quote created successfully',
            'data' => $quote->load('deliveryZone.city')
        ], 201);
    }

    public function index(Request $request)
    {
        $query = Quote::with('deliveryZone.city');

        if (auth()->check() && !auth()->user()->isAdmin()) {
            $query->where('user_id', auth()->id());
        }

        $quotes = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $quotes->items(),
            'meta' => [
                'current_page' => $quotes->currentPage(),
                'last_page' => $quotes->lastPage(),
                'per_page' => $quotes->perPage(),
                'total' => $quotes->total(),
            ]
        ]);
    }

    public function show(Quote $quote)
    {
        // Check access
        if (auth()->check() && !auth()->user()->isAdmin() && $quote->user_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $quote->load('deliveryZone.city')
        ]);
    }

    public function accept(Quote $quote)
    {
        if ($quote->isExpired()) {
            return response()->json([
                'status' => 'error',
                'message' => 'This quote has expired'
            ], 400);
        }

        if ($quote->status !== 'draft' && $quote->status !== 'sent') {
            return response()->json([
                'status' => 'error',
                'message' => 'This quote cannot be accepted'
            ], 400);
        }

        $quote->update(['status' => 'accepted']);

        return response()->json([
            'status' => 'success',
            'message' => 'Quote accepted',
            'data' => $quote->load('deliveryZone.city')
        ]);
    }
}
