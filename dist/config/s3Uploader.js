"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createS3Uploader = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const env_1 = require("./env");
// Initialize S3 client
const s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: env_1.ENV.AWS_ACCESS_KEY_ID,
        secretAccessKey: env_1.ENV.AWS_SECRET_ACCESS_KEY,
    },
    region: env_1.ENV.AWS_REGION || "us-east-1",
});
/**
 * Create a multer-S3 uploader
 * @param bucket - S3 bucket name
 * @param folder - optional folder in bucket
 * @param acl - optional ACL, default "public-read"
 */
const createS3Uploader = (bucket, folder) => {
    if (!bucket)
        throw new Error("AWS S3 bucket name is required");
    return (0, multer_1.default)({
        storage: (0, multer_s3_1.default)({
            s3,
            bucket,
            // acl: "public-read", <-- REMOVE THIS
            metadata: (_, file, cb) => cb(null, { fieldName: file.fieldname }),
            key: (_, file, cb) => {
                const path = folder ? `${folder}/` : "";
                cb(null, `${path}${Date.now()}-${file.originalname}`);
            },
        }),
    });
};
exports.createS3Uploader = createS3Uploader;
//# sourceMappingURL=s3Uploader.js.map