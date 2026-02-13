<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CityController extends Controller
{
    public function index(Request $request)
    {
        $query = City::withCount('neighborhoods');

        if ($request->has('active_only')) {
            $query->where('is_active', true);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $cities = $query->orderBy('name')->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $cities->items(),
            'meta' => [
                'current_page' => $cities->currentPage(),
                'last_page' => $cities->lastPage(),
                'per_page' => $cities->perPage(),
                'total' => $cities->total(),
            ]
        ]);
    }

    public function publicList()
    {
        $cities = City::where('is_active', true)->orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'data' => $cities
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:cities,code',
            'country' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $city = City::create($request->only(['name', 'code', 'country', 'is_active']));

        return response()->json([
            'status' => 'success',
            'message' => 'City created successfully',
            'data' => $city
        ], 201);
    }

    public function show(City $city)
    {
        $city->loadCount('neighborhoods');

        return response()->json([
            'status' => 'success',
            'data' => $city
        ]);
    }

    public function update(Request $request, City $city)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:cities,code,' . $city->id,
            'country' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $city->update($request->only(['name', 'code', 'country', 'is_active']));

        return response()->json([
            'status' => 'success',
            'message' => 'City updated successfully',
            'data' => $city
        ]);
    }

    public function destroy(City $city)
    {
        $city->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'City deleted successfully'
        ]);
    }
}
