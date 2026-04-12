import mongoose from "mongoose";
import { ENV } from "./env";

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
  } catch (error) {
    console.error("❌ DB connection failed");
    process.exit(1);
  }
};