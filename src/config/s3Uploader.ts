import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import mongoose from "mongoose";
import { ENV } from "./env";

// Initialize S3 client
const s3 = new S3Client({
    credentials: {
        accessKeyId: ENV.AWS_ACCESS_KEY_ID!,
        secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY!,
    },
    region: ENV.AWS_REGION || "us-east-1",
});

/**
 * Create a multer-S3 uploader
 * @param bucket - S3 bucket name
 * @param folder - optional folder in bucket
 * @param acl - optional ACL, default "public-read"
 */


export const createS3Uploader = (bucket: string, folder?: string) => {
    if (!bucket) throw new Error("AWS S3 bucket name is required");

    return multer({
        storage: multerS3({
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