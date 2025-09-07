# Guide de Déploiement - Commandes Sans Frontière

Ce guide détaille les étapes pour déployer l'application e-commerce sur le serveur avec Apache et PHP 8.2.

## Informations du Serveur
- **Chemin du projet**: `/var/www/csf/`
- **Domaine**: `commandesansfrontiere.com`
- **PHP Version**: 8.2
- **Serveur Web**: Apache avec SSL

## 1. Préparation du Backend Laravel

### Installation et Configuration
```bash
# Aller dans le répertoire backend
cd /var/www/csf/commande-backend

# Installer les dépendances Composer (production)
composer install --optimize-autoloader --no-dev

# Copier et configurer l'environnement
cp .env.example .env
nano .env
```

### Configuration .env pour la Production
```env
APP_NAME="Commandes Sans Frontière"
APP_ENV=production
APP_KEY=base64:VOTRE_CLE_GENEREE
APP_DEBUG=false
APP_URL=https://commandesansfrontiere.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=commande_db
DB_USERNAME=commande_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE

# JWT Configuration
JWT_SECRET=VOTRE_JWT_SECRET

# Queue Configuration
QUEUE_CONNECTION=database

# Cache Configuration
CACHE_DRIVER=file
SESSION_DRIVER=file
```

### Commandes de Déploiement Laravel
```bash
# Générer la clé d'application
/usr/bin/php8.2 artisan key:generate

# Exécuter les migrations
/usr/bin/php8.2 artisan migrate --force

# Optimisations pour la production
/usr/bin/php8.2 artisan config:cache
/usr/bin/php8.2 artisan route:cache
/usr/bin/php8.2 artisan view:cache
/usr/bin/php8.2 artisan event:cache

# Appliquer les modifications CORS
/usr/bin/php8.2 artisan config:clear
/usr/bin/php8.2 artisan config:cache

# Créer le lien symbolique pour le storage
/usr/bin/php8.2 artisan storage:link

# Installer les dépendances Node.js et construire les assets
npm install
npm run build
```

## 2. Préparation du Frontend Next.js

### Configuration des Variables d'Environnement
```bash
# Aller dans le répertoire frontend
cd /var/www/csf/commande-frontend

# Copier et configurer l'environnement
cp .env.local.example .env.local
nano .env.local
```

### Configuration .env.local pour la Production
```env
# Backend API URLs
NEXT_PUBLIC_BACKEND_URL=https://commandesansfrontiere.com
NEXT_PUBLIC_API_BASE_URL=https://commandesansfrontiere.com/api

# Environnement
NODE_ENV=production
```

### Commandes de Déploiement Next.js
```bash
# Installer les dépendances
npm install

# Construire pour la production
npm run build

# Installer PM2 globalement (si pas déjà installé)
npm install -g pm2

# Démarrer l'application Next.js avec PM2
pm2 start npm --name "commande-frontend" -- start

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
```

## 3. Configuration Apache

### Créer le fichier VirtualHost
Créer le fichier `/etc/apache2/sites-available/commandesansfrontiere.com.conf` :

