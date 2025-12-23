module.exports = {
  apps: [
    {
      name: 'middleware-bun-elysia-prod',
      script: 'src/index.ts', // Run TypeScript file
      args: '--loader=tsx',
      interpreter: 'bun', // 👈 Forces Bun instead of Node.js
      exec_mode: 'fork', // 👈 DO NOT use 'cluster' mode (PM2 does not support it for Bun)
      instances: 1, // Change to 'max' for multi-core scaling
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      max_restarts: 3,
      restart_delay: 5000,
      max_memory_restart: '1G',
      autorestart: true,
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
