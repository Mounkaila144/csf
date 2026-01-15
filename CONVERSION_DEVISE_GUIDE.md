# Guide de Conversion de Devises RMB ↔ XOF

**Date:** 2026-01-14
**Fonctionnalité:** Conversion automatique RMB (Yuan chinois) vers XOF (Franc CFA) avec taux de change en temps réel

---

## 📋 VUE D'ENSEMBLE

Ce système permet d'afficher les prix dans deux devises simultanément :
- **RMB (¥)** : Prix d'origine (monnaie chinoise)
- **XOF (FCFA)** : Prix convertis (monnaie ouest-africaine)

Le taux de change est mis à jour automatiquement via des APIs externes gratuites.

---

## 🏗️ ARCHITECTURE

### Backend (Laravel)

#### 1. **Base de données**
- **Table:** `exchange_rates`
- **Colonnes:**
  - `from_currency` : CNY (Yuan chinois)
  - `to_currency` : XOF (Franc CFA)
  - `rate` : Taux de change (6 décimales)
  - `fetched_at` : Date de récupération

#### 2. **Service CurrencyService**
**Fichier:** `app/Services/CurrencyService.php`

**Fonctionnalités:**
- Récupération des taux depuis des APIs externes
- Cache de 1h en mémoire (Redis/File)
- Fallback sur la base de données (valide 24h)
- Taux par défaut : 85 XOF = 1 CNY

**APIs utilisées:**
1. Principale : `https://api.exchangerate-api.com/v4/latest/CNY`
2. Secours : `https://open.er-api.com/v6/latest/CNY`

**Méthodes principales:**
```php
getExchangeRate('CNY', 'XOF') : float
convert($amount, 'CNY', 'XOF') : float
formatRMB($amount) : string
formatXOF($amount) : string
getPriceInfo($priceRMB) : array
```

#### 3. **Controller CurrencyController**
**Fichier:** `app/Http/Controllers/Api/CurrencyController.php`

**Routes API:**
- `GET /api/currency/rate` - Obtenir le taux actuel
- `POST /api/currency/convert` - Convertir un montant
- `POST /api/currency/price-info` - Info complète sur un prix

#### 4. **ProductController enrichi**
**Modifications:** Tous les produits retournés incluent maintenant `price_info` :

```json
{
  "id": 1,
  "name": "Produit",
  "price": 100,
  "price_rmb": 100,
  "price_xof": 8500,
  "price_info": {
    "rmb": {
      "amount": 100,
      "formatted": "¥ 100.00",
      "currency": "CNY",
      "symbol": "¥"
    },
    "xof": {
      "amount": 8500,
      "formatted": "8 500 FCFA",
      "currency": "XOF",
      "symbol": "FCFA"
    },
    "exchange_rate": 85.0,
    "updated_at": "2026-01-14T12:00:00Z"
  }
}
```

#### 5. **Commande Artisan**
**Fichier:** `app/Console/Commands/UpdateExchangeRates.php`

**Usage:**
```bash
# Mettre à jour les taux (utilise le cache si valide)
php artisan currency:update-rates

# Forcer la mise à jour (ignore le cache)
php artisan currency:update-rates --force
```

**Cron (recommandé):**
```bash
# Mettre à jour toutes les 6 heures
0 */6 * * * cd /var/www/hyperlink/hyperlinkbacken && php artisan currency:update-rates
```

---

### Frontend (Next.js)

#### 1. **Hook useCurrency**
**Fichier:** `src/hooks/useCurrency.ts`

**Fonctionnalités:**
- Récupère le taux depuis l'API backend
- Cache en localStorage pour utilisation offline
- Mise à jour automatique toutes les heures
- Fallback sur taux par défaut

**Usage:**
```typescript
import { useCurrency } from '../hooks/useCurrency';

const {
  exchangeRate,           // Taux actuel
  loading,               // État de chargement
  error,                 // Erreur éventuelle
  convertToXOF,          // Fonction de conversion
  formatRMB,             // Formater en RMB
  formatXOF,             // Formater en XOF
  getPriceInfo,          // Info complète
  refreshRate            // Forcer mise à jour
} = useCurrency();

// Convertir
const priceXOF = convertToXOF(100); // 8500

// Formater
const formatted = formatRMB(100); // "¥ 100.00"
```

