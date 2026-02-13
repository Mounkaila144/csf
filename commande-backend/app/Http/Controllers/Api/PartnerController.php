<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\Request;

class PartnerController extends Controller
{
    public function index(Request $request)
    {
        $query = Partner::with(['user', 'city', 'neighborhood']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', '%' . $search . '%')
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', '%' . $search . '%')
                         ->orWhere('email', 'like', '%' . $search . '%');
                  });
            });
        }

        $partners = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $partners->items(),
            'meta' => [
                'current_page' => $partners->currentPage(),
                'last_page' => $partners->lastPage(),
                'per_page' => $partners->perPage(),
                'total' => $partners->total(),
            ]
        ]);
    }

    public function show($id)
    {
        $partner = Partner::with(['user', 'city', 'neighborhood'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $partner
        ]);
    }

    public function approve($id)
    {
        $partner = Partner::findOrFail($id);
        $partner->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => auth()->id(),
            'rejection_reason' => null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Partner approved successfully',
            'data' => $partner->load(['user', 'city', 'neighborhood'])
        ]);
    }

    public function reject(Request $request, $id)
    {
        $partner = Partner::findOrFail($id);
        $partner->update([
            'status' => 'rejected',
            'rejection_reason' => $request->input('reason', 'No reason provided'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Partner rejected',
            'data' => $partner->load(['user', 'city', 'neighborhood'])
        ]);
    }

    public function suspend(Request $request, $id)
    {
        $partner = Partner::findOrFail($id);
        $partner->update([
            'status' => 'suspended',
            'rejection_reason' => $request->input('reason', 'No reason provided'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Partner suspended',
            'data' => $partner->load(['user', 'city', 'neighborhood'])
        ]);
    }

    public function reactivate($id)
    {
        $partner = Partner::findOrFail($id);
        $partner->update([
            'status' => 'approved',
            'rejection_reason' => null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Partner reactivated',
            'data' => $partner->load(['user', 'city', 'neighborhood'])
        ]);
    }

    public function statistics()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'total' => Partner::count(),
                'pending' => Partner::where('status', 'pending')->count(),
                'approved' => Partner::where('status', 'approved')->count(),
                'rejected' => Partner::where('status', 'rejected')->count(),
                'suspended' => Partner::where('status', 'suspended')->count(),
            ]
        ]);
    }
}
