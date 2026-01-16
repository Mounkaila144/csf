# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a full-stack e-commerce application with a Next.js TypeScript frontend and Laravel backend:

### Frontend (Next.js + TypeScript)
- **Location**: `commande-frontend/` directory
- **Framework**: Next.js 15 with React 19 and TypeScript
- **Main App**: Uses App Router architecture with `app/` directory
- **Components**: `src/components/` - Modular UI components including admin interfaces
- **Services**: `src/services/adminService.ts` - API communication layer
- **Hooks**: `src/hooks/` - Custom React hooks for state management
- **Types**: `src/types/` - TypeScript type definitions
- **Styling**: TailwindCSS with custom blue theme colors
- **Path Aliases**: `@/` alias configured for `src/` directory

### Backend (Laravel)
- **Location**: `commande-backend/` directory
- **Framework**: Laravel 10 (PHP 8.1+)
- **Authentication**: JWT authentication using `tymon/jwt-auth` with role-based access
- **API Controllers**: `app/Http/Controllers/Api/` - REST API endpoints
- **Key Features**: Product management, category/subcategory hierarchy, file uploads
- **Asset Building**: Vite for Laravel frontend asset bundling

## Development Commands

### Frontend Development
```bash
cd commande-frontend

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Backend Development
```bash
cd commande-backend

# Start Laravel development server
php artisan serve

# Run database migrations
php artisan migrate

# Fresh migration with seeders
php artisan migrate:fresh --seed

# Run tests
php artisan test
# or
./vendor/bin/phpunit

# Code formatting (Laravel Pint)
./vendor/bin/pint

# Cache commands
php artisan cache:clear
php artisan config:clear

# Asset building
npm run dev
npm run build
```

## Key Architectural Patterns

### Authentication & Authorization
- JWT-based authentication with role-based access control
- Three main roles: `admin`, `vendor`, and `client`
- Protected routes using middleware: `auth:api` and `role:admin,vendor,client`
- Vendor approval system with statuses: `pending`, `approved`, `rejected`, `suspended`
- Vendors must be approved to access vendor routes (middleware: `vendor.approved`)
- Token refresh mechanism implemented
- **Important**: Admin routes use `/api/admin/*` prefix, vendor routes use `/api/vendor/*` prefix

### Frontend Service Pattern
- Shared components between admin and vendor interfaces use dynamic service selection
- Components accept optional `useVendorService` prop (default: false)
- Pattern: `const service = useVendorService ? vendorService : adminService`
- Examples: `SubcategoriesModal`, `ProductForm`
- Ensures proper API routes are used based on user role
- Maintains backward compatibility with admin interfaces

### API Structure
- RESTful API design with consistent JSON responses
- Base URL: `http://localhost:8000/api`
- Controllers: AuthController, ProductController, CategoryController, SubcategoryController, UploadController
- File upload handling for product and category images

### Frontend Architecture
- Next.js App Router with nested layouts
- Admin panel at `/admin` with protected routes
  - Dashboard, Categories, Products, **Vendors**, Orders
  - Vendor management: approve, reject, suspend, reactivate vendors
- Vendor panel at `/vendor` with protected routes (requires approved status)
- Component-based architecture with TypeScript
- Service layer for API communication (`adminService.ts`, `vendorService.ts`)
- Custom hooks for state management
- TailwindCSS for styling with custom color scheme

### Data Management
- Products organized in category/subcategory hierarchy
- Image upload and management system
- Pagination support for large datasets
- CRUD operations for all entities

## URLs and Endpoints

### Default Development URLs
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

### Key API Endpoints
- Authentication: `/api/auth/*`
- Public Products: `/api/products/*` (no auth required)
- Public Categories: `/api/categories/*` (no auth required)
- Public Subcategories: `/api/subcategories/*` (no auth required)
- Admin Routes: `/api/admin/*` (requires `role:admin`)
- Vendor Routes: `/api/vendor/*` (requires `role:vendor` + `vendor_status:approved`)
- File uploads: `/api/upload/*` (admin or approved vendors)
- Orders: `/api/orders/*` (admin or clients)
- Currency: `/api/currency/*` (public)

## File Structure Highlights
- Frontend admin components: `src/components/admin/`
- Backend API controllers: `app/Http/Controllers/Api/`
- Routes: `commande-backend/routes/api.php`
- Comprehensive API documentation: `commande-backend/API_DOCUMENTATION.md` and `CRUD_DOCUMENTATION.md`

## Testing
- Backend: PHPUnit with Laravel testing suite
- Test configuration: `phpunit.xml`
- Test location: `tests/` directory