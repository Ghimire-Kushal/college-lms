module.exports = {
  apps: [{
    name: 'lms-api',
    script: 'server.js',

    // Cluster mode: one worker per CPU core (10 on this machine)
    // Multiplies throughput by ~10x vs single-process
    instances: 'max',
    exec_mode: 'cluster',

    // Auto-restart if memory exceeds 512MB per worker
    max_memory_restart: '512M',

    // Restart strategy: exponential backoff, max 10 restarts per minute
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    min_uptime: '5s',

    // Zero-downtime deploys: wait for new workers before killing old ones
    wait_ready: true,
    listen_timeout: 8000,
    kill_timeout: 5000,

    env: {
      NODE_ENV: 'development',
      PORT: 5001,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5001,
    },

    // Log rotation
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    out_file: './logs/out.log',
    error_file: './logs/error.log',
  }],
};
