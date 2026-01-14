module.exports = {
  apps: [{
    name: 'commande-frontend',
    script: 'npm',
    args: 'start',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '300M', // Redémarre si la mémoire dépasse 300MB
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // Stratégie de redémarrage en cas d'erreur
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    // Désactiver le watch (pas nécessaire en production)
    ignore_watch: ['node_modules', 'logs', '.next/cache'],
    // Kill timeout en cas de problème
    kill_timeout: 5000,
    // Attendre que l'app soit prête avant de considérer qu'elle a démarré
    listen_timeout: 10000,
  }]
};
