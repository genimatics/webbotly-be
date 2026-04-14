import { z } from "zod";


const envSchema = z.object({
  PORT: z.string(),
  MONGO_URI: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"]),
  JWT_SECRET: z.string().default("supersecretkey"),
  JWT_EXPIRES_IN: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_BUCKET_NAME: z.string(),
  AWS_SES_FROM_EMAIL: z.string().email(),
  FRONTEND_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed);
  process.exit(1);
}

export const ENV = parsed.data;