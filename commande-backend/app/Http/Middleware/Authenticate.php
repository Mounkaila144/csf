<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // For API routes, don't redirect - return null to show JSON error
        if ($request->expectsJson() || $request->is('api/*')) {
            return null;
        }
        
        // For web routes, you would redirect to login page if it existed
        // Since you don't have a login route, return null for now
        return null;
    }
}
