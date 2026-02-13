<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PaymentCodeController extends Controller
{
    /**
     * Generate a payment code (Partner only)
     */
    public function generate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $partner = auth()->user()->partner;
        $order = Order::findOrFail($request->order_id);

        // Check order is not already paid
        if ($order->payment_status === 'paid') {
            return response()->json([
                'status' => 'error',
                'message' => 'This order is already paid'
            ], 400);
        }

        // Check no active code already exists for this order by this partner
        $existingCode = PaymentCode::where('order_id', $order->id)
            ->where('partner_id', $partner->id)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if ($existingCode) {
            return response()->json([
                'status' => 'error',
                'message' => 'An active payment code already exists for this order',
                'data' => $existingCode
            ], 400);
        }

        $code = PaymentCode::create([
            'code' => PaymentCode::generateUniqueCode(),
            'partner_id' => $partner->id,
            'order_id' => $order->id,
            'amount' => $order->total_amount,
            'status' => 'pending',
            'expires_at' => now()->addHours(48),
        ]);

        // Update order payment status
        $order->update(['payment_status' => 'pending_validation']);

        return response()->json([
            'status' => 'success',
            'message' => 'Payment code generated successfully',
            'data' => $code->load(['order.user', 'partner'])
        ], 201);
    }

    /**
     * Validate a payment code (Client only)
     */
    public function validate(Request $request, $orderId)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:14',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $order = Order::findOrFail($orderId);

        // Verify client owns this order
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not authorized to validate this order'
            ], 403);
        }

        // Check order is not already paid
        if ($order->payment_status === 'paid') {
            return response()->json([
                'status' => 'error',
                'message' => 'This order is already paid'
            ], 400);
        }

        $paymentCode = PaymentCode::where('code', $request->code)
            ->where('order_id', $order->id)
            ->where('status', 'pending')
            ->first();

        if (!$paymentCode) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid payment code'
            ], 400);
        }

        // Check expiration
        if ($paymentCode->isExpired()) {
            $paymentCode->update(['status' => 'expired']);
            return response()->json([
                'status' => 'error',
                'message' => 'This payment code has expired'
            ], 400);
        }

        // Verify amount matches
        if (abs($paymentCode->amount - $order->total_amount) > 0.01) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment code amount does not match order total'
            ], 400);
        }

        // Process payment in transaction
        DB::beginTransaction();
        try {
            $partner = $paymentCode->partner;
            $commission = $paymentCode->amount * ($partner->commission_rate / 100);

            // Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'partner_id' => $partner->id,
                'payment_code_id' => $paymentCode->id,
                'client_id' => auth()->id(),
                'amount' => $paymentCode->amount,
                'partner_commission' => $commission,
                'status' => 'completed',
            ]);

            // Update payment code
            $paymentCode->update([
                'status' => 'validated',
                'validated_at' => now(),
                'validated_by' => auth()->id(),
            ]);

            // Update order
            $order->update([
                'payment_status' => 'paid',
                'payment_id' => $payment->id,
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Payment validated successfully',
                'data' => [
                    'payment' => $payment->load(['partner', 'paymentCode']),
                    'order' => $order->fresh(['orderItems.product']),
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Payment validation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: list all payments
     */
    public function adminPayments(Request $request)
    {
        $query = Payment::with(['order.user', 'partner.user', 'paymentCode', 'client']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));

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
