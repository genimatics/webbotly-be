module.exports = {
  apps: [
    {
      name: "api",
      script: "dist/server.js",
      watch: false,
      exec_mode: "fork",
    },
    {
      name: "worker",
      script: "dist/workers/ingest.workers.js",
      watch: false,
      exec_mode: "fork",
    }
  ]
};