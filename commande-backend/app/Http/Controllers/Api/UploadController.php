<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload an image file
     */
    public function uploadImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:512', // Max 512KB (les images doivent être compressées côté client)
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $image = $request->file('image');

            // SÉCURITÉ: Déterminer l'extension depuis le MIME type (plus sécurisé)
            $mimeToExtension = [
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp'
            ];

            $extension = $mimeToExtension[$image->getMimeType()] ?? 'jpg';

            // Generate unique filename
            $filename = time() . '_' . Str::random(10) . '.' . $extension;
            
            // Store in public/storage/images directory
            $path = $image->storeAs('images', $filename, 'public');
            
            // Generate full URL
            $url = Storage::url($path);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Image uploaded successfully',
                'data' => [
                    'url' => $url,
                    'path' => $path,
                    'filename' => $filename
                ]
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload multiple image files
     */
    public function uploadMultipleImages(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'images' => 'required|array|max:10', // Max 10 images
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:512', // Max 512KB per image (les images sont compressées côté client à 200KB)
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $uploadedImages = [];
            $images = $request->file('images');

            // SÉCURITÉ: Déterminer l'extension depuis le MIME type
            $mimeToExtension = [
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp'
            ];

            foreach ($images as $image) {
                $extension = $mimeToExtension[$image->getMimeType()] ?? 'jpg';

                // Generate unique filename
                $filename = time() . '_' . Str::random(10) . '.' . $extension;

                // Store in public/storage/images directory
                $path = $image->storeAs('images', $filename, 'public');

                // Generate full URL
                $url = Storage::url($path);

                $uploadedImages[] = [
                    'url' => $url,
                    'path' => $path,
                    'filename' => $filename
                ];
            }

            return response()->json([
                'status' => 'success',
                'message' => count($uploadedImages) . ' image(s) uploaded successfully',
                'data' => [
                    'urls' => array_column($uploadedImages, 'url'),
                    'images' => $uploadedImages
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload images: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an image file
     */
    public function deleteImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $path = $request->input('path');

            // SÉCURITÉ: Valider le chemin pour éviter path traversal
            // Le chemin doit commencer par "images/" et ne doit pas contenir ".."
            if (!str_starts_with($path, 'images/') || str_contains($path, '..')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid file path'
                ], 400);
            }

            // Normaliser le chemin pour éviter les tentatives d'évasion
            $normalizedPath = str_replace(['../', './', '\\'], '', $path);

            // Check if file exists and delete it
            if (Storage::disk('public')->exists($normalizedPath)) {
                Storage::disk('public')->delete($normalizedPath);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Image deleted successfully'
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Image not found'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete image: ' . $e->getMessage()
            ], 500);
        }
    }
}