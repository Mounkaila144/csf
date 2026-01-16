<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckVendorApproval
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Si l'utilisateur n'est pas un vendeur, laisser passer
        if (!$user || $user->role !== 'vendor') {
            return $next($request);
        }

        // Vérifier le statut du vendeur
        if ($user->vendor_status === 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Your vendor account is pending approval. Please wait for admin approval.'
            ], 403);
        }

        if ($user->vendor_status === 'rejected') {
            return response()->json([
                'status' => 'error',
                'message' => 'Your vendor application has been rejected. Reason: ' . $user->rejection_reason
            ], 403);
        }

        if ($user->vendor_status === 'suspended') {
            return response()->json([
                'status' => 'error',
                'message' => 'Your vendor account has been suspended. Reason: ' . $user->rejection_reason
            ], 403);
        }

        // Si le vendeur est approuvé, laisser passer
        return $next($request);
    }
}