#### 2. **Composant CurrencyDisplay**
**Fichier:** `src/components/CurrencyDisplay.tsx`

**Variantes:**
- `CurrencyDisplay` : Affichage vertical (par défaut)
- `InlineCurrencyDisplay` : Affichage horizontal

**Props:**
- `priceRMB` : Prix en RMB (requis)
- `showBothCurrencies` : Afficher les 2 devises (défaut: true)
- `primaryCurrency` : Devise principale ('RMB' ou 'XOF', défaut: 'XOF')
- `size` : Taille ('sm', 'md', 'lg', défaut: 'md')
- `className` : Classes CSS supplémentaires

**Exemples:**

```tsx
// Affichage standard (XOF en principal + RMB en secondaire)
<CurrencyDisplay priceRMB={100} />

// Affichage RMB en principal
<CurrencyDisplay
  priceRMB={100}
  primaryCurrency="RMB"
/>

// Seulement XOF
<CurrencyDisplay
  priceRMB={100}
  showBothCurrencies={false}
  primaryCurrency="XOF"
/>

// Grande taille
<CurrencyDisplay
  priceRMB={100}
  size="lg"
/>

// Inline (sur une ligne)
<InlineCurrencyDisplay priceRMB={100} />
```

#### 3. **ProductCard modifié**
**Fichier:** `src/components/ProductCard.tsx`

Le composant utilise maintenant `CurrencyDisplay` pour afficher les prix dans les deux devises.

---

## 🚀 DÉPLOIEMENT

### 1. Backend (Laravel)

```bash
cd /var/www/hyperlink/hyperlinkbacken

# Pull les changements
git pull origin main

# Exécuter la migration
php artisan migrate

# Tester la mise à jour des taux
php artisan currency:update-rates --force

# Vérifier le taux
php artisan tinker
>>> app(App\Services\CurrencyService::class)->getExchangeRate();

# Nettoyer et reconstruire les caches
php artisan config:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache

# Redémarrer PHP-FPM
sudo systemctl restart php8.2-fpm
```

#### Ajouter au Cron

```bash
sudo crontab -e
```

Ajouter cette ligne :
```bash
# Mise à jour des taux de change toutes les 6 heures
0 */6 * * * cd /var/www/hyperlink/hyperlinkbacken && /usr/bin/php8.2 artisan currency:update-rates >> /var/log/currency-update.log 2>&1
```

### 2. Frontend (Next.js)

```bash
cd /var/www/hyperlink

# Pull les changements
git pull origin main

# Installer les dépendances (si nécessaire)
npm install

# Rebuild
npm run build

# Redémarrer PM2
pm2 restart commande-frontend

# Vérifier les logs
pm2 logs commande-frontend --lines 50
```

---

## 🧪 TESTS

### 1. Tester l'API Backend

```bash
# Obtenir le taux actuel
curl https://hyperlink.ptrniger.com/api/currency/rate

# Convertir un montant
curl -X POST https://hyperlink.ptrniger.com/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from": "CNY", "to": "XOF"}'

# Info prix
curl -X POST https://hyperlink.ptrniger.com/api/currency/price-info \
  -H "Content-Type: application/json" \
  -d '{"price": 100}'
```

### 2. Tester dans le navigateur

1. Ouvrir `https://hyperlink.ptrniger.com`
2. Vérifier que les produits affichent les deux devises
3. Vérifier dans DevTools > Network > currency/rate
4. Vérifier localStorage : `currency_rate`

---

## 🔍 MONITORING

### Vérifier les taux

```bash
# Dans la base de données
mysql -u root -p hyperlink_db
SELECT * FROM exchange_rates ORDER BY fetched_at DESC LIMIT 1;

# Via l'API
curl https://hyperlink.ptrniger.com/api/currency/rate | jq

# Logs de mise à jour
tail -f /var/log/currency-update.log
```

### Vérifier le cache

```bash
php artisan tinker
>>> Cache::get('exchange_rate_CNY_XOF');
```

---

## ⚙️ CONFIGURATION

### Variables d'environnement