```apache
<VirtualHost *:443>
    ServerName commandesansfrontiere.com
    DocumentRoot /var/www/csf/commande-backend/public

    # Configuration SSL
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/commandesansfrontiere.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/commandesansfrontiere.com/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf

    # Configuration PHP 8.2
    <FilesMatch \.php$>
        SetHandler "proxy:unix:/var/run/php/php8.2-fpm.sock|fcgi://localhost"
    </FilesMatch>

    # Configuration du répertoire Laravel
    <Directory /var/www/csf/commande-backend/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Configuration pour Laravel
        RewriteEngine On

        # Proxy pour l'API vers le backend Laravel
        RewriteCond %{REQUEST_URI} ^/api/
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^(.*)$ index.php [QSA,L]

        # Proxy pour le frontend Next.js (toutes les autres requêtes)
        RewriteCond %{REQUEST_URI} !^/api/
        RewriteCond %{REQUEST_URI} !^/storage/
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
    </Directory>

    # Sécurité - Bloquer l'accès aux fichiers sensibles
    <Directory /var/www/csf/commande-backend>
        <Files ".env">
            Require all denied
        </Files>
        <Files "composer.json">
            Require all denied
        </Files>
        <Files "composer.lock">
            Require all denied
        </Files>
        <Files "artisan">
            Require all denied
        </Files>
    </Directory>

    # Bloquer l'accès aux dossiers Laravel sensibles
    <DirectoryMatch "^/var/www/csf/commande-backend/(app|bootstrap|config|database|resources|routes|tests|vendor)">
        Require all denied
    </DirectoryMatch>

    # Headers de sécurité
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"

    # Compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/plain
        AddOutputFilterByType DEFLATE text/html
        AddOutputFilterByType DEFLATE text/xml
        AddOutputFilterByType DEFLATE text/css
        AddOutputFilterByType DEFLATE application/xml
        AddOutputFilterByType DEFLATE application/xhtml+xml
        AddOutputFilterByType DEFLATE application/rss+xml
        AddOutputFilterByType DEFLATE application/javascript
        AddOutputFilterByType DEFLATE application/x-javascript
        AddOutputFilterByType DEFLATE application/json
    </IfModule>

    # Cache pour les assets statiques
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/svg+xml "access plus 1 year"
        ExpiresByType image/webp "access plus 1 year"
        ExpiresByType font/woff "access plus 1 year"
        ExpiresByType font/woff2 "access plus 1 year"
    </IfModule>

    # Logs spécifiques
    LogLevel info
    ErrorLog   ${APACHE_LOG_DIR}/commandesansfrontiere-error.log
    CustomLog  ${APACHE_LOG_DIR}/commandesansfrontiere-access.log combined
</VirtualHost>

# Redirection HTTP vers HTTPS
<VirtualHost *:80>
    ServerName commandesansfrontiere.com
    DocumentRoot /var/www/csf/commande-backend/public

    # Redirection permanente vers HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

    # Logs pour le HTTP aussi
    ErrorLog   ${APACHE_LOG_DIR}/commandesansfrontiere-http-error.log
    CustomLog  ${APACHE_LOG_DIR}/commandesansfrontiere-http-access.log combined
</VirtualHost>
```

### Activation du Site
```bash
# Activer les modules Apache nécessaires
a2enmod proxy
a2enmod proxy_http
a2enmod rewrite
a2enmod ssl
a2enmod headers
a2enmod deflate
a2enmod expires

# Activer le site
a2ensite commandesansfrontiere.com.conf

# Tester la configuration Apache
apache2ctl configtest

# Redémarrer Apache
systemctl reload apache2
```

## 4. Configuration des Permissions

```bash
# Configurer les permissions pour Laravel
sudo chown -R www-data:www-data /var/www/csf/commande-backend
sudo chmod -R 755 /var/www/csf/commande-backend
sudo chmod -R 775 /var/www/csf/commande-backend/storage
sudo chmod -R 775 /var/www/csf/commande-backend/bootstrap/cache

# Sécuriser le fichier .env
sudo chmod 600 /var/www/csf/commande-backend/.env

# Configurer les permissions pour Next.js
sudo chown -R www-data:www-data /var/www/csf/commande-frontend
sudo chmod -R 755 /var/www/csf/commande-frontend
```

## 5. Configuration SSL avec Let's Encrypt

```bash
# Installer Certbot (si pas déjà installé)
sudo apt update
sudo apt install certbot python3-certbot-apache

# Obtenir le certificat SSL pour le domaine
sudo certbot --apache -d commandesansfrontiere.com

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run

# Configurer le renouvellement automatique (crontab)
sudo crontab -e
# Ajouter cette ligne :
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 6. Configuration de la Base de Données

```bash
# Se connecter à MySQL
sudo mysql -u root -p

# Créer la base de données et l'utilisateur
CREATE DATABASE commande_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'commande_user'@'localhost' IDENTIFIED BY 'VOTRE_MOT_DE_PASSE_SECURISE';
GRANT ALL PRIVILEGES ON commande_db.* TO 'commande_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Exécuter les migrations
cd /var/www/csf/commande-backend
/usr/bin/php8.2 artisan migrate --force

