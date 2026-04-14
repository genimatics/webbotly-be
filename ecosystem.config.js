module.exports = {
  apps: [
    {
      name: "api",
      script: "dist/server.js",
      instances: 1,
      exec_mode: "fork",
    },
    {
      name: "worker",
      script: "dist/workers/ingest.workers.js",
      instances: 1,
      exec_mode: "fork",
    }
  ]
};