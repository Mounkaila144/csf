<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPartnerApproval
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->role !== 'partner') {
            return $next($request);
        }

        $partner = $user->partner;

        if (!$partner) {
            return response()->json([
                'status' => 'error',
                'message' => 'Partner profile not found.'
            ], 403);
        }

        if ($partner->status === 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Your partner account is pending approval. Please wait for admin approval.'
            ], 403);
        }

        if ($partner->status === 'rejected') {
            return response()->json([
                'status' => 'error',
                'message' => 'Your partner application has been rejected. Reason: ' . $partner->rejection_reason
            ], 403);
        }

        if ($partner->status === 'suspended') {
            return response()->json([
                'status' => 'error',
                'message' => 'Your partner account has been suspended. Reason: ' . $partner->rejection_reason
            ], 403);
        }

        return $next($request);
    }
}
