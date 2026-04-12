"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string(),
    MONGO_URI: zod_1.z.string(),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]),
    JWT_SECRET: zod_1.z.string().default("supersecretkey"),
    JWT_EXPIRES_IN: zod_1.z.string(),
    AWS_ACCESS_KEY_ID: zod_1.z.string(),
    AWS_SECRET_ACCESS_KEY: zod_1.z.string(),
    AWS_REGION: zod_1.z.string(),
    AWS_BUCKET_NAME: zod_1.z.string(),
    AWS_SES_FROM_EMAIL: zod_1.z.string().email(),
    FRONTEND_URL: zod_1.z.string().url(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid environment variables", parsed);
    process.exit(1);
}
exports.ENV = parsed.data;
//# sourceMappingURL=env.js.map