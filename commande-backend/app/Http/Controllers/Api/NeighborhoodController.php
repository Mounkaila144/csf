<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Neighborhood;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NeighborhoodController extends Controller
{
    public function index(Request $request)
    {
        $query = Neighborhood::with('city');

        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        if ($request->has('active_only')) {
            $query->where('is_active', true);
        }

        $neighborhoods = $query->orderBy('name')->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $neighborhoods->items(),
            'meta' => [
                'current_page' => $neighborhoods->currentPage(),
                'last_page' => $neighborhoods->lastPage(),
                'per_page' => $neighborhoods->perPage(),
                'total' => $neighborhoods->total(),
            ]
        ]);
    }

    public function byCity($cityId)
    {
        $neighborhoods = Neighborhood::where('city_id', $cityId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $neighborhoods
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'city_id' => 'required|exists:cities,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $neighborhood = Neighborhood::create($request->only(['name', 'city_id', 'is_active']));
        $neighborhood->load('city');

        return response()->json([
            'status' => 'success',
            'message' => 'Neighborhood created successfully',
            'data' => $neighborhood
        ], 201);
    }

    public function show(Neighborhood $neighborhood)
    {
        $neighborhood->load('city');

        return response()->json([
            'status' => 'success',
            'data' => $neighborhood
        ]);
    }

    public function update(Request $request, Neighborhood $neighborhood)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'city_id' => 'required|exists:cities,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $neighborhood->update($request->only(['name', 'city_id', 'is_active']));
        $neighborhood->load('city');

        return response()->json([
            'status' => 'success',
            'message' => 'Neighborhood updated successfully',
            'data' => $neighborhood
        ]);
    }

    public function destroy(Neighborhood $neighborhood)
    {
        $neighborhood->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Neighborhood deleted successfully'
        ]);
    }
}
