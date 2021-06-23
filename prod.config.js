module.exports = {
  apps: [
    {
      name: "Kyrio POS API Server Version 2",
      script: "./bin/www",
      error_file: "../api_server_log/production/error.log",
      out_file: "../api_server_log/production/out.log",
      args: "one two",
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "1000M",
      exec_mode: "cluster",
      env: {
        PORT: 3002,
        NODE_ENV: "development",
        VERSION: "v1",
        MONGO_LIVE_URL: "mongodb+srv://kyrio-pos:kyrio@123@kyrio-pos-plir6.mongodb.net/test?retryWrites=true&w=majority",
        MONGO_LIVE_URL_WINDOWS_SERVER: "mongodb://kyrio-pos:kyrio_pos786A%25@localhost:27017/kyrio_pos_v2?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false",
        MONGO_LOCAL_URL: "mongodb://localhost:27017/kyrio_pos_v2",

        DEFAULT_DINING_TITLE_1: "Dine in",
        DEFAULT_DINING_TITLE_2: "Delivery",
        DEFAULT_DINING_TITLE_3: "Takeout",
        DEFAULT_PAYMENT_TYPE_1: "Cash",
        DEFAULT_PAYMENT_TYPE_2: "Card",
        DEFAULT_PAYMENT_TYPES_1: "Card",
        DEFAULT_PAYMENT_TYPES_2: "Check",
        DEFAULT_PAYMENT_TYPES_3: "Cash",
        DEFAULT_PAYMENT_TYPES_4: "Other"
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