**Backend (.env):**
```env
# Aucune clé API nécessaire (APIs gratuites)
# Optionnel : configurer Redis pour meilleur cache
CACHE_DRIVER=redis  # ou 'file' par défaut
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_BASE_URL=https://hyperlink.ptrniger.com/api
```

### Taux de fallback

Si toutes les APIs échouent, le système utilise un taux par défaut :
- **Fichier:** `app/Services/CurrencyService.php`
- **Ligne 82:** `return 85.0;`

**À mettre à jour régulièrement !**

---

## 🎨 PERSONNALISATION

### Changer la devise principale

**Dans ProductCard.tsx:**
```tsx
<CurrencyDisplay
  priceRMB={product.price}
  primaryCurrency="RMB"  // Afficher RMB en premier
/>
```

### Changer le format d'affichage

**Dans useCurrency.ts:**
```typescript
const formatXOF = (amount: number): string => {
  // Personnaliser le format
  return amount.toLocaleString('fr-FR') + ' F CFA';
};
```

### Ajouter d'autres devises

1. Modifier `CurrencyService.php` :
```php
public function getExchangeRate(string $from = 'CNY', string $to = 'USD'): float
```

2. Ajouter la route :
```php
Route::get('currency/rate/usd', ...);
```

3. Créer un nouveau hook :
```typescript
export const useCurrencyUSD = () => { ... };
```

---

## 📊 PERFORMANCE

### Cache Strategy

```
Requête → Cache Redis (1h)
  ↓ Miss
Base de données (24h)
  ↓ Périmé
API externe
  ↓ Échec
Taux fallback (85.0)
```

### Temps de réponse attendus

- **Cache hit:** < 10ms
- **DB hit:** < 50ms
- **API call:** 200-500ms
- **Fallback:** < 5ms

---

## 🐛 DÉPANNAGE

### Le taux ne se met pas à jour

```bash
# Forcer la mise à jour
php artisan currency:update-rates --force

# Vérifier les logs
tail -f storage/logs/laravel.log | grep currency

# Tester l'API manuellement
curl https://api.exchangerate-api.com/v4/latest/CNY
```

### Le frontend affiche toujours le taux par défaut

1. Vérifier que l'API backend répond :
```bash
curl https://hyperlink.ptrniger.com/api/currency/rate
```

2. Vider le cache navigateur et localStorage

3. Vérifier les erreurs dans la console browser

### Les prix ne s'affichent pas

1. Vérifier que `price` existe dans les produits
2. Vérifier que `CurrencyDisplay` est bien importé
3. Vérifier les erreurs TypeScript :
```bash
npm run build
```

---

## 📚 APIS GRATUITES ALTERNATIVES

Si les APIs actuelles ne fonctionnent plus :

1. **ExchangeRate-API** (gratuit, 1500 req/mois)
   - https://www.exchangerate-api.com/

2. **Open Exchange Rates** (gratuit, 1000 req/mois)
   - https://openexchangerates.org/

3. **Fixer** (gratuit, 100 req/mois)
   - https://fixer.io/

4. **CurrencyAPI** (gratuit, 300 req/mois)
   - https://currencyapi.com/

**Pour changer d'API :** Modifier `CurrencyService.php` ligne 19-21

---

## ✅ CHECKLIST POST-DÉPLOIEMENT

- [ ] Migration `exchange_rates` exécutée
- [ ] Taux de change récupéré avec succès
- [ ] API `/api/currency/rate` répond
- [ ] Cron ajouté pour mise à jour automatique
- [ ] Frontend affiche les deux devises
- [ ] Cache fonctionne (vérifier logs)
- [ ] Tests manuels effectués
- [ ] Monitoring configuré

---

## 📞 SUPPORT

En cas de problème :

1. Vérifier les logs Laravel : `storage/logs/laravel.log`
2. Vérifier les logs PM2 : `pm2 logs commande-frontend`
3. Vérifier les logs cron : `/var/log/currency-update.log`
4. Tester l'API manuellement
5. Vérifier la connexion internet du serveur

**Le système continue de fonctionner même si les APIs externes sont down grâce au cache multi-niveaux et au taux de fallback.**
