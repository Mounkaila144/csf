<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentCode;
use App\Models\Payment;
use Illuminate\Http\Request;

class PartnerDashboardController extends Controller
{
    public function dashboard()
    {
        $partner = auth()->user()->partner;

        $totalPayments = Payment::where('partner_id', $partner->id)->count();
        $totalCommission = Payment::where('partner_id', $partner->id)->sum('partner_commission');
        $pendingCodes = PaymentCode::where('partner_id', $partner->id)->where('status', 'pending')->count();
        $validatedCodes = PaymentCode::where('partner_id', $partner->id)->where('status', 'validated')->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'partner' => $partner->load(['city', 'neighborhood']),
                'stats' => [
                    'total_payments' => $totalPayments,
                    'total_commission' => $totalCommission,
                    'pending_codes' => $pendingCodes,
                    'validated_codes' => $validatedCodes,
                ]
            ]
        ]);
    }

    public function orders(Request $request)
    {
        // Partenaire voit les commandes non payees de sa ville
        $partner = auth()->user()->partner;

        $orders = Order::with(['user', 'orderItems.product'])
            ->where('payment_status', 'unpaid')
            ->whereHas('user', function ($q) use ($partner) {
                // On ne filtre pas par ville ici, le partenaire peut generer un code pour toute commande
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ]
        ]);
    }

    public function paymentCodes(Request $request)
    {
        $partner = auth()->user()->partner;

        $codes = PaymentCode::with(['order.user'])
            ->where('partner_id', $partner->id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $codes->items(),
            'meta' => [
                'current_page' => $codes->currentPage(),
                'last_page' => $codes->lastPage(),
                'per_page' => $codes->perPage(),
                'total' => $codes->total(),
            ]
        ]);
    }

    public function payments(Request $request)
    {
        $partner = auth()->user()->partner;

        $payments = Payment::with(['order', 'client', 'paymentCode'])
            ->where('partner_id', $partner->id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ]
        ]);
    }
}
