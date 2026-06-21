module.exports = {
  apps: [
    {
      name: "calorie-backend",
      cwd: "./backend",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
    },
    {
      name: "calorie-frontend",
      cwd: "./frontend",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
    },
    {
      name: "calorie-webhook",
      script: "webhook-server.js",
      env: {
        WEBHOOK_SECRET: "calorie-check-deploy-secret",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "200M",
    },
  ],
};
