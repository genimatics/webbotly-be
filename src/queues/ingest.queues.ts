import { Queue } from "bullmq";

export const ingestQueue = new Queue("ingest-queue", {
  connection: {
    host: "127.0.0.1", // EC2 → localhost Redis OR managed Redis
    port: 6379,
  },
});