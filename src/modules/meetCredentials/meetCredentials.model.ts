// models/GoogleToken.ts
import mongoose, { Schema, Document } from "mongoose";

interface IGoogleToken extends Document {
  access_token: string;
  scope: string;
  token_type: string;
  refresh_token: string;
  googleEmail: string;
  expiry_date: number;
}

const GoogleTokenSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  access_token: { type: String, required: true },
  scope: { type: String, required: true },
  refresh_token: { type: String, required: true },
  googleEmail: { type: String, required: true },
  token_type: { type: String, required: true },
  expiry_date: { type: Number, required: true },
});

export default mongoose.model<IGoogleToken>("GoogleToken", GoogleTokenSchema);
