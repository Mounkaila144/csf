# Projet Commande

Application full-stack avec backend Laravel et frontend Next.js.

## 🏗️ Architecture

- **Backend** : Laravel (API REST)
- **Frontend** : Next.js avec TypeScript
- **Base de données** : MySQL/PostgreSQL

## 📁 Structure du projet

```
commande/
├── commande-backend/     # API Laravel
├── commande-frontend/    # Application Next.js
├── .gitignore           # Fichiers à ignorer par Git
└── README.md            # Ce fichier
```

## 🚀 Installation et démarrage

### Prérequis

- PHP >= 8.1
- Composer
- Node.js >= 18
- npm ou yarn

### Backend Laravel

```bash
cd commande-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Next.js

```bash
cd commande-frontend
npm install
npm run dev
```

## 📚 Documentation

- [Documentation API Backend](./commande-backend/API_DOCUMENTATION.md)
- [Documentation CRUD Backend](./commande-backend/CRUD_DOCUMENTATION.md)
- [Documentation Frontend](./commande-frontend/README.md)

## 🔧 Développement

### URLs par défaut

- **Backend API** : http://localhost:8000
- **Frontend** : http://localhost:3000

### Scripts utiles

#### Backend
```bash
# Tests
php artisan test

# Migration
php artisan migrate:fresh --seed

# Cache
php artisan cache:clear
php artisan config:clear
```

#### Frontend
```bash
# Développement
npm run dev

# Build production
npm run build

# Tests
npm run test
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT.
