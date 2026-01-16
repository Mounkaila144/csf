<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VendorController extends Controller
{
    /**
     * Liste tous les vendeurs (admin seulement)
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'vendor');

        // Filtrer par statut
        if ($request->has('status')) {
            $query->where('vendor_status', $request->status);
        }

        // Recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('shop_name', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->input('per_page', 10);
        $vendors = $query->with('approvedBy:id,name,email')
            ->withCount(['products', 'categories'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'message' => 'Vendors retrieved successfully',
            'data' => $vendors->items(),
            'meta' => [
                'current_page' => $vendors->currentPage(),
                'last_page' => $vendors->lastPage(),
                'per_page' => $vendors->perPage(),
                'total' => $vendors->total(),
                'from' => $vendors->firstItem(),
                'to' => $vendors->lastItem(),
            ]
        ], 200);
    }

    /**
     * Afficher un vendeur spécifique
     */
    public function show($id)
    {
        $vendor = User::where('role', 'vendor')
            ->with(['approvedBy:id,name,email', 'products', 'categories'])
            ->withCount(['products', 'categories'])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'message' => 'Vendor retrieved successfully',
            'data' => $vendor
        ], 200);
    }

    /**
     * Approuver un vendeur
     */
    public function approve(Request $request, $id)
    {
        $vendor = User::where('role', 'vendor')->findOrFail($id);

        if ($vendor->vendor_status === 'approved') {
            return response()->json([
                'status' => 'error',
                'message' => 'Vendor is already approved'
            ], 400);
        }

        $vendor->update([
            'vendor_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => auth()->id(),
            'rejection_reason' => null
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Vendor approved successfully',
            'data' => $vendor->fresh(['approvedBy:id,name,email'])
        ], 200);
    }

    /**
     * Rejeter un vendeur
     */
    public function reject(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $vendor = User::where('role', 'vendor')->findOrFail($id);

        $vendor->update([
            'vendor_status' => 'rejected',
            'approved_at' => null,
            'approved_by' => auth()->id(),
            'rejection_reason' => $request->reason
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Vendor rejected successfully',
            'data' => $vendor->fresh(['approvedBy:id,name,email'])
        ], 200);
    }

    /**
     * Suspendre un vendeur
     */
    public function suspend(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $vendor = User::where('role', 'vendor')->findOrFail($id);

        if ($vendor->vendor_status !== 'approved') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only approved vendors can be suspended'
            ], 400);
        }

        $vendor->update([
            'vendor_status' => 'suspended',
            'rejection_reason' => $request->reason
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Vendor suspended successfully',
            'data' => $vendor->fresh(['approvedBy:id,name,email'])
        ], 200);
    }

    /**
     * Réactiver un vendeur suspendu
     */
    public function reactivate($id)
    {
        $vendor = User::where('role', 'vendor')->findOrFail($id);

        if ($vendor->vendor_status !== 'suspended') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only suspended vendors can be reactivated'
            ], 400);
        }

        $vendor->update([
            'vendor_status' => 'approved',
            'rejection_reason' => null
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Vendor reactivated successfully',
            'data' => $vendor->fresh(['approvedBy:id,name,email'])
        ], 200);
    }

    /**
     * Supprimer un vendeur
     */
    public function destroy($id)
    {
        $vendor = User::where('role', 'vendor')->findOrFail($id);

        // Supprimer le logo si existant
        if ($vendor->shop_logo) {
            \Storage::disk('public')->delete($vendor->shop_logo);
        }

        $vendor->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Vendor deleted successfully'
        ], 200);
    }

    /**
     * Statistiques des vendeurs (pour dashboard admin)
     */
    public function statistics()
    {
        $stats = [
            'total' => User::where('role', 'vendor')->count(),
            'pending' => User::where('role', 'vendor')->where('vendor_status', 'pending')->count(),
            'approved' => User::where('role', 'vendor')->where('vendor_status', 'approved')->count(),
            'rejected' => User::where('role', 'vendor')->where('vendor_status', 'rejected')->count(),
            'suspended' => User::where('role', 'vendor')->where('vendor_status', 'suspended')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'message' => 'Statistics retrieved successfully',
            'data' => $stats
        ], 200);
    }
}
