"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestQueue = void 0;
const bullmq_1 = require("bullmq");
exports.ingestQueue = new bullmq_1.Queue("ingest-queue", {
    connection: {
        host: "127.0.0.1", // EC2 → localhost Redis OR managed Redis
        port: 6379,
    },
});
//# sourceMappingURL=ingest.queues.js.map