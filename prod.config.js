module.exports = {
  apps: [
    {
      name: "Production Node.js Server",
      script: "./bin/www",
      error_file: "../api_server_log/production/error.log",
      out_file: "../api_server_log/production/out.log",
      args: "one two",
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "500M",
      exec_mode: "cluster",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
        VERSION: "v1"
      },
    },
  ],

  deploy: {
    production: {
      user: "node",
      host: "212.83.163.1",
      ref: "origin/master",
      repo: "git@github.com:repo.git",
      path: "/var/www/production",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production",
    },
  },
};