# Optionnel : Exécuter les seeders
/usr/bin/php8.2 artisan db:seed --force
```

## 7. Vérifications Post-Déploiement

### Vérifier les Services
```bash
# Vérifier Apache
sudo systemctl status apache2

# Vérifier PHP-FPM 8.2
sudo systemctl status php8.2-fpm

# Vérifier PM2
pm2 status

# Vérifier les logs
sudo tail -f /var/log/apache2/commandesansfrontiere-error.log
pm2 logs commande-frontend --lines 20
```

### Vérifier les Variables d'Environnement
```bash
# Vérifier que les variables sont correctes
cd /var/www/csf/commande-frontend
cat .env.local

# Les URLs doivent pointer vers le domaine de production :
# NEXT_PUBLIC_BACKEND_URL=https://commandesansfrontiere.com
# NEXT_PUBLIC_API_BASE_URL=https://commandesansfrontiere.com/api
```

### Tests Fonctionnels
1. **Frontend** : Accéder à `https://commandesansfrontiere.com`
2. **API Backend** : Tester `https://commandesansfrontiere.com/api/health`
3. **Storage** : Vérifier l'accès aux images `https://commandesansfrontiere.com/storage/`

## 8. Maintenance et Mises à Jour

### Commandes de Maintenance Laravel
```bash
# Nettoyer les caches
/usr/bin/php8.2 artisan cache:clear
/usr/bin/php8.2 artisan config:clear
/usr/bin/php8.2 artisan route:clear
/usr/bin/php8.2 artisan view:clear

# Reconstruire les caches
/usr/bin/php8.2 artisan config:cache
/usr/bin/php8.2 artisan route:cache
/usr/bin/php8.2 artisan view:cache

# Migrations
/usr/bin/php8.2 artisan migrate --force
```

### Commandes de Maintenance Next.js
```bash
# Redéployer le frontend
cd /var/www/csf/commande-frontend
npm run build
pm2 restart commande-frontend

# Vérifier les logs PM2
pm2 logs commande-frontend

# Redémarrer PM2 si nécessaire
pm2 restart commande-frontend
pm2 status
```

## 9. Sauvegarde

### Script de Sauvegarde Automatique
```bash
#!/bin/bash
# /usr/local/bin/backup-commande.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/commande"
PROJECT_DIR="/var/www/csf"

# Créer le répertoire de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarder la base de données
mysqldump -u commande_user -p'VOTRE_MOT_DE_PASSE' commande_db > $BACKUP_DIR/commande_db_$DATE.sql

# Sauvegarder les fichiers
tar -czf $BACKUP_DIR/commande_files_$DATE.tar.gz -C $PROJECT_DIR .

# Nettoyer les anciennes sauvegardes (garder 7 jours)
find $BACKUP_DIR -type f -mtime +7 -delete
```

### Configurer la Sauvegarde Automatique
```bash
# Rendre le script exécutable
sudo chmod +x /usr/local/bin/backup-commande.sh

# Ajouter au crontab pour une sauvegarde quotidienne à 2h du matin
sudo crontab -e
# Ajouter : 0 2 * * * /usr/local/bin/backup-commande.sh
```

## 10. Surveillance et Logs

### Fichiers de Logs Importants
- Apache : `/var/log/apache2/commandesansfrontiere-error.log`
- Laravel : `/var/www/csf/commande-backend/storage/logs/laravel.log`
- PM2 : `pm2 logs commande-frontend`

### Commandes de Surveillance
```bash
# Surveiller les logs en temps réel
sudo tail -f /var/log/apache2/commandesansfrontiere-error.log
sudo tail -f /var/www/csf/commande-backend/storage/logs/laravel.log
pm2 logs commande-frontend --lines 50

# Vérifier l'espace disque
df -h

# Vérifier l'utilisation mémoire
free -h

# Vérifier les processus
ps aux | grep php
ps aux | grep node
```

---

**Note** : Remplacer tous les `VOTRE_MOT_DE_PASSE` et `VOTRE_CLE` par des valeurs sécurisées réelles lors du déploiement.