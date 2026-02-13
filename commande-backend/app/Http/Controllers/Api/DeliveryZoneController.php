<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DeliveryZoneController extends Controller
{
    public function index(Request $request)
    {
        $query = DeliveryZone::with('city');

        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        if ($request->has('active_only')) {
            $query->where('is_active', true);
        }

        $zones = $query->orderBy('name')->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $zones->items(),
            'meta' => [
                'current_page' => $zones->currentPage(),
                'last_page' => $zones->lastPage(),
                'per_page' => $zones->perPage(),
                'total' => $zones->total(),
            ]
        ]);
    }

    public function publicList()
    {
        $zones = DeliveryZone::with('city')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $zones
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'city_id' => 'required|exists:cities,id',
            'base_price' => 'required|numeric|min:0',
            'price_per_kg' => 'required|numeric|min:0',
            'price_per_m3' => 'required|numeric|min:0',
            'max_weight_kg' => 'nullable|numeric|min:0',
            'max_volume_m3' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $zone = DeliveryZone::create($request->only([
            'name', 'city_id', 'base_price', 'price_per_kg', 'price_per_m3',
            'max_weight_kg', 'max_volume_m3', 'is_active'
        ]));
        $zone->load('city');

        return response()->json([
            'status' => 'success',
            'message' => 'Delivery zone created successfully',
            'data' => $zone
        ], 201);
    }

    public function show(DeliveryZone $deliveryZone)
    {
        $deliveryZone->load('city');

        return response()->json([
            'status' => 'success',
            'data' => $deliveryZone
        ]);
    }

    public function update(Request $request, DeliveryZone $deliveryZone)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'city_id' => 'required|exists:cities,id',
            'base_price' => 'required|numeric|min:0',
            'price_per_kg' => 'required|numeric|min:0',
            'price_per_m3' => 'required|numeric|min:0',
            'max_weight_kg' => 'nullable|numeric|min:0',
            'max_volume_m3' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $deliveryZone->update($request->only([
            'name', 'city_id', 'base_price', 'price_per_kg', 'price_per_m3',
            'max_weight_kg', 'max_volume_m3', 'is_active'
        ]));
        $deliveryZone->load('city');

        return response()->json([
            'status' => 'success',
            'message' => 'Delivery zone updated successfully',
            'data' => $deliveryZone
        ]);
    }

    public function destroy(DeliveryZone $deliveryZone)
    {
        $deliveryZone->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Delivery zone deleted successfully'
        ]);
    }
}
