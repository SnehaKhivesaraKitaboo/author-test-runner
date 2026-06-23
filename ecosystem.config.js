// PM2 process configuration for the EPUB Automation Tester (staging).
// Usage on the staging host:
//   npm ci --omit=dev=false   # Cypress + Puppeteer are needed at runtime
//   cp .env.staging.example .env  &&  edit .env
//   pm2 start ecosystem.config.js --env staging
//   pm2 save
module.exports = {
  apps: [
    {
      name: 'epub-automation-tester',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,            // run orchestration uses in-process state; keep single instance
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4321,
        OPEN_BROWSER: '0',
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 4321,
        OPEN_BROWSER: '0',
      },
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      merge_logs: true,
      time: true,
    },
  ],
};
