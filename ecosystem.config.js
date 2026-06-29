// PM2 process config for ekkieinn.is (production).
// Used by the GitHub Actions deploy workflow:
//   pm2 start ecosystem.config.js  /  pm2 restart ekkieinn
module.exports = {
  apps: [
    {
      name: "ekkieinn",
      script: "node_modules/.bin/next",
      args: "start -p 3002",
      cwd: "/home/deploy/karlmenn",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3002",
      },
    },
  ],
};
