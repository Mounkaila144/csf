# API Documentation - Authentication avec JWT

## Base URL
```
http://localhost:8000/api
```

## Authentication Endpoints

### 1. Register (Inscription)

**URL:** `POST /auth/register`

**Body:**
```json
{
    "name": "Nom utilisateur",
    "email": "user@example.com",
    "password": "motdepasse",
    "password_confirmation": "motdepasse",
    "role": "client" // optionnel, défaut: "client", valeurs possibles: "admin", "client"
}
```

**Response Success (201):**
```json
{
    "status": "success",
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "name": "Nom utilisateur",
        "email": "user@example.com",
        "role": "client"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 2. Login (Connexion)

**URL:** `POST /auth/login`

**Body:**
```json
{
    "email": "user@example.com",
    "password": "motdepasse"
}
```

**Response Success (200):**
```json
{
    "status": "success",
    "message": "Login successful",
    "user": {
        "id": 1,
        "name": "Nom utilisateur",
        "email": "user@example.com",
        "role": "client"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 3. Get User Info (Profil utilisateur)

**URL:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
    "status": "success",
    "user": {
        "id": 1,
        "name": "Nom utilisateur",
        "email": "user@example.com",
        "role": "client"
    }
}
```

### 4. Logout (Déconnexion)

**URL:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
    "status": "success",
    "message": "Logout successful"
}
```

### 5. Refresh Token

**URL:** `POST /auth/refresh`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
    "status": "success",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## Protected Routes Examples

### Admin Only Routes

**URL:** `GET /admin/dashboard`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response Success (200):**
```json
{
    "message": "Admin dashboard access granted"
}
```

### Client Only Routes

**URL:** `GET /client/profile`

**Headers:**
```
Authorization: Bearer {client_token}
```

**Response Success (200):**
```json
{
    "message": "Client profile access granted"
}
```

### Shared Routes (Admin & Client)

**URL:** `GET /shared/data`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
    "message": "Shared data access granted"
}
```

## Error Responses

### 400 - Validation Error
```json
{
    "status": "error",
    "message": "Validation failed",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password field is required."]
    }
}
```

### 401 - Unauthorized
```json
{
    "status": "error",
    "message": "Invalid credentials"
}
```

### 403 - Access Denied
```json
{
    "status": "error",
    "message": "Access denied. Insufficient permissions."
}
```

### 404 - User Not Found
```json
{
    "status": "error",
    "message": "User not found"
}
```

## Utilisation du middleware de rôles

Pour protéger vos routes par rôle, utilisez le middleware `role`:

```php
// Seulement pour les admins
Route::middleware(['auth:api', 'role:admin'])->group(function () {
    // Vos routes admin ici
});

// Seulement pour les clients
Route::middleware(['auth:api', 'role:client'])->group(function () {
    // Vos routes client ici
});

// Pour les deux rôles
Route::middleware(['auth:api', 'role:admin,client'])->group(function () {
    // Vos routes partagées ici
});
```

## Notes importantes

1. Tous les tokens JWT ont une durée de vie limitée
2. Utilisez `refresh` pour renouveler votre token
3. Les rôles supportés sont: `admin` et `client`
4. Par défaut, les nouveaux utilisateurs ont le rôle `client`
5. Seuls les admins peuvent créer d'autres utilisateurs avec le rôle `admin`