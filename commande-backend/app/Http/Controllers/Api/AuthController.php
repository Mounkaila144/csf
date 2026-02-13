<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        // SÉCURITÉ: Forcer tous les nouveaux utilisateurs à être "client"
        // Seul un admin existant peut créer un compte admin
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'client'
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'status' => 'success',
            'message' => 'User registered successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ],
            'token' => $token
        ], 201);
    }

    public function registerVendor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'shop_name' => 'required|string|max:255',
            'shop_description' => 'nullable|string|max:1000',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'vendor',
            'vendor_status' => 'pending',
            'shop_name' => $request->shop_name,
            'shop_description' => $request->shop_description,
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'status' => 'success',
            'message' => 'Vendor registration successful. Your account is pending approval.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'vendor_status' => $user->vendor_status,
                'shop_name' => $user->shop_name,
            ],
            'token' => $token
        ], 201);
    }

    public function registerPartner(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'business_name' => 'required|string|max:255',
            'business_phone' => 'required|string|max:20',
            'business_address' => 'required|string|max:500',
            'city_id' => 'required|exists:cities,id',
            'neighborhood_id' => 'required|exists:neighborhoods,id',
            'id_document' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'partner',
        ]);

        // Create partner profile
        $user->partner()->create([
            'business_name' => $request->business_name,
            'business_phone' => $request->business_phone,
            'business_address' => $request->business_address,
            'city_id' => $request->city_id,
            'neighborhood_id' => $request->neighborhood_id,
            'id_document' => $request->id_document,
            'status' => 'pending',
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'status' => 'success',
            'message' => 'Partner registration successful. Your account is pending approval.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $credentials = $request->only(['email', 'password']);

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = JWTAuth::user();

        // Informations de base pour tous les utilisateurs
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role
        ];

        // Ajouter les informations vendeur si applicable
        if ($user->isVendor()) {
            $userData['vendor_status'] = $user->vendor_status;
            $userData['shop_name'] = $user->shop_name;
            $userData['shop_description'] = $user->shop_description;
            $userData['shop_logo'] = $user->shop_logo;

            // Vérifier si le vendeur est suspendu
            if ($user->vendor_status === 'suspended') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Your vendor account has been suspended. Reason: ' . $user->rejection_reason,
                ], 403);
            }

            // Vérifier si le vendeur est rejeté
            if ($user->vendor_status === 'rejected') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Your vendor application has been rejected. Reason: ' . $user->rejection_reason,
                ], 403);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => $userData,
            'token' => $token
        ]);
    }

    public function me()
    {
        try {
            if (!$user = JWTAuth::parseToken()->authenticate()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid token'
            ], 401);
        }

        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role
        ];

        // Ajouter les informations vendeur si applicable
        if ($user->isVendor()) {
            $userData['vendor_status'] = $user->vendor_status;
            $userData['shop_name'] = $user->shop_name;
            $userData['shop_description'] = $user->shop_description;
            $userData['shop_logo'] = $user->shop_logo;
            $userData['phone'] = $user->phone;
            $userData['address'] = $user->address;
            $userData['approved_at'] = $user->approved_at;
            $userData['rejection_reason'] = $user->rejection_reason;
        }

        // Ajouter les informations partenaire si applicable
        if ($user->isPartner()) {
            $partner = $user->partner;
            if ($partner) {
                $userData['partner_status'] = $partner->status;
                $userData['business_name'] = $partner->business_name;
                $userData['business_phone'] = $partner->business_phone;
                $userData['city_id'] = $partner->city_id;
                $userData['neighborhood_id'] = $partner->neighborhood_id;
            }
        }

        return response()->json([
            'status' => 'success',
            'user' => $userData
        ]);
    }

    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            
            return response()->json([
                'status' => 'success',
                'message' => 'Logout successful'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to logout'
            ], 500);
        }
    }

    public function refresh()
    {
        try {
            $token = JWTAuth::refresh();
            
            return response()->json([
                'status' => 'success',
                'token' => $token
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Could not refresh token'
            ], 401);
        }
    }
}