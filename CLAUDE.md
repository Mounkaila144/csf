# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a full-stack e-commerce application with a React/TypeScript frontend and Laravel backend:

### Frontend (React + TypeScript + Vite)
- **Main App**: `src/App.tsx` - Main application component with state management for cart, favorites, search, and filtering
- **Components**: `src/components/` - Modular UI components (Header, ProductGrid, CategoryMenu, etc.)
- **Data Layer**: `src/data/mockData.ts` - Mock data for products, categories, and banners
- **Hooks**: `src/hooks/` - Custom React hooks for cart (`useCart`) and favorites (`useFavorites`) functionality
- **Types**: `src/types/` - TypeScript type definitions
- **Styling**: TailwindCSS with PostCSS processing

### Backend (Laravel)
- **Location**: `commande-backend/` directory
- **Framework**: Laravel 10 (PHP 8.1+)
- **Standard Laravel structure**: app/, config/, database/, routes/, tests/
- **Frontend Assets**: Uses Vite for asset bundling (Laravel Vite plugin)

## Development Commands

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Backend Development
```bash
# Navigate to backend directory first
cd commande-backend

# Start Laravel development server
php artisan serve

# Run database migrations
php artisan migrate

# Build frontend assets
npm run dev
npm run build

# Run tests
php artisan test
# or
./vendor/bin/phpunit

# Code formatting (Laravel Pint)
./vendor/bin/pint
```

## Key Architectural Patterns

### Frontend State Management
- React hooks for local state (`useState`)
- Custom hooks (`useCart`, `useFavorites`) for shared application state
- Props drilling for component communication
- Local storage integration for cart/favorites persistence

### Component Structure
- Functional components with TypeScript
- Lucide React icons for UI elements
- Responsive design with TailwindCSS
- Component-based architecture with clear separation of concerns

### Backend Structure
- Standard Laravel MVC architecture
- Sanctum for API authentication
- Eloquent ORM for database operations
- RESTful API endpoints for frontend communication

## Data Flow
- Frontend fetches data from Laravel API endpoints
- Mock data currently used in frontend (`src/data/mockData.ts`)
- Cart and favorites managed in frontend with localStorage persistence
- Product filtering and search handled client-side

## Testing
- Backend: PHPUnit for Laravel testing
- Frontend: No test framework currently configured