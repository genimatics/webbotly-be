import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  lastLogin?: Date;
  isActive: boolean;
  isDeleted: boolean;
  role: number;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },

    lastLogin: { type: Date },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    role: { type: Number, default: 0 },

    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);